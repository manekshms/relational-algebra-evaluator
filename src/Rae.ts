import { Environment } from './Environment';
import { Evaluator, EvaluatorResult } from './Evaluator';
import { parse } from './parse';
import { StandardLibrary } from './StandardLibrary';
import { tokenize } from './tokenize';

export class Rae {
  private evaluator: Evaluator;
  private standardLibrary: StandardLibrary;

  constructor(private environment: Environment) {
    this.standardLibrary = new StandardLibrary(environment);
    this.evaluator = new Evaluator(environment, this.standardLibrary);
  }

  public static getInstance(options?: {
    sessionId?: string;
    dataDir?: string;
  }): Rae {
    let environment: Environment;
    if (options?.sessionId) {
      environment = new Environment(options.sessionId);
    } else {
      environment = new Environment();
    }
    if (options?.dataDir) {
      environment.setDataDir(options.dataDir);
    }
    environment.load();
    return new Rae(environment);
  }

  public setDataDir(dataDir: string): void {
    this.environment.setDataDir(dataDir);
  }

  public addRelations(data: string): void {
    this.environment.addRelations(data);
  }

  public showRelations(): string[] {
    return this.environment.getAllRelations();
  }

  public execute(data: string): EvaluatorResult {
    const tokens = tokenize(data);
    const ast = parse(tokens);
    const result = this.evaluator.run(ast);
    return result;
  }
}
