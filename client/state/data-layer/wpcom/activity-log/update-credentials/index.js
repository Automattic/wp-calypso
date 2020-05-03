/**
 * External dependencies
 */
import i18n from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';
import { getHappychatAuth } from 'state/happychat/utils';
import hasActiveHappychatSession from 'state/happychat/selectors/has-active-happychat-session';
import isHappychatAvailable from 'state/happychat/selectors/is-happychat-available';
import isHappychatConnectionUninitialized from 'state/happychat/selectors/is-happychat-connection-uninitialized';
import { initConnection, sendEvent } from 'state/happychat/connection/actions';
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

import { registerHandlers } from 'state/data-layer/handler-registry';

const navigateTo =
	undefined !== typeof window
		? ( path ) => window.open( path, '_blank' )
		: ( path ) => page( path );

/**
 * Makes sure that we can initialize a connection
 * to HappyChat. We'll need this on the API response
 *
 * @param {object} args Redux dispatcher, getState
 */
export const primeHappychat = ( { dispatch, getState } ) => {
	const state = getState();
	const getAuth = getHappychatAuth( state );

	if ( isHappychatConnectionUninitialized( state ) ) {
		dispatch( initConnection( getAuth() ) );
	}
};

export const request = ( action ) => {
	const notice = successNotice( i18n.translate( 'Testing connection…' ), { duration: 30000 } );
	const {
		notice: { noticeId },
	} = notice;

	const { path, ...otherCredentials } = action.credentials;
	const credentials = { ...otherCredentials, abspath: path };

	const tracksEvent = recordTracksEvent( 'calypso_rewind_creds_update_attempt', {
		site_id: action.siteId,
		protocol: action.credentials.protocol,
	} );

	return [
		notice,
		tracksEvent,
		http(
			{
				apiNamespace: 'wpcom/v2',
				method: 'POST',
				path: `/sites/${ action.siteId }/rewind/credentials/update`,
				body: { credentials },
			},
			{ ...action, noticeId }
		),
	];
};

export const success = ( action, { rewind_state } ) => [
	{
		type: JETPACK_CREDENTIALS_UPDATE_SUCCESS,
		siteId: action.siteId,
	},

	{
		type: JETPACK_CREDENTIALS_STORE,
		credentials: {
			main: action.credentials,
		},
		siteId: action.siteId,
	},
	successNotice( i18n.translate( 'Your site is now connected.' ), {
		duration: 4000,
		id: action.noticeId,
	} ),
	recordTracksEvent( 'calypso_rewind_creds_update_success', {
		site_id: action.siteId,
		protocol: action.credentials.protocol,
	} ),
	// the API transform could fail and the rewind data might
	// be unavailable so if that's the case just let it go
	// for now. we'll improve our rigor as time goes by.
	( () => {
		try {
			return {
				type: REWIND_STATE_UPDATE,
				siteId: action.siteId,
				data: transformApi( rewind_state ),
			};
		} catch ( e ) {}
	} )(),
];

export const failure = ( action, error ) => ( dispatch, getState ) => {
	dispatch( {
		type: JETPACK_CREDENTIALS_UPDATE_FAILURE,
		error,
		siteId: action.siteId,
	} );

	const getHelp = () => {
		const state = getState();
		const canChat = isHappychatAvailable( state ) || hasActiveHappychatSession( state );

		return canChat ? dispatch( openChat() ) : navigateTo( '/help' );
	};

	const baseOptions = { duration: 10000, id: action.noticeId };

	const announce = ( message, options ) =>
		dispatch( errorNotice( message, options ? { ...baseOptions, ...options } : baseOptions ) );

	const spreadHappiness = ( message ) => {
		const tracksEvent = recordTracksEvent( 'calypso_rewind_creds_update_failure', {
			site_id: action.siteId,
			error: error.error,
			status_code: error.statusCode,
			host: action.credentials.host,
			kpri: action.credentials.krpi ? 'provided but [omitted here]' : 'not provided',
			pass: action.credentials.pass ? 'provided but [omitted here]' : 'not provided',
			path: action.credentials.path,
			port: action.credentials.port,
			protocol: action.credentials.protocol,
			user: action.credentials.user,
		} );

		dispatch(
			hasActiveHappychatSession( getState() )
				? withAnalytics( tracksEvent, sendEvent( message ) )
				: tracksEvent
		);
	};

	switch ( error.error ) {
		case 'service_unavailable':
			announce(
				i18n.translate(
					'A error occurred when we were trying to validate your site information. Please make sure your credentials and host URL are correct and try again. If you need help, please click on the support chat link.'
				),
				{ button: i18n.translate( 'Support chat' ), onClick: getHelp }
			);
			spreadHappiness(
				'Restore Credentials: update request failed on timeout (could be us or remote site)'
			);
			break;

		case 'missing_args':
			announce(
				i18n.translate( 'Something seems to be missing — please fill out all the required fields.' )
			);
			spreadHappiness( 'Restore Credentials: missing API args (contact a dev)' );
			break;

		case 'invalid_args':
			announce(
				i18n.translate(
					"The information you entered seems to be incorrect. Let's take " +
						'another look to ensure everything is in the right place.'
				)
			);
			spreadHappiness( 'Restore Credentials: invalid API args (contact a dev)' );
			break;

		case 'invalid_credentials':
			announce(
				i18n.translate(
					"We couldn't connect to your site. Please verify your credentials and give it another try."
				)
			);
			spreadHappiness( 'Restore Credentials: invalid credentials' );
			break;

		case 'invalid_wordpress_path':
			announce(
				i18n.translate(
					'We looked for `wp-config.php` in the WordPress installation ' +
						"path you provided but couldn't find it."
				),
				{ button: i18n.translate( 'Get help' ), onClick: getHelp }
			);
			spreadHappiness( "Restore Credentials: can't find WordPress installation files" );
			break;

		case 'read_only_install':
			announce(
				i18n.translate(
					'It looks like your server is read-only. ' +
						'To create backups and restore your site, we need permission to write to your server.'
				),
				{ button: i18n.translate( 'Get help' ), onClick: getHelp }
			);
			spreadHappiness( 'Restore Credentials: creds only seem to provide read-only access' );
			break;

		case 'unreachable_path':
			announce(
				i18n.translate(
					'We tried to access your WordPress installation through its publicly available URL, ' +
						"but it didn't work. Please make sure the directory is accessible and try again."
				)
			);
			spreadHappiness( 'Restore Credentials: creds might be for wrong site on right server' );
			break;

		default:
			announce( i18n.translate( 'Error saving. Please check your credentials and try again.' ) );
			spreadHappiness( 'Restore Credentials: unknown failure saving credentials' );
	}
};

registerHandlers( 'state/data-layer/wpcom/activity-log/update-credentials/index.js', {
	[ JETPACK_CREDENTIALS_UPDATE ]: [
		primeHappychat,
		dispatchRequest( {
			fetch: request,
			onSuccess: success,
			onError: failure,
		} ),
	],
} );
