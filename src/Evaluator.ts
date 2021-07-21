import { Environment } from './Environment';
import { StandardLibrary } from './StandardLibrary';

export class Evaluator {
  public constructor(
    private environment: Environment,
    private standardLibrary: StandardLibrary
  ) {}

  public executeOperator(astNode: any) {
    if (astNode.name === 'Projection') {
      let from: any;
      if (Array.isArray(astNode.from)) {
        from = this.run(astNode.from[0]);
      } else {
        from = this.run(astNode.from);
      }
      const projectionColumns = astNode.projectionColumns.map(
        (item: any) => item.value
      );
      return this.standardLibrary.projection(from, projectionColumns);
    }

    if (astNode.name === 'Selection') {
      let from: any;
      if (Array.isArray(astNode.from)) {
        from = this.run(astNode.from[0]);
      } else {
        from = this.run(astNode.from);
      }
      const conditions = astNode.conditions.map((item: any) => {
        return {
          name: item.name,
          operator: item.operator,
          value: item.value,
        };
      });
      return this.standardLibrary.selection(from, conditions);
    }

    if (astNode.name === 'Rename') {
      return this.standardLibrary.rename(
        astNode.relationName,
        astNode.newRelationName
      );
    }

    if (astNode.name === 'CartesianProduct') {
      let fromOne: any;
      let fromTwo: any;
      if (Array.isArray(astNode.from)) {
        fromOne = this.run(astNode.from[0]);
        fromTwo = this.run(astNode.from[1]);
      } else {
        throw new Error('Cartesian product need two dataset');
      }
      return this.standardLibrary.cartesianProduct(fromOne, fromTwo);
    }

    if (astNode.name === 'Union') {
      let results: any[] = [];
      if (Array.isArray(astNode.from)) {
        astNode.from.forEach((item: any) => {
          results.push(this.run(item));
        });
      } else {
        throw new Error('Cartesian product need two dataset');
      }
      return this.standardLibrary.union(...results);
    }

    if (astNode.name === 'SetDifference') {
      let left: any;
      let right: any;
      if (Array.isArray(astNode.from)) {
        if (astNode.from.length !== 2) {
          throw new Error('Two relation is required to perform set difference');
        }
        left = this.run(astNode.from[0]);
        right = this.run(astNode.from[1]);
      } else {
        throw new Error('Cartesian product need two dataset');
      }
      return this.standardLibrary.setDifference(left, right);
    }
  }

  public loadRelation(astNode: any) {
    const data = this.environment.getRelationData(astNode.value);
    return data;
  }

  public showRelations() {
    const data = this.environment.getAllRelations();
    return data;
  }

  public loadIdentifier(astNode: any) {
    // check relation
    const relationExists = this.environment.isRelationExists(astNode.value);
    if (relationExists) {
      return this.environment.getRelationData(astNode.value);
    }
    // check variable exists
    const variableExists = this.environment.isVariableExists(astNode.value);
    if (variableExists) {
      return this.environment.getVariableData(astNode.value);
    }
    throw new Error('No Relation or identifier exists');
  }

  public createVariable(astNode: any) {
    const variableName = astNode.identifier;
    const data = this.run(astNode.value);
    this.environment.createNewVariable(variableName, data);
    return data;
  }

  public run(astNode: any): any {
    if (astNode.type === 'Operator') {
      return this.executeOperator(astNode);
    }

    if (astNode.type === 'Identifier') {
      const data = this.loadIdentifier(astNode);
      return data;
    }

    if (astNode.type === 'VariableDeclaration') {
      return this.createVariable(astNode);
    }

    if (astNode.type === 'ShowRelations') {
      return this.showRelations();
    }
  }
}
