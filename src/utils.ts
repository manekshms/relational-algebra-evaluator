export const isWord = (text: string): boolean =>
  text !== undefined && /[A-Za-z_0-9]/.test(text);
export const isParenthesis = (text: string): boolean =>
  text === '(' || text === ')';
export const isParenthesisOpen = (text: string): boolean => text === '(';
export const isParenthesisClosed = (text: string): boolean => text === ')';
export const isForwardSlash = (text: string): boolean => text === '/';
export const isReservedKeyWord = (text: string): boolean =>
  ['P', 'X', 'S', 'SD', 'U', 'R', 'var', 'show', 'view'].includes(text);

export const isOperator = (text: string): boolean => ['=', ','].includes(text);
export const pop = <T>(arr: T[]): T | undefined => arr.shift();
export const peek = <T>(arr: T[]): T => arr[0];
