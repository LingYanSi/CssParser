import { ASTNode } from "./toAST";

const IDENT_SPACE = 4
function getIdent(ident: number) {
    return ' '.repeat(IDENT_SPACE * ident)
}

function getParentsSelector(node: ASTNode): [string, number] {
    let str = ''
    let ident = 0
    while (node && node.selector) {
        str = `${node.selector} ${str}`
        node = node.parent
        ident += 1
    }
    return [str.trim(), ident]
}

export function transform(root: ASTNode): String {
    let cssStr = ''

    function handleNode(node: ASTNode) {
        const [realSelector, ident] = getParentsSelector(node)
        cssStr += `${realSelector} {${node.properties.map(i => `\n${getIdent(1)}${i.key}: ${i.value};`)}\n}\n`
        node.children.forEach(node => handleNode(node))
    }

    root.children.forEach(node => handleNode(node))
    return cssStr
}
