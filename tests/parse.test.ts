import { parse } from '../src/parse';

describe('Parse', () => {
  test('It should parse Projection', () => {
    const token = [
      { type: 'Name', value: 'P' },
      { type: 'ForwardSlash', value: '/' },
      { type: 'Name', value: 'age' },
      { type: 'Operator', value: ',' },
      { type: 'Name', value: 'name' },
      { type: 'ForwardSlash', value: '/' },
      { type: 'Parenthesis', value: '(' },
      { type: 'Name', value: 'user' },
      { type: 'Parenthesis', value: ')' },
    ];
    const result = parse(token);
    const expected = {
      type: 'Operator',
      name: 'Projection',
      projectionColumns: [
        {
          type: 'ProjectionColumn',
          value: 'age',
        },
        {
          type: 'ProjectionColumn',
          value: 'name',
        },
      ],
      from: {
        type: 'Identifier',
        value: 'user',
      },
    };
    expect(result).toEqual(expected);
  });

  test('It should parse Selection', () => {
    const token = [
      { type: 'Name', value: 'S' },
      { type: 'ForwardSlash', value: '/' },
      { type: 'Name', value: 'age' },
      { type: 'Operator', value: '=' },
      { type: 'Name', value: 'name' },
      { type: 'ForwardSlash', value: '/' },
      { type: 'Parenthesis', value: '(' },
      { type: 'Name', value: 'user' },
      { type: 'Parenthesis', value: ')' },
    ];
    const result = parse(token);
    const expected = {
      type: 'Operator',
      name: 'Selection',
      conditions: [
        {
          name: 'age',
          operator: '=',
          type: 'Condition',
          value: 'name',
        },
      ],
      from: {
        type: 'Identifier',
        value: 'user',
      },
    };
    expect(result).toEqual(expected);
  });

  test('It should parse Cartesian product', () => {
    const token = [
      { type: 'Name', value: 'X' },
      { type: 'Parenthesis', value: '(' },
      { type: 'Name', value: 'user' },
      { type: 'Operator', value: ',' },
      { type: 'Name', value: 'employee' },
      { type: 'Parenthesis', value: ')' },
    ];
    const result = parse(token);
    const expected = {
      type: 'Operator',
      name: 'CartesianProduct',
      from: [
        {
          type: 'Identifier',
          value: 'user',
        },
        {
          type: 'Identifier',
          value: 'employee',
        },
      ],
    };
    expect(result).toEqual(expected);
  });

  test('It should parse Set Difference', () => {
    const token = [
      { type: 'Name', value: 'SD' },
      { type: 'Parenthesis', value: '(' },
      { type: 'Name', value: 'user' },
      { type: 'Operator', value: ',' },
      { type: 'Name', value: 'employee' },
      { type: 'Parenthesis', value: ')' },
    ];
    const result = parse(token);
    const expected = {
      type: 'Operator',
      name: 'SetDifference',
      from: [
        {
          type: 'Identifier',
          value: 'user',
        },
        {
          type: 'Identifier',
          value: 'employee',
        },
      ],
    };
    expect(result).toEqual(expected);
  });

  test('It should parse Union', () => {
    const token = [
      { type: 'Name', value: 'U' },
      { type: 'Parenthesis', value: '(' },
      { type: 'Name', value: 'user' },
      { type: 'Operator', value: ',' },
      { type: 'Name', value: 'employee' },
      { type: 'Parenthesis', value: ')' },
    ];
    const result = parse(token);
    const expected = {
      type: 'Operator',
      name: 'Union',
      from: [
        {
          type: 'Identifier',
          value: 'user',
        },
        {
          type: 'Identifier',
          value: 'employee',
        },
      ],
    };
    expect(result).toEqual(expected);
  });

  test('It should parse Rename', () => {
    const token = [
      { type: 'Name', value: 'R' },
      { type: 'ForwardSlash', value: '/' },
      { type: 'Name', value: 'userUpdated' },
      { type: 'ForwardSlash', value: '/' },
      { type: 'Parenthesis', value: '(' },
      { type: 'Name', value: 'user' },
      { type: 'Parenthesis', value: ')' },
    ];
    const result = parse(token);
    const expected = {
      type: 'Operator',
      name: 'Rename',
      newRelationName: 'userUpdated',
      relationName: 'user',
    };
    expect(result).toEqual(expected);
  });

  test('It should Create a varable', () => {
    const token = [
      { type: 'Name', value: 'var' },
      { type: 'Name', value: 'data' },
      { type: 'Operator', value: '=' },
      { type: 'Name', value: 'P' },
      { type: 'ForwardSlash', value: '/' },
      { type: 'Name', value: 'age' },
      { type: 'Operator', value: ',' },
      { type: 'Name', value: 'name' },
      { type: 'ForwardSlash', value: '/' },
      { type: 'Parenthesis', value: '(' },
      { type: 'Name', value: 'user' },
      { type: 'Parenthesis', value: ')' },
    ];

    const result = parse(token);
    const expected = {
      type: 'VariableDeclaration',
      identifier: 'data',
      value: {
        from: {
          type: 'Identifier',
          value: 'user',
        },
        name: 'Projection',
        projectionColumns: [
          {
            type: 'ProjectionColumn',
            value: 'age',
          },
          {
            type: 'ProjectionColumn',
            value: 'name',
          },
        ],
        type: 'Operator',
      },
    };
    expect(result).toEqual(expected);
  });
});
