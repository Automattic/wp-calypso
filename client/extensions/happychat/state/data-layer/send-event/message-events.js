/**
 * Internal dependencies
 */
import {
	getCurrentUser,
} from 'state/current-user/selectors';
import {
	// sendEvent actions
	COMMENTS_CHANGE_STATUS,
	EXPORT_COMPLETE,
	EXPORT_FAILURE,
	EXPORT_STARTED,
	POST_SAVE_SUCCESS,
	PUBLICIZE_CONNECTION_CREATE,
	PUBLICIZE_CONNECTION_DELETE,
	ROUTE_SET,
	SITE_SETTINGS_SAVE_SUCCESS,
	// end of sendEvent actions
} from 'state/action-types';
import {
	HAPPYCHAT_BLUR,
	HAPPYCHAT_FOCUS,
} from 'extensions/happychat/state/action-types';

const getEventMessage = {
	// [ REDUX_ACTION_TO_LISTEN ]: ( store, action ) => 'this function returns a text to be send to HUD',
	[ COMMENTS_CHANGE_STATUS ]: ( store, action ) => `Changed a comment's status to "${ action.status }"`,
	[ EXPORT_COMPLETE ]: ( ) => 'Export completed',
	[ EXPORT_FAILURE ]: ( store, action ) => `Export failed: ${ action.error.message }`,
	[ EXPORT_STARTED ]: ( ) => 'Started an export',
	[ HAPPYCHAT_BLUR ]: ( ) => 'Stopped looking at Happychat',
	[ HAPPYCHAT_FOCUS ]: ( ) => 'Started looking at Happychat',
	[ POST_SAVE_SUCCESS ]: ( store, action ) => `Saved post "${ action.savedPost.title }" ${ action.savedPost.short_URL }`,
	[ PUBLICIZE_CONNECTION_CREATE ]: ( store, action ) => `Connected ${ action.connection.label } sharing`,
	[ PUBLICIZE_CONNECTION_DELETE ]: ( store, action ) => `Disconnected ${ action.connection.label } sharing`,
	[ ROUTE_SET ]: ( store, action ) => {
		const currentUser = getCurrentUser( store.getState() );
		return `Looking at https://wordpress.com${ action.path }?support_user=${ currentUser.username }`;
	},
	[ SITE_SETTINGS_SAVE_SUCCESS ]: ( ) => 'Saved site settings',
};

export default getEventMessage;
