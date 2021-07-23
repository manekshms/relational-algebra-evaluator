import * as _ from 'lodash';
import { Environment } from './Environment';

interface RelationalData {
  [key: string]: string;
}

export class StandardLibrary {
  public constructor(private environment: Environment) {}

  public projection = (
    data: RelationalData[],
    columns: string[]
  ): RelationalData[] => {
    return _.map(data, _.partialRight(_.pick, columns));
  };

  public selection = (
    data: RelationalData[],
    conditions: { name: string; value: string }[]
  ): RelationalData[] => {
    return data.filter((item: { [key: string]: string }) => {
      return conditions.every((condition) => {
        if (item[condition.name] === condition.value) {
          return true;
        }
        return false;
      });
    });
  };

  public cartesianProduct = (
    relationOne: RelationalData[],
    relationTwo: RelationalData[]
  ): RelationalData[] => {
    const first = relationOne.map((item: RelationalData) => {
      const result: RelationalData = {};
      for (let key in item) {
        result[`relationOne.${key}`] = item[key];
      }
      return result;
    });

    const second = relationTwo.map((item: RelationalData) => {
      const result: RelationalData = {};
      for (let key in item) {
        result[`relationTwo.${key}`] = item[key];
      }
      return result;
    });

    const result: RelationalData[] = [];
    first.forEach((item: RelationalData) => {
      second.forEach((inner: RelationalData) => {
        result.push({ ...item, ...inner });
      });
    });
    return result;
  };

  public setDifference = (
    left: RelationalData[],
    right: RelationalData[]
  ): RelationalData[] => {
    return _.differenceWith(left, right, _.isEqual);
  };

  public union(...args: RelationalData[]): RelationalData[] {
    const data = _.flatten<RelationalData>(args);
    return _.unionWith(data, _.isEqual);
  }

  public rename = (
    nameOfRelation: string,
    newNameOfRelation: string
  ): boolean => {
    return this.environment.updateRelationName(
      nameOfRelation,
      newNameOfRelation
    );
  };
}
