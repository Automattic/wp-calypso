import { withStorageKey } from '@automattic/state-utils';
import { USER_PROFILE_RECEIVE } from 'calypso/state/action-types';
import { keyedReducer, withPersistence } from 'calypso/state/utils';
import 'calypso/state/data-layer/wpcom/sites/user-profile';

const userProfileReducer = ( state = [], action ) => {
	switch ( action.type ) {
		case USER_PROFILE_RECEIVE:
			return action.profile;
		default:
			return state;
	}
};

export default withStorageKey(
	'userProfile',
	keyedReducer( 'siteId', withPersistence( userProfileReducer ) )
);
