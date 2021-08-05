import { parse } from '../src/parse';
import { Environment } from '../src/Environment';
import { Evaluator } from '../src/Evaluator';
import { Rae } from '../src/Rae';
import { tokenize } from '../src/tokenize';

jest.mock('../src/Environment.ts');
jest.mock('../src/StandardLibrary.ts');
jest.mock('../src/tokenize.ts');
jest.mock('../src/parse.ts');
jest.mock('../src/Evaluator.ts');

describe('Rae', () => {
  test('It should create new instance of Rae', () => {
    const dataDir = `dir`;
    const rae = Rae.getInstance({ dataDir });
    expect(rae).toBeInstanceOf(Rae);
  });

  test('It should create new instance of Rae with sessionId', () => {
    const dataDir = 'dir';
    const sessionId = 'some-session-id';
    const rae = Rae.getInstance({ dataDir, sessionId });
    expect(rae).toBeInstanceOf(Rae);
  });

  test('It should get the session id', () => {
    const mockedEnvironment = Environment as jest.MockedClass<
      typeof Environment
    >;
    mockedEnvironment.prototype.getSessionId.mockImplementation(
      () => 'session_id'
    );
    const rae = Rae.getInstance({ sessionId: 'session_id' });
    const session_id = rae.getSessionId();
    expect(session_id).toEqual('session_id');
  });

  test('It should set data dir', () => {
    const mockedEnvironment = Environment as jest.MockedClass<
      typeof Environment
    >;
    const rae = Rae.getInstance();
    expect(rae.setDataDir('dataDir')).toEqual(undefined);
    expect(mockedEnvironment.prototype.setDataDir).toHaveBeenCalledWith(
      'dataDir'
    );
  });

  test('It should add new Relations', () => {
    const mockedEnvironment = Environment as jest.MockedClass<
      typeof Environment
    >;
    mockedEnvironment.prototype.addRelations.mockImplementation(
      (data) => undefined
    );
    const rae = Rae.getInstance();
    expect(rae.addRelations('{}')).toEqual(undefined);
    expect(mockedEnvironment.prototype.addRelations).toHaveBeenCalledWith('{}');
  });

  test('It should get All Relations', () => {
    const mockedEnvironment = Environment as jest.MockedClass<
      typeof Environment
    >;
    mockedEnvironment.prototype.getAllRelations.mockImplementation(() => []);
    const rae = Rae.getInstance();
    expect(rae.getAllRelations()).toEqual([]);
    expect(mockedEnvironment.prototype.getAllRelations).toHaveBeenCalled();
  });

  test('It shoud execute relational algebric expressions', () => {
    const mockedEvaluator = Evaluator as jest.MockedClass<typeof Evaluator>;
    mockedEvaluator.prototype.run.mockImplementation(() => true);
    const rae = Rae.getInstance();
    expect(rae.execute('')).toBeTruthy();
    expect(tokenize).toBeCalled();
    expect(parse).toBeCalled();
  });
});
