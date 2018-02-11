/** @format */
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

const navigateTo =
	undefined !== typeof window ? path => window.open( path, '_blank' ) : path => page( path );

/**
 * Makes sure that we can initialize a connection
 * to HappyChat. We'll need this on the API response
 *
 * @param {function} dispatch Redux dispatcher
 * @param {function} getState Redux getState
 */
export const primeHappychat = ( { dispatch, getState } ) => {
	const state = getState();
	const getAuth = getHappychatAuth( state );

	if ( isHappychatConnectionUninitialized( state ) ) {
		dispatch( initConnection( getAuth() ) );
	}
};

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

	const getHelp = () => {
		const state = getState();
		const canChat = isHappychatAvailable( state ) || hasActiveHappychatSession( state );

		return canChat ? dispatch( openChat() ) : navigateTo( '/help' );
	};

	const { translate } = i18n;
	const baseOptions = { duration: 4000, id: action.noticeId };

	const announce = ( message, options ) =>
		dispatch( errorNotice( message, options ? { ...baseOptions, ...options } : baseOptions ) );

	const spreadHappiness = message => {
		const tracksEvent = recordTracksEvent( 'calypso_rewind_creds_update_failure', {
			siteId: action.siteId,
			error: error.error,
			statusCode: error.statusCode,
			host: action.host,
			kpri: action.krpi ? 'provided but [omitted here]' : 'not provided',
			pass: action.pass ? 'provided but [omitted here]' : 'not provided',
			path: action.path,
			port: action.port,
			protocol: action.protocol,
			user: action.user,
		} );

		dispatch(
			isHappychatAvailable( getState() )
				? withAnalytics( tracksEvent, sendEvent( message ) )
				: tracksEvent
		);
	};

	switch ( error.error ) {
		case 'service_unavailable':
			announce(
				translate(
					"Our service isn't working at the moment. We'll get it up and " +
						'running as fast as we can, so please try again later.'
				),
				{ button: translate( 'Try again' ), onClick: () => dispatch( action ) }
			);
			spreadHappiness(
				'Rewind Credentials: update request failed on timeout (could be us or remote site)'
			);
			break;

		case 'missing_args':
			announce(
				translate( 'Something seems to be missing — please fill out all the required fields.' )
			);
			spreadHappiness( 'Rewind Credentials: missing API args (contact a dev)' );
			break;

		case 'invalid_args':
			announce(
				translate(
					"The information you entered seems to be incorrect. Let's take " +
						'another look to ensure everything is in the right place.'
				)
			);
			spreadHappiness( 'Rewind Credentials: invalid API args (contact a dev)' );
			break;

		case 'invalid_credentials':
			announce(
				translate(
					"Oops! We couldn't connect to your site with these credentials — let's give it another try."
				)
			);
			spreadHappiness( 'Rewind Credentials: invalid credentials' );
			break;

		case 'invalid_wordpress_path':
			announce(
				translate(
					'We looked for `wp-config.php` in the WordPress installation ' +
						"path you provided but couldn't find it."
				),
				{ button: translate( 'Get help' ), onClick: getHelp }
			);
			spreadHappiness( "Rewind Credentials: can't find WordPress installation files" );
			break;

		case 'read_only_install':
			announce(
				translate(
					'It looks like your server is read-only. ' +
						'To create backups and rewind your site, we need permission to write to your server.'
				),
				{ button: translate( 'Get help' ), onClick: getHelp }
			);
			spreadHappiness( 'Rewind Credentials: creds only seem to provide read-only access' );
			break;

		case 'unreachable_path':
			announce(
				translate(
					'We tried to access your WordPress installation through its publicly available URL, ' +
						"but it didn't work. Please make sure the directory is accessible and try again."
				)
			);
			spreadHappiness( 'Rewind Credentials: creds might be for wrong site on right server' );
			break;

		default:
			announce( translate( 'Error saving. Please check your credentials and try again.' ) );
			spreadHappiness( 'Rewind Credentials: unknown failure saving credentials' );
	}
};

export default {
	[ JETPACK_CREDENTIALS_UPDATE ]: [ primeHappychat, dispatchRequest( request, success, failure ) ],
};
