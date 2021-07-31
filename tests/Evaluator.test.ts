import { Evaluator } from '../src/Evaluator';
import { Environment } from '../src/Environment';
import { StandardLibrary } from '../src/StandardLibrary';
import {
  AlgebricOperator,
  AstType,
  IdentiferAst,
  ProjectionAst,
  VariableDeclarationAst,
  CallExpressionAst,
  RenameAst,
} from '../src/parse';

describe('Evaluator', () => {
  test('It should create variable', () => {
    const environment = new Environment();
    jest
      .spyOn(environment, 'createNewVariable')
      .mockImplementation((name, data) => true);
    const standardLibrary = new StandardLibrary(environment);
    const evaluator = new Evaluator(environment, standardLibrary);
    jest.spyOn(evaluator, 'run').mockImplementation((ast) => [{ name: 'Bob' }]);
    const ast: VariableDeclarationAst = {
      type: 'VariableDeclaration',
      identifier: 'data',
      value: {
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
      },
    };
    const result = evaluator.createVariable(ast);
    expect(result).toBeTruthy();
  });

  test('It should show relations', () => {
    const environment = new Environment();
    jest
      .spyOn(environment, 'getAllRelations')
      .mockImplementation(() => ['users']);
    const standardLibrary = new StandardLibrary(environment);
    const evaluator = new Evaluator(environment, standardLibrary);
    const relations = evaluator.showRelations();
    expect(relations).toEqual(['users']);
  });

  test('It should load relation identifier', () => {
    const environment = new Environment();
    jest.spyOn(environment, 'isRelationExists').mockImplementation(() => true);
    jest
      .spyOn(environment, 'getRelationData')
      .mockImplementation((key) => [{ name: 'Bob' }]);
    const standardLibrary = new StandardLibrary(environment);
    const evaluator = new Evaluator(environment, standardLibrary);
    const ast: IdentiferAst = {
      type: 'Identifier',
      value: 'user',
    };
    const result = evaluator.loadIdentifier(ast);
    expect(result).toEqual([{ name: 'Bob' }]);
  });

  test('It should load variable identifier', () => {
    const environment = new Environment();
    jest.spyOn(environment, 'isRelationExists').mockImplementation(() => false);
    jest.spyOn(environment, 'isVariableExists').mockImplementation(() => true);
    jest
      .spyOn(environment, 'getVariableData')
      .mockImplementation((key) => [{ name: 'Bob' }]);
    const standardLibrary = new StandardLibrary(environment);
    const evaluator = new Evaluator(environment, standardLibrary);
    const ast: IdentiferAst = {
      type: 'Identifier',
      value: 'user',
    };
    const result = evaluator.loadIdentifier(ast);
    expect(result).toEqual([{ name: 'Bob' }]);
  });

  test('It should load relations', () => {
    const environment = new Environment();
    jest
      .spyOn(environment, 'getRelationData')
      .mockImplementation((name) => [{ name: 'Bob' }]);
    const standardLibrary = new StandardLibrary(environment);
    const evaluator = new Evaluator(environment, standardLibrary);
    const ast: IdentiferAst = {
      type: 'Identifier',
      value: 'users',
    };
    const data = evaluator.loadRelation(ast);
    expect(data).toEqual([{ name: 'Bob' }]);
  });

  test('It should run ast', () => {
    const environment = new Environment();
    const standardLibrary = new StandardLibrary(environment);
    const evaluator = new Evaluator(environment, standardLibrary);
    jest
      .spyOn(evaluator, 'execute')
      .mockImplementation((ast) => [{ name: 'Bob' }]);
    const ast: AstType = {
      type: 'Identifier',
      value: 'users',
    };
    const result = evaluator.run(ast);
    expect(result).toEqual([{ name: 'Bob' }]);
  });

  test('It should run ast array', () => {
    const environment = new Environment();
    const standardLibrary = new StandardLibrary(environment);
    const evaluator = new Evaluator(environment, standardLibrary);
    jest
      .spyOn(evaluator, 'execute')
      .mockImplementation((ast) => [{ age: '31', name: 'Bob' }]);
    const ast: ProjectionAst = {
      type: 'Operator',
      name: AlgebricOperator.Projection,
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
    const result = evaluator.run(ast);
    expect(result).toEqual([{ age: '31', name: 'Bob' }]);
  });

  test('It should execute identifier', () => {
    const environment = new Environment();
    const standardLibrary = new StandardLibrary(environment);
    const evaluator = new Evaluator(environment, standardLibrary);
    jest
      .spyOn(evaluator, 'loadIdentifier')
      .mockImplementation((ast) => [{ age: '31', name: 'Bob' }]);
    const ast: IdentiferAst = {
      type: 'Identifier',
      value: 'users',
    };
    const result = evaluator.execute(ast);
    expect(result).toEqual([{ age: '31', name: 'Bob' }]);
  });

  test('It should execute VariableDeclaration', () => {
    const environment = new Environment();
    const standardLibrary = new StandardLibrary(environment);
    const evaluator = new Evaluator(environment, standardLibrary);
    jest
      .spyOn(evaluator, 'createVariable')
      .mockImplementation((ast) => [{ age: '31', name: 'Bob' }]);
    const ast: VariableDeclarationAst = {
      type: 'VariableDeclaration',
      identifier: 'data',
      value: {
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
      },
    };
    const result = evaluator.execute(ast);
    expect(result).toEqual([{ age: '31', name: 'Bob' }]);
  });

  test('It should execute show relations', () => {
    const environment = new Environment();
    const standardLibrary = new StandardLibrary(environment);
    const evaluator = new Evaluator(environment, standardLibrary);
    jest
      .spyOn(evaluator, 'showRelations')
      .mockImplementation(() => ['users', 'employees']);
    const ast: AstType = {
      type: 'ShowRelations',
    };
    const result = evaluator.execute(ast);
    expect(result).toEqual(['users', 'employees']);
  });

  test('It should execute call expressions', () => {
    const environment = new Environment();
    const standardLibrary = new StandardLibrary(environment);
    const evaluator = new Evaluator(environment, standardLibrary);
    jest
      .spyOn(evaluator, 'run')
      .mockImplementation((ast) => [{ age: '31', name: 'Bob' }]);
    const ast: CallExpressionAst = {
      type: 'CallExpression',
      value: {
        type: 'Operator',
        name: AlgebricOperator.Projection,
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
      },
    };
    const result = evaluator.execute(ast);
    expect(result).toEqual([{ age: '31', name: 'Bob' }]);
  });

  test('It should executeRelationalAlgebricOperator selection', () => {
    const environment = new Environment();
    const standardLibrary = new StandardLibrary(environment);
    jest.spyOn(standardLibrary, 'selection').mockImplementation((ast) => [
      {
        name: 'Bob',
        value: '31',
      },
    ]);
    const evaluator = new Evaluator(environment, standardLibrary);
    jest
      .spyOn(evaluator, 'run')
      .mockImplementation((ast) => [{ name: 'Bob', age: '31' }]);
    const ast: AstType = {
      type: 'Operator',
      name: AlgebricOperator.Selection,
      conditions: [
        {
          name: 'age',
          operator: '=',
          type: 'Condition',
          value: '31',
        },
      ],
      from: {
        type: 'Identifier',
        value: 'user',
      },
    };
    const result = evaluator.executeRelationalAlgebricOperator(ast);
    expect(result).toEqual([
      {
        name: 'Bob',
        value: '31',
      },
    ]);
  });

  test('It should executeRelationalAlgebricOperator Rename', () => {
    const environment = new Environment();
    const standardLibrary = new StandardLibrary(environment);
    const evaluator = new Evaluator(environment, standardLibrary);
    jest
      .spyOn(standardLibrary, 'rename')
      .mockImplementation((relationName, newRelationName) => true);
    const ast: RenameAst = {
      type: 'Operator',
      name: AlgebricOperator.Rename,
      relationName: 'users',
      newRelationName: 'userUpdated',
      from: 'users',
    };
    const result = evaluator.executeRelationalAlgebricOperator(ast);
    expect(result).toEqual(true);
  });

  test('It should executeRelationalAlgebricOperator CartesianProduct', () => {
    const environment = new Environment();
    const standardLibrary = new StandardLibrary(environment);
    jest
      .spyOn(standardLibrary, 'cartesianProduct')
      .mockImplementation((relationName, newRelationName) => [
        { name: 'Bob', age: '31' },
      ]);
    const evaluator = new Evaluator(environment, standardLibrary);
    jest.spyOn(evaluator, 'run').mockImplementation((ast) => [
      { name: 'Bob', age: '31' },
      { name: 'Bob', age: '31' },
    ]);
    const ast: AstType = {
      type: 'Operator',
      name: AlgebricOperator.CartesianProduct,
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
    const result = evaluator.executeRelationalAlgebricOperator(ast);
    expect(result).toEqual([{ name: 'Bob', age: '31' }]);
  });

  test('It should executeRelationalAlgebricOperator Union', () => {
    const environment = new Environment();
    const standardLibrary = new StandardLibrary(environment);
    jest
      .spyOn(standardLibrary, 'union')
      .mockImplementation((relationOne, relationTwo) => [
        { name: 'Bob', age: '31' },
      ]);
    const evaluator = new Evaluator(environment, standardLibrary);
    jest
      .spyOn(evaluator, 'run')
      .mockImplementation((ast) => [{ name: 'Bob', age: '31' }]);
    const ast: AstType = {
      type: 'Operator',
      name: AlgebricOperator.Union,
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
    const result = evaluator.executeRelationalAlgebricOperator(ast);
    expect(result).toEqual([{ name: 'Bob', age: '31' }]);
  });

  test('It should executeRelationalAlgebricOperator SetDifference', () => {
    const environment = new Environment();
    const standardLibrary = new StandardLibrary(environment);
    jest
      .spyOn(standardLibrary, 'setDifference')
      .mockImplementation((relationOne, relationTwo) => [
        { name: 'Bob', age: '31' },
      ]);
    const evaluator = new Evaluator(environment, standardLibrary);
    jest
      .spyOn(evaluator, 'run')
      .mockImplementation((ast) => [{ name: 'Bob', age: '31' }]);
    const ast: AstType = {
      type: 'Operator',
      name: AlgebricOperator.SetDifference,
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
    const result = evaluator.executeRelationalAlgebricOperator(ast);
    expect(result).toEqual([{ name: 'Bob', age: '31' }]);
  });
});
