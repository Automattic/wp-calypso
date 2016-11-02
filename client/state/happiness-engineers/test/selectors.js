/**
 * External dependencies
 */
import assert from 'assert';

/**
 * Internal dependencies
 */
import {
	isRequesting,
	getHappinessEngineers
} from '../selectors';

describe( 'selectors', () => {
	describe( 'isRequesting()', () => {
		it( 'should return the value', () => {
			assert( isRequesting( { happinessEngineers: { requesting: false } } ) === false );
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
