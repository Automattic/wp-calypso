import { REWIND_SIZE_GET, REWIND_SIZE_SET } from 'calypso/state/action-types';
import sizeReducer from '../reducer';

// @TODO: Add tests for the other reducers
describe( 'rewind.size reducers', () => {
	describe( 'lastBackupSize', () => {
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
				state: { lastBackupSize: 100 },
				action: { type: REWIND_SIZE_GET },
				expected: 100,
			},
			{
				state: { lastBackupSize: 100 },
				action: { type: REWIND_SIZE_SET, size: { lastBackupSize: 200 } },
				expected: 200,
			},
		] )(
			'should return a value different than null only when the state has a value or the action is REWIND_SIZE_SET',
			( { state, action, expected } ) => {
				expect( sizeReducer( state, action ).lastBackupSize ).toEqual( expected );
			}
		);
	} );
  
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
