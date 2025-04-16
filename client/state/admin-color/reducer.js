import { withStorageKey } from '@automattic/state-utils';
import { ADMIN_COLOR_RECEIVE } from 'calypso/state/action-types';
import { keyedReducer, withPersistence } from 'calypso/state/utils';
import 'calypso/state/data-layer/wpcom/sites/admin-color';

const adminColorReducer = ( state = [], action ) => {
	switch ( action.type ) {
		case ADMIN_COLOR_RECEIVE:
			return action.adminColor;
		default:
			return state;
	}
};

export default withStorageKey(
	'adminColor',
	keyedReducer( 'siteId', withPersistence( adminColorReducer ) )
);
