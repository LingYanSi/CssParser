import { CSSToken } from "./tokenizer";

export class AST {
    tag = ''
    constructor() {

    }
}

export function toAST(tokens: CSSToken[] = []): AST {
    let root = new AST()

    return root;
}
