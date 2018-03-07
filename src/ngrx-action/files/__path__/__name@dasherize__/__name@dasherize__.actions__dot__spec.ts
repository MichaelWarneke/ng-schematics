import { <%= name %> } from './<%= name %>.actions';

describe('<%= name %>', () => {
  it('should create an instance', () => {
    expect(new <%= name %>()).toBeTruthy();
  });
});
