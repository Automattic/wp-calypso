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
			assert( isRequesting( { happinessengineers: { requesting: false } } ) === false );
		} );
	} );

	const getState = () => (
		{
			happinessengineers: {
				items: {
					'test 1': { avatar_URL: 'test 1' },
					'test 2': { avatar_URL: 'test 2' }
				}
			}
		}
	);

	describe( 'getHappinessEngineers()', () => {
		it( 'should return happiness engineers', () => {
			assert.deepEqual(
				getHappinessEngineers( getState() ),
				{
					'test 1': { avatar_URL: 'test 1' },
					'test 2': { avatar_URL: 'test 2' }
				}
			);
		} );
	} );
} );
