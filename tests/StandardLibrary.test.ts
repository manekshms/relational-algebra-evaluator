import { Environment } from '../src/Environment';
import { StandardLibrary } from '../src/StandardLibrary';

describe('Standard Library', () => {
  test('It should do projection', () => {
    const environment = new Environment();
    const standardLibrary = new StandardLibrary(environment);
    const result = standardLibrary.projection(
      [
        {
          name: 'bob',
          age: '31',
        },
        {
          name: 'Jack',
          age: '45',
        },
      ],
      ['age']
    );
    expect(result).toEqual([{ age: '31' }, { age: '45' }]);
  });

  test('It should do selection', () => {
    const environment = new Environment();
    const standardLibrary = new StandardLibrary(environment);
    const result = standardLibrary.selection(
      [
        {
          name: 'bob',
          age: '31',
        },
        {
          name: 'Jack',
          age: '45',
        },
      ],
      [{ name: 'name', value: 'bob' }]
    );
    expect(result).toEqual([{ name: 'bob', age: '31' }]);
  });

  test('It should do cartesian product', () => {
    const environment = new Environment();
    const standardLibrary = new StandardLibrary(environment);
    const result = standardLibrary.cartesianProduct(
      [
        {
          name: 'bob',
          age: '31',
        },
        {
          name: 'Jack',
          age: '45',
        },
      ],
      [{ name: 'Foo', age: '25' }]
    );
    expect(result).toEqual([
      {
        'relationOne.name': 'bob',
        'relationOne.age': '31',
        'relationTwo.name': 'Foo',
        'relationTwo.age': '25',
      },
      {
        'relationOne.name': 'Jack',
        'relationOne.age': '45',
        'relationTwo.name': 'Foo',
        'relationTwo.age': '25',
      },
    ]);
  });

  test('It should do set difference', () => {
    const environment = new Environment();
    const standardLibrary = new StandardLibrary(environment);
    const result = standardLibrary.setDifference(
      [
        {
          name: 'bob',
          age: '31',
        },
        {
          name: 'Jack',
          age: '45',
        },
      ],
      [{ name: 'bob', age: '31' }]
    );
    expect(result).toEqual([{ name: 'Jack', age: '45' }]);
  });

  test('It should do union', () => {
    const environment = new Environment();
    const standardLibrary = new StandardLibrary(environment);
    const result = standardLibrary.union(
      [
        {
          name: 'bob',
          age: '31',
        },
        {
          name: 'Jack',
          age: '45',
        },
      ],
      [{ name: 'foo', age: '25' }]
    );
    expect(result).toEqual([
      { name: 'bob', age: '31' },
      { name: 'Jack', age: '45' },
      { name: 'foo', age: '25' },
    ]);
  });

  test('It should rename relation', () => {
    const environment = new Environment();
    jest
      .spyOn<Environment, any>(environment, 'updateRelationName')
      .mockImplementation((rel, relNew) => true);
    const standardLibrary = new StandardLibrary(environment);
    const result = standardLibrary.rename('relOne', 'relTwo');
    expect(result).toBeTruthy();
  });
});
