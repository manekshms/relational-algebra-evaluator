import * as _ from 'lodash';
import { Environment } from './Environment';
export class StandardLibrary {
  public constructor(private environment: Environment) {}

  public projection = (data: any[], columns: string[]): any[] => {
    return _.map(data, _.partialRight(_.pick, columns));
  };

  public selection = (data: any[], conditions: any[]) => {
    return data.filter((item) => {
      return conditions.every((condition: any) => {
        if (item[condition.name] === condition.value) {
          return true;
        }
        return false;
      });
    });
  };

  public cartesianProduct = (relationOne: any, relationTwo: any) => {
    const first = relationOne.map((item: any) => {
      const result: any = {};
      for (let key in item) {
        result[`relationOne.${key}`] = item[key];
      }
      return result;
    });

    const second = relationTwo.map((item: any) => {
      const result: any = {};
      for (let key in item) {
        result[`relationTwo.${key}`] = item[key];
      }
      return result;
    });

    const result: any = [];
    first.forEach((item: any) => {
      second.forEach((inner: any) => {
        result.push({ ...item, ...inner });
      });
    });
    return result;
  };

  public setDifference = (left: any, right: any) => {
    return _.differenceWith(left, right, _.isEqual);
  };

  public union(...args: any) {
    const data = _.flatten(args);
    return _.unionWith(data, _.isEqual);
  }

  public rename = (nameOfRelation: string, newNameOfRelation: string) => {
    return this.environment.updateRelationName(
      nameOfRelation,
      newNameOfRelation
    );
  };
}
