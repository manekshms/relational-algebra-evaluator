import { tokenize } from '../src/tokenize';

describe('Tokenize', () => {
  test('It should tokenize Name type', () => {
    const result = tokenize('data');
    expect(result).toEqual([{ type: 'Name', value: 'data' }]);
  });

  test('It should tokenize Opening parenthesis', () => {
    const result = tokenize('(');
    expect(result).toEqual([{ type: 'Parenthesis', value: '(' }]);
  });

  test('It should tokenize Closing parenthesis', () => {
    const result = tokenize(')');
    expect(result).toEqual([{ type: 'Parenthesis', value: ')' }]);
  });

  test('It should tokenize ForwardSlash type', () => {
    const result = tokenize('/');
    expect(result).toEqual([{ type: 'ForwardSlash', value: '/' }]);
  });

  test('It shoud tokenize Operator "=" type', () => {
    const result = tokenize('=');
    expect(result).toEqual([{ type: 'Operator', value: '=' }]);
  });

  test('It shoud tokenize Operator "," type', () => {
    const result = tokenize(',');
    expect(result).toEqual([{ type: 'Operator', value: ',' }]);
  });
});
