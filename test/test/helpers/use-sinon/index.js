/**
 * External dependencies
 */
import sinon from 'sinon';
import { isFunction, noop } from 'lodash';

/**
 * Use sinon's fake time controls
 *
 * This helper spins up and down sinon's fake clock.
 * If you provide a callback, it will be invoked with the clock instance created by sinon.
 *
 * You can pass clockCallback as the first argument with no 'now' if you wish
 *
 * See http://sinonjs.org/docs/#clock
 * @param  {number} now The timestamp to set "now" to.
 * @param  {Function} clockCallback  A function invoked with the clock created by sinon
 * @deprecated Use Jest's timer mocks instead (https://facebook.github.io/jest/docs/timer-mocks.html)
 */
export function useFakeTimers( now = 0, clockCallback = noop ) {
	let clock;

	if ( isFunction( now ) && clockCallback === noop ) {
		clockCallback = now;
		now = 0;
	}

	beforeAll( function turnOnSinonFakeTimers() {
		clock = sinon.useFakeTimers( now );
		clockCallback( clock );
	} );

	afterAll( function turnOffSinonFakeTimers() {
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
 * @param  {object|Function} config The configuration to use, or a callback that is invoked with the sandbox instance
 * @param  {Function} sandboxCallback A callback function that is invoked with the sandbox instance
 * @deprecated Use Jest's mock functions instead (https://facebook.github.io/jest/docs/mock-functions.html)
 */
export function useSandbox( config, sandboxCallback = noop ) {
	let sandbox;

	if ( isFunction( config ) && sandboxCallback === noop ) {
		sandboxCallback = config;
		config = undefined;
	}

	beforeAll( () => {
		sandbox = sinon.createSandbox( config );
		sandboxCallback( sandbox );
	} );

	beforeEach( () => {
		if ( sandbox ) {
			sandbox.resetHistory();
		}
	} );

	afterAll( () => {
		if ( sandbox ) {
			sandbox.restore();
			sandbox = null;
		}
	} );
}
