import { CSSToken } from "./tokenizer";

export class ASTNode {
    parent: ASTNode
    selector = ''
    properties = []
    children: ASTNode[] = []
    constructor(selector: string) {
        this.selector = selector
    }
    setParent(parent: ASTNode) {
        this.parent = parent
        parent.children.push(this)
        return this
    }
}

export function toAST(tokens: CSSToken[] = []): ASTNode {
    let root = new ASTNode('')
    let index = 0
    let currentNode = root

    let scopeCache = []
    function changeScope(node) {
        scopeCache.push(currentNode)
        currentNode = node
    }

    function popScope() {
        currentNode = scopeCache.pop()
    }

    function getToken(offset) {
        return tokens[index + offset] || new CSSToken()
    }

    function next() {
        let token = tokens[index]
        if (!token) {
            return
        }

        // 做一些其他事情
        if (token.type === 'classSelector' && getToken(1).type === 'blockStart') {
            let newNode = new ASTNode(token.value)
            newNode.setParent(currentNode)
            changeScope(newNode)
            index += 2
            return next()
        }

        if (token.type === 'propertyName' && getToken(1).type === 'propertyValue') {
            currentNode.properties.push({
                key: token.value,
                value: getToken(1).value,
            })
            index += 2
            next()
            return
        }

        if (token.type === 'blockEnd') {
            popScope()
            index += 1
            next()
            return
        }

        console.log(tokens, tokens[index])
        throw new Error(`canot ast token ${index}`)
    }

    next()

    console.log(root)
    return root;
}
