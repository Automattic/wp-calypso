/**
 * External dependencies
 */
import assert from 'assert';

/**
 * Internal dependencies
 */
import {
	isRequestingHappinessEngineers,
	getHappinessEngineers,
	hasReceivedHappinessEngineers
} from '../selectors';

describe( 'selectors', () => {
	describe( 'isRequestingHappinessEngineers()', () => {
		it( 'should return the value', () => {
			assert( isRequestingHappinessEngineers( { happinessEngineers: { requesting: false } } ) === false );
		} );
	} );

	const getState = () => (
		{
			happinessEngineers: {
				items: [ 'test 1', 'test 2' ]
			}
		}
	);

	describe( 'getHappinessEngineers()', () => {
		it( 'should return happiness engineers', () => {
			assert.deepEqual(
				getHappinessEngineers( getState() ),
				[ 'test 1', 'test 2' ]
			);
		} );
	} );

	describe( 'hasReceivedHappinessEngineers()', () => {
		it( 'should return true if some state', () => {
			assert( hasReceivedHappinessEngineers( getState() ) === true );
		} );

		it( 'should return false if null', () => {
			assert( hasReceivedHappinessEngineers( { happinessEngineers: { items: null } } ) === false );
		} );
	} );
} );
