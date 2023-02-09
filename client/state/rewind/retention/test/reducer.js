import {
	JETPACK_BACKUP_RETENTION_UPDATE,
	JETPACK_BACKUP_RETENTION_UPDATE_ERROR,
	JETPACK_BACKUP_RETENTION_UPDATE_SUCCESS,
} from 'calypso/state/action-types';
import retentionReducer from '../reducer';

describe( 'rewind.retention reducers', () => {
	describe( 'updateBackupRetentionRequestStatus', () => {
		it.each( [
			{
				state: undefined,
				action: {},
				expected: null,
			},
			{
				state: undefined,
				action: { type: JETPACK_BACKUP_RETENTION_UPDATE },
				expected: 'pending',
			},
			{
				state: { updateBackupRetentionRequestStatus: 'pending' },
				action: { type: JETPACK_BACKUP_RETENTION_UPDATE_SUCCESS },
				expected: 'success',
			},
			{
				state: { updateBackupRetentionRequestStatus: 'pending' },
				action: { type: JETPACK_BACKUP_RETENTION_UPDATE_ERROR },
				expected: 'failed',
			},
		] )(
			'should return a value different than null only when the state has a value or the action is (JETPACK_BACKUP_RETENTION_UPDATE, JETPACK_BACKUP_RETENTION_UPDATE_SUCCESS, REWIND_BACKUP_RETENTION_ERROR)',
			( { state, action, expected } ) => {
				expect( retentionReducer( state, action ).updateBackupRetentionRequestStatus ).toEqual(
					expected
				);
			}
		);
	} );
} );
