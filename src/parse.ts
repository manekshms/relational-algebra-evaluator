import { Token } from './tokenize';
import * as utils from './utils';

export interface CallExpressionAst {
  type: 'CallExpression';
  value: AstType;
}

export interface IdentiferAst {
  type: 'Identifier';
  value: string;
}

export enum AlgebricOperator {
  Projection = 'Projection',
  Selection = 'Selection',
  CartesianProduct = 'CartesianProduct',
  SetDifference = 'SetDifference',
  Union = 'Union',
  Rename = 'Rename',
}

export interface AlgebricOperatorTypeAst {
  type: 'Operator';
  name: AlgebricOperator;
  from: IdentiferAst | CallExpressionAst | IdentiferAst[] | CallExpressionAst[];
}

export interface ProjectionAst extends AlgebricOperatorTypeAst {
  name: AlgebricOperator.Projection;
  projectionColumns: {
    type: 'ProjectionColumn';
    value: string;
  }[];
}

export interface SelectionAst extends AlgebricOperatorTypeAst {
  name: AlgebricOperator.Selection;
  conditions: {
    type: 'Condition';
    name: string;
    operator: string;
    value: string;
  }[];
  from: IdentiferAst | CallExpressionAst;
}

export interface CartesianProductAst extends AlgebricOperatorTypeAst {
  name: AlgebricOperator.CartesianProduct;
  from: IdentiferAst[] | CallExpressionAst[];
}

export interface SetDifferenceAst extends AlgebricOperatorTypeAst {
  name: AlgebricOperator.SetDifference;
  from: IdentiferAst[] | CallExpressionAst[];
}

export interface UnionAst extends AlgebricOperatorTypeAst {
  name: AlgebricOperator.Union;
  from: IdentiferAst[] | CallExpressionAst[];
}

export interface RenameAst extends AlgebricOperatorTypeAst {
  name: AlgebricOperator.Rename;
  relationName: string;
  newRelationName: string;
  from: any;
}

export interface VariableDeclarationAst {
  type: 'VariableDeclaration';
  value: any;
  identifier: string;
}

interface ViewAst {
  type: 'Identifier';
  value: string;
}

interface ShowAst {
  type: 'ShowRelations';
}

export type AstType =
  | ProjectionAst
  | SelectionAst
  | CartesianProductAst
  | SetDifferenceAst
  | UnionAst
  | RenameAst
  | VariableDeclarationAst
  | ViewAst
  | ShowAst
  | IdentiferAst
  | IdentiferAst[]
  | CallExpressionAst
  | CallExpressionAst[];

interface Parser {
  P(tokens: Token[]): ProjectionAst;
  S(tokens: Token[]): SelectionAst;
  X(tokens: Token[]): CartesianProductAst;
  SD(tokens: Token[]): SetDifferenceAst;
  U(tokens: Token[]): UnionAst;
  R(tokens: Token[]): RenameAst;
  var(tokens: Token[]): VariableDeclarationAst;
  view(tokens: Token[]): ViewAst;
  show(token: Token[]): ShowAst;
}

