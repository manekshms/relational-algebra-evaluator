import moment from 'moment';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import _ from 'lodash';

export class Environment {
  private dataDir: string = path.resolve(__dirname, '..', 'data') + path.sep;
  public constructor(private sessionId?: string) {}

  public setDataDir(dataDir: string) {
    this.dataDir = dataDir;
  }

  public load(): string {
    if (this.sessionId) {
      return this.loadBySessionId();
    } else {
      return this.createNewSession();
    }
  }

  public addRelations(relations: string) {
    const sessionData = this.loadSessionData();
    const newRelations = JSON.parse(relations);
    sessionData.relations = { ...sessionData.relations, ...newRelations };
    const fileLocation = `${this.dataDir}${this.sessionId}.json`;
    fs.writeFileSync(fileLocation, JSON.stringify(sessionData));
    return true;
  }

  public loadBySessionId(): string {
    // check session id exists
    const sessionFilePath = `${this.dataDir}${this.sessionId}.json`;
    if (!fs.existsSync(sessionFilePath)) {
      throw new TypeError('Invalid session');
    }
    const sessionData = fs.readFileSync(sessionFilePath, { encoding: 'utf8' });
    return this.sessionId as string;
  }

  public createNewSession(): string {
    const sessionId = uuid();
    const data = {
      createdAt: moment(),
      relations: {
        users: [
          { name: 'Bob', age: 30 },
          { name: 'Jim', age: 45 },
        ],
        employees: [
          { name: 'Bob', age: 30 },
          { name: 'Foo', age: 23 },
        ],
      },
      variables: {},
    };
    const fileLocation = `${this.dataDir}${sessionId}.json`;
    console.log(fileLocation);
    fs.writeFileSync(fileLocation, JSON.stringify(data));
    this.sessionId = sessionId;
    return sessionId;
  }

  public loadSessionData() {
    const sessionFilePath = `${this.dataDir}${this.sessionId}.json`;
    if (!fs.existsSync(sessionFilePath)) {
      throw new TypeError('Invalid session');
    }
    const sessionData = fs.readFileSync(sessionFilePath, { encoding: 'utf8' });
    return JSON.parse(sessionData);
  }

  public getRelationData(name: string) {
    const data = this.loadSessionData();
    if (data.relations[name]) {
      return data.relations[name];
    }
    throw new Error(`Relation not found ${name}`);
  }

  public getAllRelations() {
    const data = this.loadSessionData();
    const relations = [];
    for (let key in data.relations) {
      relations.push(key);
    }
    return relations;
  }

  public isRelationExists(name: string) {
    const data = this.loadSessionData();
    if (!data.relations[name]) {
      return false;
    }
    return true;
  }

  public updateRelationName(nameOfRelation: string, newRelationName: string) {
    const data = this.loadSessionData();
    if (!data.relations[nameOfRelation]) {
      throw new Error(`Relation not found ${nameOfRelation}`);
    }
    data.relations[newRelationName] = data.relations[nameOfRelation];
    delete data.relations[nameOfRelation];
    const fileLocation = `${this.dataDir}${this.sessionId}.json`;
    fs.writeFileSync(fileLocation, JSON.stringify(data));
    return true;
  }

  public createNewVariable(name: string, data: any) {
    const sessionData = this.loadSessionData();
    // check relation exists
    if (sessionData.relations[name]) {
      throw new Error(
        `A relation with name ${name} already exists use different name`
      );
    }
    // check variable already exists
    if (sessionData.variables[name]) {
      throw new Error(`Variable with identifier ${name} already exists`);
    }
    sessionData.variables[name] = data;
    const fileLocation = `${this.dataDir}${this.sessionId}.json`;
    fs.writeFileSync(fileLocation, JSON.stringify(sessionData));
  }

  public getVariableData(name: string) {
    const sessionData = this.loadSessionData();
    if (!sessionData.variables[name]) {
      throw new Error(`${name} is not defined`);
    }
    return sessionData.variables[name];
  }

  public isVariableExists(name: string) {
    const sessionData = this.loadSessionData();
    if (!sessionData.variables[name]) {
      return false;
    }
    return true;
  }
}
