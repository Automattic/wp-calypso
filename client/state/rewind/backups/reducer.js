import { REWIND_BACKUPS_SET } from 'calypso/state/action-types';

/**
 * Returns the updated backups state after an action has been dispatched. The
 * state maps site ID to the rewind backups object.
 */
// export default ( state = {}, { type, backups } ) =>
// 	type === REWIND_BACKUPS_SET ? backups : state;

export default ( state = {}, { type, backups } ) => {
	switch ( type ) {
		case REWIND_BACKUPS_SET:
			return {
				backups,
				requestStatus: state.requestStatus,
				isInitialized: true,
			};
	}

	return state;
};
