import * as utils from './utils';

export type Token = { type: string; value: string };

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let cursor = 0;
  while (cursor < input.length) {
    // word
    if (utils.isWord(input[cursor])) {
      let word = input[cursor];
      while (utils.isWord(input[++cursor])) {
        word += input[cursor];
      }
      tokens.push({ type: 'Name', value: word });
      continue;
    }
    // parenthesis
    if (utils.isParenthesis(input[cursor])) {
      tokens.push({ type: 'Parenthesis', value: input[cursor] });
      cursor++;
      continue;
    }
    // forward slash
    if (utils.isForwardSlash(input[cursor])) {
      tokens.push({ type: 'ForwardSlash', value: input[cursor] });
      cursor++;
      continue;
    }
    // is operator
    if (utils.isOperator(input[cursor])) {
      tokens.push({ type: 'Operator', value: input[cursor] });
      cursor++;
      continue;
    }
    // empty space
    if (input[cursor] === ' ') {
      cursor++;
      continue;
    }

    throw new Error(`Invalid token ${input[cursor]}`);
  }
  return tokens;
}
