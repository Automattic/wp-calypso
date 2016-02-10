var chai = require("chai");
var expect = chai.expect;

var testFramework = require("../index");
testFramework.initialize({
  "mocha_tests": ["./test_support/mock_mocha_tests"]
});

var getTests = testFramework.iterator;

describe("mocha support", function () {

  describe("test iterator", function () {

    it("finds tests", function () {
      var tests = getTests();
      expect(tests).to.have.length(7);
    });

  });

});