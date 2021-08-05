import { Environment } from './Environment';
import { StandardLibrary } from './StandardLibrary';
import {
  AlgebricOperator,
  AlgebricOperatorTypeAst,
  AstType,
  IdentiferAst,
  ProjectionAst,
  RenameAst,
  SelectionAst,
  VariableDeclarationAst,
} from './parse';

interface RelationData {
  [key: string]: string;
}

export type EvaluatorResult =
  | RelationData
  | string
  | boolean
  | RelationData[]
  | RelationData[][]
  | string[];

export class Evaluator {
  public constructor(
    private environment: Environment,
    private standardLibrary: StandardLibrary
  ) {}

  public executeRelationalAlgebricOperator(
    astNode: AlgebricOperatorTypeAst
  ): RelationData[][] | RelationData[] | boolean {
    if (astNode.name === AlgebricOperator.Projection) {
      const from = <RelationData[]>this.run(astNode.from);
      const projectionColumns = (<ProjectionAst>astNode).projectionColumns.map(
        (item: any) => item.value
      );
      return this.standardLibrary.projection(from, projectionColumns);
    }

    if (astNode.name === AlgebricOperator.Selection) {
      const from = <RelationData[]>this.run(astNode.from);
      const conditions = (<SelectionAst>astNode).conditions.map((item: any) => {
        return {
          name: item.name,
          operator: item.operator,
          value: item.value,
        };
      });
      return this.standardLibrary.selection(from, conditions);
    }

    if (astNode.name === AlgebricOperator.Rename) {
      return this.standardLibrary.rename(
        (<RenameAst>astNode).relationName,
        (<RenameAst>astNode).newRelationName
      );
    }

    if (astNode.name === AlgebricOperator.CartesianProduct) {
      const [first, second] = this.run(astNode.from) as RelationData[][];
      return this.standardLibrary.cartesianProduct(first, second);
    }

    if (astNode.name === AlgebricOperator.Union) {
      const results = this.run(astNode.from) as RelationData[][];
      return this.standardLibrary.union(...results);
    }

    if (astNode.name === AlgebricOperator.SetDifference) {
      const [left, right] = this.run(astNode.from) as RelationData[][];
      return this.standardLibrary.setDifference(left, right);
    }
    throw new Error('Invalid expression');
  }

  public execute(
    astNode: AstType
  ): RelationData | RelationData[] | string[] | RelationData[][] {
    if (Array.isArray(astNode)) {
      return astNode.map((item) => this.execute(item)) as
        | RelationData[]
        | RelationData[][]
        | string[];
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

    if (!Array.isArray(astNode) && astNode.type === 'CallExpression') {
      return this.run(astNode.value) as RelationData;
    }
    throw new Error('Invalid expression');
  }

  public loadRelation(astNode: IdentiferAst): RelationData[] {
    const data = this.environment.getRelationData(astNode.value);
    return data;
  }

  public showRelations(): string[] {
    const data = this.environment.getAllRelations();
    return data;
  }

  public loadIdentifier(astNode: IdentiferAst): RelationData[] {
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

  public createVariable(astNode: VariableDeclarationAst): RelationData[] {
    const variableName = astNode.identifier;
    const data = this.run(astNode.value) as RelationData[];
    this.environment.createNewVariable(variableName, data);
    return data;
  }

  public run(astNode: AstType): EvaluatorResult {
    if (!Array.isArray(astNode) && astNode.type === 'Operator') {
      return this.executeRelationalAlgebricOperator(astNode);
    } else {
      return this.execute(astNode);
    }
  }
}
