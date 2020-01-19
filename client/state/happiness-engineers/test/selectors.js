/**
 * External dependencies
 */
import assert from 'assert'; // eslint-disable-line import/no-nodejs-modules

/**
 * Internal dependencies
 */
import {
	isRequestingHappinessEngineers,
	getHappinessEngineers,
	hasReceivedHappinessEngineers,
} from '../selectors';

describe( 'selectors', () => {
	describe( 'isRequestingHappinessEngineers()', () => {
		test( 'should return the value', () => {
			assert(
				isRequestingHappinessEngineers( { happinessEngineers: { requesting: false } } ) === false
			);
		} );
	} );

	const getState = () => ( {
		happinessEngineers: {
			items: [ 'test 1', 'test 2' ],
		},
	} );

	describe( 'getHappinessEngineers()', () => {
		test( 'should return happiness engineers', () => {
			assert.deepEqual( getHappinessEngineers( getState() ), [ 'test 1', 'test 2' ] );
		} );
	} );

	describe( 'hasReceivedHappinessEngineers()', () => {
		test( 'should return true if some state', () => {
			assert( hasReceivedHappinessEngineers( getState() ) === true );
		} );

		test( 'should return false if null', () => {
			assert( hasReceivedHappinessEngineers( { happinessEngineers: { items: null } } ) === false );
		} );
	} );
} );
