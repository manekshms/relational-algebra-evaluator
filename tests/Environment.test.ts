import path from 'path';
import fs from 'fs';

import { Environment } from '../src/Environment';

describe('Environment Test', () => {
  test('It should create new instance', () => {
    const environment = new Environment();
    expect(environment).toBeInstanceOf(Environment);
  });

  test('It should create new instance from sessionId', () => {
    const environment = new Environment('session_id');
    expect(environment).toBeInstanceOf(Environment);
  });

  describe('It should Load session data', () => {
    const dataDir = `${__dirname + path.sep}data${path.sep}`;

    beforeAll(() => {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
      }
    });

    afterAll(() => {
      if (fs.existsSync(dataDir)) {
        fs.rmdirSync(dataDir, { recursive: true });
      }
    });

    test('It should Load session data for new environment', () => {
      const environment = new Environment();
      environment.setDataDir(dataDir);
      const sessionId = environment.load();
      const isFileExists = fs.existsSync(`${dataDir + sessionId}.json`);
      expect(isFileExists).toBeTruthy();
    });

    test('It should Load session data from already existing session id', () => {
      // add new file
      const session_id = 'session_id';
      const data = {
        relations: [],
      };
      fs.writeFileSync(dataDir + session_id + '.json', JSON.stringify(data));
      const environment = new Environment(session_id);
      environment.setDataDir(dataDir);
      const sessionId = environment.load();
      expect(sessionId).toEqual(session_id);
    });

    test('It should Load session data', () => {
      // add new file
      const session_id = 'session_id';
      const data = {
        relations: [],
      };
      fs.writeFileSync(dataDir + session_id + '.json', JSON.stringify(data));
      const environment = new Environment(session_id);
      environment.setDataDir(dataDir);
      environment.load();
      const sessData = environment.loadSessionData();
      expect(sessData).toEqual(data);
    });

    test('It should get RelationData', () => {
      // add new file
      const session_id = 'session_id';
      const data = {
        relations: {
          users: [
            {
              name: 'Bob',
              age: 23,
            },
          ],
        },
      };
      fs.writeFileSync(dataDir + session_id + '.json', JSON.stringify(data));
      const environment = new Environment(session_id);
      environment.setDataDir(dataDir);
      environment.load();
      const sessData = environment.getRelationData('users');
      expect(sessData).toEqual(data.relations.users);
    });

    test('It should get all relation names', () => {
      // add new file
      const session_id = 'session_id';
      const data = {
        relations: {
          users: [
            {
              name: 'Bob',
              age: 23,
            },
          ],
        },
      };
      fs.writeFileSync(dataDir + session_id + '.json', JSON.stringify(data));
      const environment = new Environment(session_id);
      environment.setDataDir(dataDir);
      environment.load();
      const relations = environment.getAllRelations();
      expect(relations).toEqual(['users']);
    });

    test('It should add new relations', () => {
      // add new file
      const session_id = 'session_id';
      const data = {
        relations: {
          users: [
            {
              name: 'Bob',
              age: 23,
            },
          ],
        },
      };
      const newRelation = `{
        "employees": [
          { "name": "Jack"}
        ]
      }`;
      fs.writeFileSync(dataDir + session_id + '.json', JSON.stringify(data));
      const environment = new Environment(session_id);
      environment.setDataDir(dataDir);
      environment.load();
      const status = environment.addRelations(newRelation);
      expect(status).toBeTruthy();
    });

    test('It should check relation exists or not', () => {
      // add new file
      const session_id = 'session_id';
      const data = {
        relations: {
          users: [
            {
              name: 'Bob',
              age: 23,
            },
          ],
        },
      };
      fs.writeFileSync(dataDir + session_id + '.json', JSON.stringify(data));
      const environment = new Environment(session_id);
      environment.setDataDir(dataDir);
      environment.load();
      const status = environment.isRelationExists('users');
      expect(status).toBeTruthy();
    });

    test('It should update relation name', () => {
      // add new file
      const session_id = 'session_id';
      const data = {
        relations: {
          users: [
            {
              name: 'Bob',
              age: 23,
            },
          ],
        },
      };
      fs.writeFileSync(dataDir + session_id + '.json', JSON.stringify(data));
      const environment = new Environment(session_id);
      environment.setDataDir(dataDir);
      environment.load();
      const status = environment.updateRelationName('users', 'newUsers');
      expect(status).toBeTruthy();
    });

    test('It should create new variable', () => {
      // add new file
      const session_id = 'session_id';
      const data = {
        relations: {
          users: [
            {
              name: 'Bob',
              age: 23,
            },
          ],
        },
        variables: {},
      };
      fs.writeFileSync(dataDir + session_id + '.json', JSON.stringify(data));
      const environment = new Environment(session_id);
      environment.setDataDir(dataDir);
      environment.load();
      environment.createNewVariable('user', [{ name: 'Bob' }]);
      const sessionData = JSON.parse(
        fs.readFileSync(dataDir + session_id + '.json', { encoding: 'utf-8' })
      );
      expect(sessionData.variables.user).toEqual([{ name: 'Bob' }]);
    });

    test('It should check variable exists or not', () => {
      // add new file
      const session_id = 'session_id';
      const data = {
        relations: {
          users: [
            {
              name: 'Bob',
              age: 23,
            },
          ],
        },
        variables: {
          user: [{ name: 'Bob' }],
        },
      };
      fs.writeFileSync(dataDir + session_id + '.json', JSON.stringify(data));
      const environment = new Environment(session_id);
      environment.setDataDir(dataDir);
      environment.load();
      const isVariableExists = environment.isVariableExists('user');
      expect(isVariableExists).toBeTruthy();
    });

    test('It should get variable data', () => {
      // add new file
      const session_id = 'session_id';
      const data = {
        relations: {
          users: [
            {
              name: 'Bob',
              age: 23,
            },
          ],
        },
        variables: {
          user: [{ name: 'Bob' }],
        },
      };
      fs.writeFileSync(dataDir + session_id + '.json', JSON.stringify(data));
      const environment = new Environment(session_id);
      environment.setDataDir(dataDir);
      environment.load();
      const varData = environment.getVariableData('user');
      expect(varData).toEqual(data.variables.user);
    });
  });
});
