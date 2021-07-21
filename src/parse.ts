import { Token } from './tokenize';
import * as utils from './utils';

const groupOperationParser: any = {
  P(tokens: Token[]) {
    utils.pop(tokens);
    const operation: any = { type: 'Operator', name: 'Projection' };
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
    const bracketOn = utils.peek(tokens);
    if (utils.isParenthesisOpen(bracketOn.value)) {
      operation.from = groupOperations(tokens);
    }
    return operation;
  },
  S(tokens: any[]) {
    utils.pop(tokens);
    const operation: any = { type: 'Operator', name: 'Selection' };
    const forwardSlash = utils.pop(tokens);
    if (forwardSlash.type !== 'ForwardSlash') {
      throw new TypeError(`Invalid token ${forwardSlash.value}`);
    }
    const conditions = [];
    while (utils.peek(tokens).type !== 'ForwardSlash') {
      const name = utils.pop(tokens);
      const operator = utils.pop(tokens);
      const value = utils.pop(tokens);
      const condition = {
        type: 'Condition',
        name: name.value,
        operator: operator.value,
        value: value.value,
      };
      conditions.push(condition);
    }
    utils.pop(tokens);
    const bracketOn = utils.peek(tokens);
    if (utils.isParenthesisOpen(bracketOn.value)) {
      operation.from = groupOperations(tokens);
    }
    operation.conditions = conditions;
    return operation;
  },
  X(tokens: any) {
    utils.pop(tokens);
    const operation: any = { type: 'Operator', name: 'CartesianProduct' };
    const bracketOn = utils.peek(tokens) as Token;
    if (utils.isParenthesisOpen(bracketOn.value)) {
      operation.from = groupOperations(tokens);
    }
    return operation;
  },
  SD(tokens: any) {
    utils.pop(tokens);
    const operation: any = { type: 'Operator', name: 'SetDifference' };
    const bracketOn = utils.peek(tokens) as Token;
    if (utils.isParenthesisOpen(bracketOn.value)) {
      operation.from = groupOperations(tokens);
    }
    return operation;
  },
  U(tokens: any) {
    utils.pop(tokens);
    const operation: any = { type: 'Operator', name: 'Union' };
    const bracketOn = utils.peek(tokens) as Token;
    if (utils.isParenthesisOpen(bracketOn.value)) {
      operation.from = groupOperations(tokens);
    }
    return operation;
  },
  R(tokens: any) {
    utils.pop(tokens);
    const operation: any = { type: 'Operator', name: 'Rename' };
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
    const bracketOn = utils.pop(tokens) as Token;
    if (!utils.isParenthesisOpen(bracketOn.value)) {
      throw new TypeError(`Invalid token ${bracketOn.value}`);
    }
    const relationName = utils.pop(tokens) as Token;
    operation.relationName = relationName.value;
    return operation;
  },

  var(tokens: any) {
    utils.pop(tokens);
    const identifier = (utils.pop(tokens) as Token).value;
    utils.pop(tokens);
    const operation = {
      type: 'VariableDeclaration',
      value: groupOperations(tokens),
      identifier,
    };
    return operation;
  },

  describe(tokens: any) {
    utils.pop(tokens);
    const relation = utils.pop(tokens) as Token;
    const operation = {
      type: 'Identifier',
      value: relation.value,
    };
    return operation;
  },

  show(tokens: any) {
    utils.pop(tokens);
    const relation = utils.pop(tokens) as Token;
    if (relation.value !== 'relations') {
      throw new Error(`Invalid token ${relation.value}`);
    }
    const operation = {
      type: 'ShowRelations',
    };
    return operation;
  },
};

function groupOperations(tokens: Token[]): any {
  const operation = utils.peek<Token>(tokens);
  if (utils.isParenthesisOpen(operation.value)) {
    utils.pop(tokens);
    const operator = utils.peek(tokens);
    if (utils.isRelationalAlgebricOperator(operator.value)) {
      return groupOperationParser[operator.value](tokens);
    } else {
      const relations = [];
      while (!utils.isParenthesisClosed(utils.peek(tokens).value)) {
        if (utils.peek(tokens).value === ',') {
          utils.pop(tokens);
          continue;
        }
        const rel = utils.peek(tokens);
        if (utils.isParenthesisOpen(rel.value)) {
          relations.push(groupOperations(tokens));
          utils.pop(tokens);
        } else {
          rel.type = 'Identifier';
          relations.push(rel);
        }
        utils.pop(tokens);
      }
      return relations;
    }
  }
  if (!utils.isRelationalAlgebricOperator(operation.value)) {
    throw new TypeError(`Invalid token ${operation.value}`);
  }
  return groupOperationParser[operation.value](tokens);
}

export function parse(token: Token[]) {
  const tokens = groupOperations(token);
  return tokens;
}
