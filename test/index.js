import chai from 'chai';
import ConvertAPI from '../src';

chai.use(require('chai-as-promised'));
chai.use(require('chai-fs'));

const expect = chai.expect;

describe('ConvertAPI', () => {
  it('should be accessible as function', () => {
    expect(ConvertAPI('test').secret).to.equal('test');
  });
});
