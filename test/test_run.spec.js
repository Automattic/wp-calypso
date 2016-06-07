var chai = require('chai');
var expect = chai.expect;
var testFramework = require('../index');
var TestRun = testFramework.TestRun;

describe('TestRun class', function() {
	var run;

	beforeEach(function() {
		run = new TestRun({
			sauceBrowserSettings: {
				resolutions: ['10_x_10'],
				id: 'rowdy_browser_id',
				other: true
			},
			sauceSettings: {
				useTunnels: true
			},
			tunnelId: 'TUNN_ID',
			mockingPort: 10,
			seleniumPort: 4444,
			locator: {
				name: 'The full name of the test to run'
			}
		});
	});

	it('instantiates', function() {
		// create a new run (local-only, simpler than the one used in the rest of the tests)
		var run = new TestRun({
			prop: true,
			environmentId: 'chrome'
		});
		expect(run.prop).to.be.true; // copies all given options
		expect(run.rowdyBrowser).to.equal('local.chrome');
		expect(run.sauceBrowserSettings).to.be.an('object');
	});

	it('instantiates with saucelabs settings', function() {
		expect(run.sauceBrowserSettings).to.not.have.property('resolutions');
		expect(run.sauceBrowserSettings).to.not.have.property('id');
		expect(run.rowdyBrowser).to.equal('sauceLabs.rowdy_browser_id');
		expect(run.tunnelId).to.equal('TUNN_ID');
	});

	it('returns path to mocha', function() {
		expect(run.getCommand()).to.equal('./node_modules/.bin/mocha');
	});

	it('returns the environment for a run', function() {
		var env = run.getEnvironment({
			NODE_CONFIG: {foo: 'bar'}
		});

		// these values are super important, to be used by the testing tools in the worker processes
		expect(env).to.deep.equal({
			MOCKING_PORT: 10,
			FUNC_PORT: 10,
			desiredCapabilities: {other: true},
			NODE_CONFIG: '{"foo":"bar","MOCKING_PORT":10,"FUNC_PORT":10,"desiredCapabilities":{"other":true}}',
			ROWDY_SETTINGS: 'sauceLabs.rowdy_browser_id',
			ROWDY_OPTIONS: '{"server":{"port":4444},"client":{"port":4444}}',
			SAUCE_CONNECT_TUNNEL_ID: 'TUNN_ID'
		});
	});

	it('returns the arguments for a run', function() {
		testFramework.initialize({
			'mocha_tests': ['path/to/specs', 'another/path/to/specs'],
			'mocha_opts': 'path/to/mocha.opts'
		});

		var args = run.getArguments();
		expect(args).to.deep.equal([
			'--mocking_port=10',
			'--worker=1',
			'-g',
			'The full name of the test to run',
			'--opts',
			'path/to/mocha.opts',
			'path/to/specs',
			'another/path/to/specs'
		]);
	});

	it('returns the arguments for a run with characters that needs to be escaped in title', function() {
		testFramework.initialize({
			'mocha_tests': ['path/to/specs', 'another/path/to/specs'],
			'mocha_opts': 'path/to/mocha.opts'
		});

		var localRun = new TestRun({
			locator: {
				name: 'The full name of the test to run, with ()[]+*.$^'
			}
		});
		var args = localRun.getArguments();
		expect(args).to.deep.equal([
      '--mocking_port=undefined',
			'--worker=1',
			'-g',
			'The full name of the test to run, with \\(\\)\\[\\]\\+\\*\\.\\$\\^',
			'--opts',
			'path/to/mocha.opts',
			'path/to/specs',
			'another/path/to/specs'
		]);
	});
});
