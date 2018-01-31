/** @format */
/**
 * External dependencies
 */
import i18n from 'i18n-calypso';
import page from 'page';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getHappychatAuth } from 'state/happychat/utils';
import hasActiveHappychatSession from 'state/happychat/selectors/has-active-happychat-session';
import isHappychatAvailable from 'state/happychat/selectors/is-happychat-available';
import isHappychatConnectionUninitialized from 'state/happychat/selectors/is-happychat-connection-uninitialized';
import { initConnection } from 'state/happychat/connection/actions';
import { openChat } from 'state/happychat/ui/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import {
	JETPACK_CREDENTIALS_UPDATE,
	JETPACK_CREDENTIALS_UPDATE_SUCCESS,
	JETPACK_CREDENTIALS_UPDATE_FAILURE,
	JETPACK_CREDENTIALS_STORE,
	REWIND_STATE_UPDATE,
} from 'state/action-types';
import { successNotice, errorNotice } from 'state/notices/actions';
import { transformApi } from 'state/data-layer/wpcom/sites/rewind/api-transformer';

export const request = ( { dispatch }, action ) => {
	const notice = successNotice( i18n.translate( 'Testing connection…' ), { duration: 30000 } );
	const { notice: { noticeId } } = notice;

	dispatch( notice );

	const { path, ...otherCredentials } = action.credentials;
	const credentials = { ...otherCredentials, abspath: path };

	dispatch(
		http(
			{
				apiVersion: '1.1',
				method: 'POST',
				path: `/activity-log/${ action.siteId }/update-credentials`,
				body: { credentials },
			},
			{ ...action, noticeId }
		)
	);
};

export const success = ( { dispatch }, action, { rewind_state } ) => {
	dispatch( {
		type: JETPACK_CREDENTIALS_UPDATE_SUCCESS,
		siteId: action.siteId,
	} );

	dispatch( {
		type: JETPACK_CREDENTIALS_STORE,
		credentials: {
			main: action.credentials,
		},
		siteId: action.siteId,
	} );

	dispatch(
		successNotice( i18n.translate( 'Your site is now connected.' ), {
			duration: 4000,
			id: action.noticeId,
		} )
	);

	// the API transform could fail and the rewind data might
	// be unavailable so if that's the case just let it go
	// for now. we'll improve our rigor as time goes by.
	try {
		dispatch( {
			type: REWIND_STATE_UPDATE,
			siteId: action.siteId,
			data: transformApi( rewind_state ),
		} );
	} catch ( e ) {}
};

export const failure = ( { dispatch, getState }, action, error ) => {
	dispatch( {
		type: JETPACK_CREDENTIALS_UPDATE_FAILURE,
		error,
		siteId: action.siteId,
	} );

	const state = getState();
	const getAuth = getHappychatAuth( state );

	if ( isHappychatConnectionUninitialized( state ) ) {
		dispatch( initConnection( getAuth() ) );
	}

	const getHelp = () => {
		const clickState = getState();
		const canChat = isHappychatAvailable( clickState ) || hasActiveHappychatSession( clickState );

		return canChat ? dispatch( openChat() ) : page( '/help' );
	};

	const { translate } = i18n;
	const [ errorMessage, extraOptions ] = get(
		{
			service_unavailable: () => [
				translate(
					"Our service isn't working at the moment. " +
						"We'll get it up and running as fast as we can, so please try again later."
				),
				{
					button: translate( 'Try again' ),
					onClick: () => dispatch( action ),
				},
			],
			missing_args: () => [
				translate( 'Something seems to be missing — please fill out all the required fields.' ),
				null,
			],
			invalid_args: () => [
				translate(
					'The information you entered seems to be incorrect. ' +
						"Let's take another look to ensure everything is in the right place."
				),
				null,
			],
			invalid_credentials: () => [
				translate(
					"Oops! We couldn't connect to your site with these credentials " +
						"— let's give it another try."
				),
				null,
			],
			invalid_wordpress_path: () => [
				translate(
					'We looked for `wp-config.php` in the WordPress installation path you provided ' +
						"but couldn't find it."
				),
				{
					button: translate( 'Get help' ),
					onClick: getHelp,
				},
			],
			read_only_install: () => [
				translate(
					'It looks like your server is read-only. ' +
						'To create backups and rewind your site, we need permission to write to your server.'
				),
				{
					button: translate( 'Get help' ),
					onClick: getHelp,
				},
			],
			unreachable_path: () => [
				translate(
					'We tried to access your WordPress installation through its publicly available URL, ' +
						"but it didn't work. Please make sure the directory is accessible and try again."
				),
				null,
			],
		},
		error.error,
		() => [ translate( 'Error saving. Please check your credentials and try again.' ), null ]
	)();

	const baseOptions = { duration: 4000, id: action.noticeId };
	dispatch(
		errorNotice( errorMessage, extraOptions ? { ...baseOptions, ...extraOptions } : baseOptions )
	);
};

export default {
	[ JETPACK_CREDENTIALS_UPDATE ]: [ dispatchRequest( request, success, failure ) ],
};
