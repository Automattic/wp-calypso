import { withStorageKey } from '@automattic/state-utils';
import { ADMIN_COLOR_RECEIVE, ADMIN_COLOR_REQUEST_FAILURE } from 'calypso/state/action-types';
import { keyedReducer, withPersistence } from 'calypso/state/utils';
import 'calypso/state/data-layer/wpcom/sites/admin-color';

const fallbackAdminColor = 'default'; // packages/calypso-color-schemes/src/shared/color-schemes/_default.scss

const adminColorReducer = ( state = [], action ) => {
	switch ( action.type ) {
		case ADMIN_COLOR_RECEIVE:
			return action.adminColor || fallbackAdminColor;
		case ADMIN_COLOR_REQUEST_FAILURE:
			return fallbackAdminColor;
		default:
			return state;
	}
};

export default withStorageKey(
	'adminColor',
	keyedReducer( 'siteId', withPersistence( adminColorReducer ) )
);
