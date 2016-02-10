var assert = require("assert");
var TestRunner = require("../src/test_runner");
var _ = require("lodash");
var settings = require("../src/settings");
var WorkerAllocator = require("../src/worker_allocator");

settings.framework = "magellan-fake";
settings.testFramework = require("../test_support/magellan-selftest-plugin/index");
settings.testFramework.initialize({});

var MAX_WORKERS = 1;

var baseOptions = {
  debug: false,
  maxWorkers: MAX_WORKERS,
  maxTestAttempts: 1,
  browsers: ["phantomjs"],
  listeners: [],
  bailFast: false,
  bailOnThreshold: false,
  serial: false,

  allocator: undefined,
  sauceSettings: undefined
};

describe("test runner", function () {

  describe("single worker", function () {
    this.timeout(6000);

    it("runs zero tests", function (done) {
      var options = _.extend({}, baseOptions, {
        onSuccess: done
      });

      var runner = new TestRunner([], options);
      runner.start();
    });

    it("runs one test @testtag", function (done) {
      this.timeout(6000);

      var workerAllocator = new WorkerAllocator(MAX_WORKERS);

      var options = _.extend({}, baseOptions, {
        allocator: workerAllocator,
        onSuccess: done
      });

      workerAllocator.initialize(function (err) {
        var runner = new TestRunner(["fake_test1"], options);
        runner.start();
      });
    });

    it("fails one test @testtag", function (done) {
      this.timeout(6000);

      var workerAllocator = new WorkerAllocator(MAX_WORKERS);

      var options = _.extend({}, baseOptions, {
        allocator: workerAllocator,
        onFailure: function () {
          done();
        }
      });

      workerAllocator.initialize(function (err) {
        var runner = new TestRunner(["fail_test1"], options);
        runner.start();
      });
    });


  });

  describe("multi-worker", function () {
    this.timeout(6000);

    var MAX_WORKERS = 8;
    var multiWorkerBaseOptions = _.extend({}, baseOptions, {
      maxWorkers: MAX_WORKERS
    });

    it("runs zero tests @testtag @multi", function (done) {
      var options = _.extend({}, multiWorkerBaseOptions, {
        onSuccess: done
      });

      var runner = new TestRunner([], options);
      runner.start();
    });

    it("runs one test", function (done) {
      this.timeout(6000);

      var workerAllocator = new WorkerAllocator(MAX_WORKERS);

      var options = _.extend({}, multiWorkerBaseOptions, {
        allocator: workerAllocator,
        onSuccess: done
      });

      workerAllocator.initialize(function (err) {
        var runner = new TestRunner(["fake_test1"], options);
        runner.start();
      });
    });

    it("runs many tests", function (done) {
      this.timeout(25000);

      var workerAllocator = new WorkerAllocator(MAX_WORKERS);

      var options = _.extend({}, multiWorkerBaseOptions, {
        allocator: workerAllocator,
        onSuccess: done
      });

      var tests = [];
      for (var i = 0; i < 14; i++) {
        tests.push("fake_test" + i);
      }

      workerAllocator.initialize(function (err) {
        var runner = new TestRunner(tests, options);
        runner.start();
      });
    });

    it("runs many tests and fails two", function (done) {
      this.timeout(25000);

      var workerAllocator = new WorkerAllocator(MAX_WORKERS);

      var options = _.extend({}, multiWorkerBaseOptions, {
        allocator: workerAllocator,
        onFailure: function () {
          done();
        }
      });

      var tests = [];
      for (var i = 0; i < 14; i++) {
        if (i == 7 || i == 11) {
          tests.push("fail_test" + i);
        } else {
          tests.push("fake_test" + i);
        }
      }

      workerAllocator.initialize(function (err) {
        var runner = new TestRunner(tests, options);
        runner.start();
      });
    });


  });
});