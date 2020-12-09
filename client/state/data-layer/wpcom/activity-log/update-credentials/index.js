/**
 * External dependencies
 */
import i18n from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import {
	JETPACK_CREDENTIALS_UPDATE,
	JETPACK_CREDENTIALS_UPDATE_SUCCESS,
	JETPACK_CREDENTIALS_UPDATE_FAILURE,
	JETPACK_CREDENTIALS_UPDATE_PROGRESS_START,
	JETPACK_CREDENTIALS_UPDATE_PROGRESS_UPDATE,
	JETPACK_CREDENTIALS_STORE,
	REWIND_STATE_UPDATE,
} from 'calypso/state/action-types';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { transformApi } from 'calypso/state/data-layer/wpcom/sites/rewind/api-transformer';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import getJetpackCredentialsUpdateProgress from 'calypso/state/selectors/get-jetpack-credentials-update-progress';
import getSelectedSiteSlug from 'calypso/state/ui/selectors/get-selected-site-slug';
import contactSupportUrl from 'calypso/lib/jetpack/contact-support-url';

const navigateTo =
	undefined !== typeof window
		? ( path ) => window.open( path, '_blank' )
		: ( path ) => page( path );

export const request = ( action ) => {
	const { path, ...otherCredentials } = action.credentials;
	const credentials = { ...otherCredentials, abspath: path };

	const tracksEvent = recordTracksEvent( 'calypso_rewind_creds_update_attempt', {
		site_id: action.siteId,
		protocol: action.credentials.protocol,
	} );

	return [
		{
			type: JETPACK_CREDENTIALS_UPDATE_PROGRESS_START,
			siteId: action.siteId,
		},
		tracksEvent,
		http(
			{
				apiNamespace: 'wpcom/v2',
				method: 'POST',
				path: `/sites/${ action.siteId }/rewind/credentials/update`,
				body: { credentials, stream: true },
				processResponseInStreamMode: true,
			},
			{ ...action }
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
	const getHelp = () => navigateTo( contactSupportUrl( getSelectedSiteSlug( getState() ) ) );

	const baseOptions = { duration: 10000 };

	const dispatchFailure = ( message, options = {} ) => {
		dispatch( errorNotice( message, { ...baseOptions, ...options } ) );

		const state = getState();
		const progress = getJetpackCredentialsUpdateProgress( state, action.siteId );

		dispatch( {
			type: JETPACK_CREDENTIALS_UPDATE_FAILURE,
			siteId: action.siteId,
			error,
			wpcomError: error,
			translatedError: message,
			transportError: progress.lastError ?? undefined,
		} );
	};

	dispatch(
		recordTracksEvent( 'calypso_rewind_creds_update_failure', {
			site_id: action.siteId,
			error: error.code,
			error_message: error.message,
			status_code: error.data ?? error.statusCode,
			host: action.credentials.host,
			kpri: action.credentials.krpi ? 'provided but [omitted here]' : 'not provided',
			pass: action.credentials.pass ? 'provided but [omitted here]' : 'not provided',
			path: action.credentials.path,
			port: action.credentials.port,
			protocol: action.credentials.protocol,
			user: action.credentials.user,
		} )
	);

	switch ( error.code ) {
		case 'service_unavailable':
			dispatchFailure(
				i18n.translate(
					'A error occurred when we were trying to validate your site information. ' +
						'Please make sure your credentials and host URL are correct and try again. ' +
						'If you need help, please click on the support link.'
				),
				{ button: i18n.translate( 'Get help' ), onClick: getHelp }
			);
			break;

		case 'missing_args':
			dispatchFailure(
				i18n.translate( 'Something seems to be missing — please fill out all the required fields.' )
			);
			break;

		case 'invalid_args':
			dispatchFailure(
				i18n.translate(
					"The information you entered seems to be incorrect. Let's take " +
						'another look to ensure everything is in the right place.'
				)
			);
			break;

		case 'invalid_credentials':
			dispatchFailure(
				i18n.translate(
					"We couldn't connect to your site. Please verify your credentials and give it another try."
				)
			);
			break;

		case 'invalid_wordpress_path':
			dispatchFailure(
				i18n.translate(
					'We looked for `wp-config.php` in the WordPress installation ' +
						"path you provided but couldn't find it."
				),
				{ button: i18n.translate( 'Get help' ), onClick: getHelp }
			);
			break;

		case 'read_only_install':
			dispatchFailure(
				i18n.translate(
					'It looks like your server is read-only. ' +
						'To create backups and restore your site, we need permission to write to your server.'
				),
				{ button: i18n.translate( 'Get help' ), onClick: getHelp }
			);
			break;

		case 'unreachable_path':
			dispatchFailure(
				i18n.translate(
					'We tried to access your WordPress installation through its publicly available URL, ' +
						"but it didn't work. Please make sure the directory is accessible and try again."
				)
			);
			break;

		default:
			dispatchFailure(
				i18n.translate( 'Error saving. Please check your credentials and try again.' )
			);
	}
};

export const streamRecord = ( action, record ) => ( {
	type: JETPACK_CREDENTIALS_UPDATE_PROGRESS_UPDATE,
	siteId: action.siteId,
	update: record,
} );

registerHandlers( 'state/data-layer/wpcom/activity-log/update-credentials/index.js', {
	[ JETPACK_CREDENTIALS_UPDATE ]: [
		dispatchRequest( {
			fetch: request,
			onSuccess: success,
			onError: failure,
			onStreamRecord: streamRecord,
		} ),
	],
} );
