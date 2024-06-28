import { withStorageKey } from '@automattic/state-utils';
import { ADMIN_COLOR_RECEIVE, ADMIN_COLOR_SAVE_SUCCESS } from 'calypso/state/action-types';
import { keyedReducer, withPersistence } from 'calypso/state/utils';
import 'calypso/state/data-layer/wpcom/sites/admin-color';

const adminColorReducer = ( state = [], action ) => {
	switch ( action.type ) {
		case ADMIN_COLOR_RECEIVE:
		case ADMIN_COLOR_SAVE_SUCCESS:
			return action.adminColor;
		default:
			return state;
	}
};

export default withStorageKey(
	'adminColor',
	keyedReducer( 'siteId', withPersistence( adminColorReducer ) )
);
