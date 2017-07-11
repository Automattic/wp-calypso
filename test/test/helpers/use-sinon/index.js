import sinon from 'sinon';
import noop from 'lodash/noop';
import isFunction from 'lodash/isFunction';

/**
 * Use sinon's fake time controls
 *
 * This helper spins up and down sinon's fake clock.
 * If you provide a callback, it will be invoked with the clock instance created by sinon.
 * This allows you to get at the clock instance even if you're using arrow functions in your test
 * and cannot access the `this` provided by mocha.
 *
 * You can pass clockCallback as the first argument with no 'now' if you wish
 *
 * See http://sinonjs.org/docs/#clock
 * @param  {Number} now The timestamp to set "now" to.
 * @param  {Function} clockCallback  A function invoked with the clock created by sinon
 */
export function useFakeTimers( now = 0, clockCallback = noop ) {
	let clock;

	if ( isFunction( now ) && clockCallback === noop ) {
		clockCallback = now;
		now = 0;
	}

	// these _cannot_ be arrow functions because we're using the `this` that mocha provides
	before( function turnOnSinonFakeTimers() {
		clock = sinon.useFakeTimers( now );
		clockCallback( clock );
	} );

	after( function turnOffSinonFakeTimers() {
		if ( clock ) {
			clock.restore();
			clock = null;
		}
	} );
}

/**
 * Use a full sinon sandbox for this test block
 *
 * See http://sinonjs.org/docs/#sandbox
 *
 * @param  {Object|Function} config The configuration to use, or a callback that is invoked with the sandbox instance
 * @param  {Function} sandboxCallback A callback function that is invoked with the sandbox instance
 */
export function useSandbox( config, sandboxCallback = noop ) {
	let sandbox;

	if ( isFunction( config ) && sandboxCallback === noop ) {
		sandboxCallback = config;
		config = undefined;
	}

	before( function() {
		sandbox = sinon.sandbox.create( config );
		sandboxCallback( sandbox );
	} );

	beforeEach( function() {
		sandbox.reset();
	} );

	after( function() {
		if ( sandbox ) {
			sandbox.restore();
			sandbox = null;
		}
	} );
}
