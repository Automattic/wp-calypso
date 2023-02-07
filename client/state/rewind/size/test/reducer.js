import { REWIND_SIZE_GET, REWIND_SIZE_SET } from 'calypso/state/action-types';
import sizeReducer from '../reducer';

describe( 'rewind.size reducers', () => {
	describe( 'retentionDays', () => {
		it.each( [
			{
				state: undefined,
				action: {},
				expected: null,
			},
			{
				state: undefined,
				action: { type: REWIND_SIZE_GET },
				expected: null,
			},
			{
				state: { retentionDays: 30 },
				action: { type: REWIND_SIZE_GET },
				expected: 30,
			},
			{
				state: { retentionDays: 30 },
				action: { type: REWIND_SIZE_SET, size: { retentionDays: 7 } },
				expected: 7,
			},
		] )(
			'should return a value different than null only when the state has a value or the action is REWIND_SIZE_SET',
			( { state, action, expected } ) => {
				expect( sizeReducer( state, action ).retentionDays ).toEqual( expected );
			}
		);
	} );
} );
