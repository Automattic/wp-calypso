import { withStorageKey } from '@automattic/state-utils';
import { omit } from 'lodash';
import {
	JETPACK_MANAGE_PERSISTENT_NOTICE_CREATE,
	JETPACK_MANAGE_PERSISTENT_NOTICE_REMOVE,
} from 'calypso/state/action-types';

export const items = ( state = {}, action ) => {
	switch ( action.type ) {
		case JETPACK_MANAGE_PERSISTENT_NOTICE_CREATE: {
			const { notice } = action;
			return {
				...state,
				[ notice.noticeId ]: notice,
			};
		}
		case JETPACK_MANAGE_PERSISTENT_NOTICE_REMOVE: {
			const { noticeId } = action;
			if ( ! state.hasOwnProperty( noticeId ) ) {
				return state;
			}

			return omit( state, noticeId );
		}
	}

	return state;
};

export default withStorageKey( 'jetpackManagePersistentNotices', items );
