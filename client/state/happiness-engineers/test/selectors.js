/**
 * External dependencies
 */
import assert from 'assert';

/**
 * Internal dependencies
 */
import {
	isRequestingHappinessEngineers,
	getHappinessEngineers
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
} );
