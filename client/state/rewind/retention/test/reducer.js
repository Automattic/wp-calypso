import {
	JETPACK_BACKUP_RETENTION_UPDATE_ERROR,
	JETPACK_BACKUP_RETENTION_UPDATE_SUCCESS,
} from 'calypso/state/action-types';
import { requestSize } from '../../size/actions';
import { updateBackupRetention } from '../actions';
import { BACKUP_RETENTION_UPDATE_REQUEST } from '../constants';
import retention from '../reducer';

describe( 'updateBackupRetentionRequestStatus', () => {
	const mockUpdateRequestInitiated = {
		updateBackupRetentionRequestStatus: BACKUP_RETENTION_UPDATE_REQUEST.PENDING,
	};

	const updateSuccessAction = { type: JETPACK_BACKUP_RETENTION_UPDATE_SUCCESS };
	const updateFailedAction = { type: JETPACK_BACKUP_RETENTION_UPDATE_ERROR };

	test( 'should default to UNSUBMITTED when receiving other non-retention update related actions', () => {
		// lets ensure that state is not modified when passed an unrelated action.
		expect( retention( undefined, requestSize ).updateRequestStatus ).toEqual(
			BACKUP_RETENTION_UPDATE_REQUEST.UNSUBMITTED
		);
	} );

	test( 'should return PENDING status when retention update request action is initiated', () => {
		// lets update backup retention for siteId:123 to 7 days.
		expect( retention( undefined, updateBackupRetention( 123, 7 ) ).updateRequestStatus ).toEqual(
			BACKUP_RETENTION_UPDATE_REQUEST.PENDING
		);
	} );

	test( 'should return SUCCESS status when retention update request action gets completed successfully', () => {
		expect(
			retention( mockUpdateRequestInitiated, updateSuccessAction ).updateRequestStatus
		).toEqual( BACKUP_RETENTION_UPDATE_REQUEST.SUCCESS );
	} );

	test( 'should return PENDING status when retention update request action gets failed', () => {
		expect(
			retention( mockUpdateRequestInitiated, updateFailedAction ).updateRequestStatus
		).toEqual( BACKUP_RETENTION_UPDATE_REQUEST.FAILED );
	} );
} );
