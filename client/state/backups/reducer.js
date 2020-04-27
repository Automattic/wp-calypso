/**
 * Internal dependencies
 */
import { keyedReducer } from 'state/utils';
import { BACKUPS_REQUEST_SUCCESS } from 'state/action-types';

export const backupsReducer = ( state = null, action ) => {
	switch ( action.type ) {
		case BACKUPS_REQUEST_SUCCESS:
			return (
				action.backups?.reduce(
					( acc, backup ) => ( { ...acc, [ backup.activityDate ]: backup } ),
					{}
				) ?? []
			);
	}
	return state;
};

export default keyedReducer( 'siteId', backupsReducer );
