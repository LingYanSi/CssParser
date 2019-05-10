(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.cssParser = factory());
}(this, function () { 'use strict';

    var CSSToken = (function () {
        function CSSToken() {
            this.type = '';
            this.value = '';
            this.raw = '';
            this.range = [0, 0];
        }
        return CSSToken;
    }());
    var Reg = {
        get classSelector() {
            return /^((\.|#)?[A-z][A-z0-9-_]*)\s*{/;
        },
        get blockStart() {
            return /^\{/;
        },
        get blockEnd() {
            return /^\}/;
        },
        get propertyName() {
            return /(^[A-z][A-z0-9-]+)\s*:/;
        },
        get propertyValue() {
            return /^([^;]*);/;
        },
        get space() {
            return /^\s+/;
        }
    };
    function tokenizer(src) {
        if (src === void 0) { src = ''; }
        var tokens = [];
        var copyStr = src;
        var index = 0;
        function getPrevToken() {
            var token = tokens[tokens.length - 1];
            return token || new CSSToken();
        }
        function next() {
            var _a, _b, _c, _d, _e, _f;
            copyStr = src.slice(index);
            if (index >= src.length) {
                return;
            }
            var token = new CSSToken();
            var matchResult = (copyStr.match(Reg.space) || [''])[0];
            var realValue = '';
            if (matchResult) {
                index += matchResult.length;
                next();
                return;
            }
            _a = copyStr.match(Reg.classSelector) || [''], matchResult = _a[0], _b = _a[1], realValue = _b === void 0 ? matchResult : _b;
            if (matchResult) {
                index += matchResult.length;
                token.type = 'classSelector';
                token.value = realValue;
                tokens.push(token);
                var startNode = new CSSToken();
                startNode.type = 'blockStart';
                startNode.value = matchResult;
                tokens.push(startNode);
                next();
                return;
            }
            matchResult = (copyStr.match(Reg.blockStart) || [''])[0];
            if (matchResult) {
                index += matchResult.length;
                token.type = 'blockStart';
                token.value = matchResult;
                tokens.push(token);
                next();
                return;
            }
            matchResult = (copyStr.match(Reg.blockEnd) || [''])[0];
            if (matchResult) {
                index += matchResult.length;
                token.type = 'blockEnd';
                token.value = matchResult;
                tokens.push(token);
                next();
                return;
            }
            _c = copyStr.match(Reg.propertyName) || [''], matchResult = _c[0], _d = _c[1], realValue = _d === void 0 ? matchResult : _d;
            if (matchResult) {
                index += matchResult.length;
                token.type = 'propertyName';
                token.value = realValue;
                tokens.push(token);
                next();
                return;
            }
            if (getPrevToken().type === 'propertyName') {
                _e = copyStr.match(Reg.propertyValue) || [''], matchResult = _e[0], _f = _e[1], realValue = _f === void 0 ? matchResult : _f;
                if (matchResult) {
                    index += matchResult.length;
                    token.type = 'propertyValue';
                    token.value = realValue;
                    tokens.push(token);
                    next();
                    return;
                }
            }
            console.log(tokens);
            throw new Error("parse error at " + index + "-> " + src.slice(index));
        }
        next();
        console.log(tokens);
        return tokens;
    }

    var ASTNode = (function () {
        function ASTNode(selector) {
            this.selector = '';
            this.properties = [];
            this.children = [];
            this.selector = selector;
        }
        ASTNode.prototype.setParent = function (parent) {
            this.parent = parent;
            parent.children.push(this);
            return this;
        };
        return ASTNode;
    }());
    function toAST(tokens) {
        if (tokens === void 0) { tokens = []; }
        var root = new ASTNode('');
        var index = 0;
        var currentNode = root;
        var scopeCache = [];
        function changeScope(node) {
            scopeCache.push(currentNode);
            currentNode = node;
        }
        function popScope() {
            currentNode = scopeCache.pop();
        }
        function getToken(offset) {
            return tokens[index + offset] || new CSSToken();
        }
        function next() {
            var token = tokens[index];
            if (!token) {
                return;
            }
            if (token.type === 'classSelector' && getToken(1).type === 'blockStart') {
                var newNode = new ASTNode(token.value);
                newNode.setParent(currentNode);
                changeScope(newNode);
                index += 2;
                return next();
            }
            if (token.type === 'propertyName' && getToken(1).type === 'propertyValue') {
                currentNode.properties.push({
                    key: token.value,
                    value: getToken(1).value,
                });
                index += 2;
                next();
                return;
            }
            if (token.type === 'blockEnd') {
                popScope();
                index += 1;
                next();
                return;
            }
            console.log(tokens, tokens[index]);
            throw new Error("canot ast token " + index);
        }
        next();
        console.log(root);
        return root;
    }

    var IDENT_SPACE = 4;
    function getIdent(ident) {
        return ' '.repeat(IDENT_SPACE * ident);
    }
    function getParentsSelector(node) {
        var str = '';
        var ident = 0;
        while (node && node.selector) {
            str = node.selector + " " + str;
            node = node.parent;
            ident += 1;
        }
        return [str.trim(), ident];
    }
    function transform(root) {
        var cssStr = '';
        function handleNode(node) {
            var _a = getParentsSelector(node), realSelector = _a[0];
            cssStr += realSelector + " {" + node.properties.map(function (i) { return "\n" + getIdent(1) + i.key + ": " + i.value + ";"; }) + "\n}\n";
            node.children.forEach(function (node) { return handleNode(node); });
        }
        root.children.forEach(function (node) { return handleNode(node); });
        return cssStr;
    }

    function parse(src) {
        if (src === void 0) { src = ''; }
        var tokens = tokenizer(src);
        var ast = toAST(tokens);
        return transform(ast);
    }

    return parse;

}));