const parser: Parser = {
  P(tokens: Token[]): ProjectionAst {
    utils.pop(tokens);
    const operation: any = {
      type: 'Operator',
      name: AlgebricOperator.Projection,
    };
    const forwardSlash = utils.pop(tokens) as Token;
    if (forwardSlash.type !== 'ForwardSlash') {
      throw new TypeError(`Invalid token ${forwardSlash.value}`);
    }
    const projectionColumns = [];
    while (utils.peek(tokens).type !== 'ForwardSlash') {
      const item = utils.pop(tokens) as Token;
      if (item.value === ',') {
        continue;
      }
      projectionColumns.push({ type: 'ProjectionColumn', value: item.value });
    }
    operation.projectionColumns = projectionColumns;
    utils.pop(tokens);
    const bracketOn = utils.pop(tokens);
    if (!bracketOn) {
      throw new Error('"(" is missing');
    }
    if (!utils.isParenthesisOpen(bracketOn.value)) {
      throw new Error(`Invalid Token ${bracketOn.value}`);
    }
    const relation = utils.peek(tokens);
    if (!relation) {
      throw new Error('Relation name is required');
    }
    if (utils.isParenthesisOpen(relation.value)) {
      operation.from = groupOperations(tokens);
    } else {
      operation.from = {
        type: 'Identifier',
        value: relation.value,
      };
    }
    utils.pop(tokens);
    return operation;
  },
  S(tokens: Token[]): SelectionAst {
    utils.pop(tokens);
    const operation: any = {
      type: 'Operator',
      name: AlgebricOperator.Selection,
    };
    const forwardSlash = utils.pop<Token>(tokens) as Token;
    if (forwardSlash.type !== 'ForwardSlash') {
      throw new TypeError(`Invalid token ${forwardSlash.value}`);
    }
    const conditions = [];
    while (utils.peek(tokens).type !== 'ForwardSlash') {
      const name = utils.pop(tokens);
      if (!name) {
        throw new Error('Invalid condition');
      }
      const operator = utils.pop(tokens);
      if (!operator) {
        throw new Error('Invalid Condition');
      }
      const value = utils.pop(tokens);
      if (!value) {
        throw new Error('Invalid Condition');
      }
      const condition = {
        type: 'Condition',
        name: name.value,
        operator: operator.value,
        value: value.value,
      };
      conditions.push(condition);
    }
    utils.pop(tokens);
    const bracketOn = utils.pop<Token>(tokens);
    if (!bracketOn) {
      throw new Error('"(" is missing');
    }
    if (!utils.isParenthesisOpen(bracketOn.value)) {
      throw new Error(`Invalid token ${bracketOn.value}`);
    }
    const relation = utils.peek(tokens);
    if (utils.isParenthesisOpen(relation.value)) {
      operation.from = groupOperations(tokens);
    } else {
      operation.from = {
        type: 'Identifier',
        value: relation.value,
      };
      utils.pop(tokens);
    }
    const parenthesisClosed = utils.pop<Token>(tokens);
    if (!parenthesisClosed) {
      throw new Error('")" is missing');
    }
    if (!utils.isParenthesisClosed(parenthesisClosed.value)) {
      throw new Error(`Invalid Token ${parenthesisClosed.value}`);
    }
    operation.conditions = conditions;
    return operation;
  },
  X(tokens: Token[]): CartesianProductAst {
    utils.pop(tokens);
    const operation: any = {
      type: 'Operator',
      name: AlgebricOperator.CartesianProduct,
      from: [],
    };
    const bracketOn = utils.pop(tokens);
    if (!bracketOn) {
      throw new Error('"(" is missing');
    }
    const relations = utils.peek(tokens);
    if (utils.isParenthesisOpen(relations.value)) {
      operation.from.push(groupOperations(tokens));
    } else {
      operation.from.push({
        type: 'Identifier',
        value: relations.value,
      });
      utils.pop(tokens);
    }
    const commaSeparator = utils.pop(tokens);
    if (!commaSeparator) {
      throw new Error("Can't perform Cartesian Product without two relations");
    }
    const secondRelation = utils.peek(tokens);
    if (!secondRelation) {
      throw new Error(
        'Cartesian Product works with two data sets, Please pass two relations'
      );
    }
    if (utils.isParenthesisOpen(secondRelation.value)) {
      operation.from.push(groupOperations(tokens));
    } else {
      operation.from.push({
        type: 'Identifier',
        value: secondRelation.value,
      });
    }
    utils.pop(tokens);
    return operation;
  },
  SD(tokens: Token[]): SetDifferenceAst {
    utils.pop(tokens);
    const operation: any = {
      type: 'Operator',
      name: AlgebricOperator.SetDifference,
      from: [],
    };
    const bracketOn = utils.pop(tokens);
    if (!bracketOn) {
      throw new Error('"(" is missing');
    }
    const relation = utils.peek(tokens);
    if (!relation) {
      throw new Error("Can't perform Set difference without relation");
    }
    if (utils.isParenthesisOpen(relation.value)) {
      operation.from.push(groupOperations(tokens));
    } else {
      operation.from.push({
        type: 'Identifier',
        value: relation.value,
      });
      utils.pop(tokens);
    }
    const commaSeparator = utils.pop(tokens);
    if (!commaSeparator) {
      throw new Error("Can't perform set difference without two relations");
    }

    const secondRelation = utils.peek(tokens);
    if (!secondRelation) {
      throw new Error("Can't perform Set difference without two relation");
    }
    if (utils.isParenthesisOpen(secondRelation.value)) {
      operation.from.push(groupOperations(tokens));
    } else {
      operation.from.push({
        type: 'Identifier',
        value: secondRelation.value,
      });
      utils.pop(tokens);
    }
    const parenthesisClosed = utils.pop(tokens);
    if (!parenthesisClosed) {
      throw new Error('"(" is missing');
    }
    return operation;
  },
  U(tokens: Token[]): UnionAst {
    utils.pop(tokens);
    const operation: any = {
      type: 'Operator',
      name: AlgebricOperator.Union,
      from: [],
    };
    const bracketOn = utils.pop(tokens);
    if (!bracketOn) {
      throw new Error('"(" is missing');
    }
    const relation = utils.peek(tokens);
    if (!relation) {
      throw new Error('Relation is required to perform union');
    }
    if (utils.isParenthesisOpen(relation.value)) {
      operation.from.push(groupOperations(tokens));
    } else {
      operation.from.push({
        type: 'Identifier',
        value: relation.value,
      });
      utils.pop(tokens);
    }
    const commaSeparator = utils.pop(tokens);
    if (!commaSeparator) {
      throw new Error("Can't perform union without two relations");
    }
    const secondRelation = utils.peek(tokens);
    if (!secondRelation) {
      throw new Error("Can't perform union without two relation");
    }
    if (utils.isParenthesisOpen(secondRelation.value)) {
      operation.from.push(groupOperations(tokens));
    } else {
      operation.from.push({
        type: 'Identifier',
        value: secondRelation.value,
      });
      utils.pop(tokens);
    }
    const parenthesisClosed = utils.pop(tokens);
    if (!parenthesisClosed) {
      throw new Error('"(" is missing');
    }
    return operation;
  },
  R(tokens: Token[]): RenameAst {
    utils.pop(tokens);
    const operation: any = { type: 'Operator', name: AlgebricOperator.Rename };
    const forwardSlash = utils.pop(tokens) as Token;
    if (forwardSlash.type !== 'ForwardSlash') {
      throw new TypeError(`Invalid token ${forwardSlash.value}`);
    }
    const newRelationName = utils.pop(tokens) as Token;
    operation.newRelationName = newRelationName.value;
    if (newRelationName.type !== 'Name') {
      throw new TypeError(`Invalid token ${newRelationName.value}`);
    }
    utils.pop(tokens);
    const bracketOn = utils.pop<Token>(tokens);
    if (!bracketOn) {
      throw new Error('"(" is missing');
    }
    if (!utils.isParenthesisOpen(bracketOn.value)) {
      throw new TypeError(`Invalid token ${bracketOn.value}`);
    }
    const relationName = utils.pop(tokens) as Token;
    if (!relationName) {
      throw new Error('Relation is required to perform rename');
    }
    operation.relationName = relationName.value;
    return operation;
  },

  var(tokens: Token[]): VariableDeclarationAst {
    utils.pop(tokens);
    const identifier = utils.pop(tokens);
    if (!identifier) {
      throw new Error('Identifier Name is missing');
    }
    const equals = utils.pop(tokens);
    if (!equals) {
      throw new Error('Assignment Operator is missing');
    }
    const operation: VariableDeclarationAst = {
      type: 'VariableDeclaration',
      value: groupOperations(tokens),
      identifier: identifier.value,
    };
    return operation;
  },

  view(tokens: Token[]): ViewAst {
    utils.pop(tokens);
    const relation = utils.pop(tokens);
    if (!relation) {
      throw new Error('Identifier Name is missing');
    }
    const operation: ViewAst = {
      type: 'Identifier',
      value: relation.value,
    };
    return operation;
  },

  show(tokens: Token[]): ShowAst {
    utils.pop(tokens);
    const relation = utils.pop(tokens);
    if (!relation) {
      throw new Error('"relations" is missing ');
    }
    if (relation.value !== 'relations') {
      throw new Error(`Invalid token ${relation.value}`);
    }
    const operation: ShowAst = {
      type: 'ShowRelations',
    };
    return operation;
  },
};

function createCallExpression(tokens: Token[]) {
  utils.pop(tokens);
  const callExpression: CallExpressionAst = {
    type: 'CallExpression',
    value: groupOperations(tokens),
  };
  utils.pop(tokens);
  return callExpression;
}

function groupOperations(tokens: Token[]): AstType {
  const operation = utils.peek<Token>(tokens);
  if (utils.isParenthesisOpen(operation.value)) {
    return createCallExpression(tokens);
  }
  if (!utils.isReservedKeyWord(operation.value)) {
    throw new TypeError(`Invalid token ${operation.value}`);
  }
  return parser[operation.value as keyof Parser](tokens);
}

export function parse(token: Token[]): AstType {
  const ast = groupOperations(token);
  return ast;
}
