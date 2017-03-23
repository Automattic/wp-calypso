var deterministicStringify = require('lib/deterministic-stringify');

var assert = require('assert');

describe('index', function() {
    it('should handle boolean', function() {
        assert.equal('true', deterministicStringify(true));
        assert.equal('false', deterministicStringify(false));
    });
    it('should handle number', function() {
        assert.equal('1', deterministicStringify(1));
    });
    it('should handle null', function() {
        assert.equal('null', deterministicStringify(null));
    });
    it('should handle undefined', function() {
        assert.equal('undefined', deterministicStringify(undefined));
    });
    it('should sort arrays', function() {
        assert.equal('1,2,3', deterministicStringify([2, 1, 3]));
    });
    it('should handle nested objects', function() {
        assert.equal('1,a=1', deterministicStringify([1, { a: 1 }]));
    });
    it('should handle boolean as object values', function() {
        assert.equal('a=true', deterministicStringify({ a: true }));
    });
    it('should alphabetize object attributes', function() {
        assert.equal("a='a','b'&b=1", deterministicStringify({ b: 1, a: ['b', 'a'] }));
    });
    it('should allow nesting and sort nested arrays', function() {
        assert.equal("a='a','blah','c'", deterministicStringify({ a: ['blah', 'a', 'c'] }));
    });
    it('should produce deterministic strings regardless of attribute or array order', function() {
        var options, optionsDifferentSort;
        options = {
            b: [2, 1],
            a: true,
        };
        optionsDifferentSort = {
            a: true,
            b: [1, 2],
        };
        assert.equal(deterministicStringify(options), deterministicStringify(optionsDifferentSort));
    });
});
