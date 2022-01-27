import {
	REWIND_BACKUPS_REQUEST,
	REWIND_BACKUPS_SET,
	REWIND_BACKUPS_REQUEST_SUCCESS,
	REWIND_BACKUPS_REQUEST_FAILURE,
} from 'calypso/state/action-types';

/**
 * Returns the updated backups state after an action has been dispatched. The
 * state maps site ID to the rewind backups object.
 */
// export default ( state = {}, { type, backups } ) =>
// 	type === REWIND_BACKUPS_SET ? backups : state;

export default ( state = {}, { type, backups } ) => {
	switch ( type ) {
		case REWIND_BACKUPS_REQUEST:
			return {
				backups,
				requestStatus: 'pending',
			};
		case REWIND_BACKUPS_REQUEST_SUCCESS:
			return {
				backups,
				requestStatus: 'success',
			};
		case REWIND_BACKUPS_REQUEST_FAILURE:
			return {
				backups,
				requestStatus: 'failure',
			};
		case REWIND_BACKUPS_SET:
			return {
				backups,
				requestStatus: state.requestStatus,
			};
	}

	return state;
};
