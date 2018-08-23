const index = require('./index.js');
const assertArrays = require('chai-arrays');

let chai = require('chai');
chai.use(assertArrays);

const should = chai.should();

(async () => {
    try {
        let res = await index();
        res.should.be.array().ofSize(1);
        res[0].should.be.an('object');
        res[0].should.have.property('label');
        res[0].label.should.equal('welcome');
        res[0].should.have.property('data');
        res[0].data.should.be.array().ofSize(1);
        res[0].data[0].should.be.an('object');
        res[0].data[0].should.have.property('title').equal('Hello World!');
        console.log('All tests have been passed successfully');
        return true;
    }
    catch (e) {
        console.error(e);
        return false;
    }
})();
