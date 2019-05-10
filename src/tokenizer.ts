export class CSSToken {
    type = ''
    value = ''
    raw = ''
    range = [0, 0]
}

const Reg = {
    get classSelector() {
        return /^((\.|#)?[A-z][A-z0-9-_]*)\s*{/
    },
    get blockStart() {
        return /^\{/
    },
    get blockEnd() {
        return /^\}/
    },
    get propertyName() {
        return /(^[A-z][A-z0-9-]+)\s*:/
    },
    get propertyValue() {
        return /^([^;]*);/
    },
    get space() {
        return /^\s+/
    }
}

export function tokenizer(src: String = ''): CSSToken[] {
    const tokens: CSSToken[] = []
    let copyStr = src
    let index = 0

    function getPrevToken() {
        const token = tokens[tokens.length - 1]
        return token || new CSSToken()
    }

    function next() {
        // selector
        copyStr = src.slice(index)
        if (index >= src.length) {
            return
        }

        const token = new CSSToken()

        let [matchResult] = copyStr.match(Reg.space) || ['']
        let realValue = ''
        if (matchResult) {
            index += matchResult.length
            // token.type = 'space'
            // token.value = matchResult
            // tokens.push(token)
            next()
            return
        }

        // selector .aa #ss div { 后面必须要有blockStart
        [matchResult, realValue = matchResult] = copyStr.match(Reg.classSelector) || ['']
        if (matchResult) {
            index += matchResult.length
            token.type = 'classSelector'
            token.value = realValue
            tokens.push(token)

            // 开始
            const startNode = new CSSToken()
            startNode.type = 'blockStart'
            startNode.value = matchResult
            tokens.push(startNode)
            next()
            return
        }

        // 向后看一个
        [matchResult] = copyStr.match(Reg.blockStart) || ['']
        if (matchResult) {
            index += matchResult.length
            token.type = 'blockStart'
            token.value = matchResult
            tokens.push(token)
            next()
            return
        }

        [matchResult] = copyStr.match(Reg.blockEnd) || ['']
        if (matchResult) {
            index += matchResult.length
            token.type = 'blockEnd'
            token.value = matchResult
            tokens.push(token)
            next()
            return
        }

        [matchResult, realValue = matchResult] = copyStr.match(Reg.propertyName) || ['']
        if (matchResult) {
            index += matchResult.length
            token.type = 'propertyName'
            token.value = realValue
            tokens.push(token)
            next()
            return
        }

        // 前一个必须是属性名
        if (getPrevToken().type === 'propertyName') {
            [matchResult, realValue = matchResult] = copyStr.match(Reg.propertyValue) || ['']
            if (matchResult) {
                index += matchResult.length
                token.type = 'propertyValue'
                token.value = realValue
                tokens.push(token)
                next()
                return
            }
        }

        console.log(tokens)
        throw new Error(`parse error at ${index}-> ${src.slice(index)}`)
    }

    next()

    console.log(tokens)
    return tokens;
}
