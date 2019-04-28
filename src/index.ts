import { tokenizer } from "./tokenizer";
import { toAST } from "./toAST";
import { transform } from "./transform";

export default function parse(src = ''): String {
    const tokens = tokenizer(src)
    const ast = toAST(tokens)
    return transform(ast)
}
