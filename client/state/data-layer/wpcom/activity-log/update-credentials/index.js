/** @format */
/**
 * External dependencies
 */
import i18n from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
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

export const failure = ( { dispatch }, action, error ) => {
	dispatch( {
		type: JETPACK_CREDENTIALS_UPDATE_FAILURE,
		error,
		siteId: action.siteId,
	} );

	const { translate } = i18n;
	const errorMessage = get(
		{
			service_unavailable: () =>
				translate( 'Our service is temporarily unavailable. Please try again soon.' ),
			missing_args: () =>
				translate(
					'Oops! It looks like some credentials fields were missing. ' +
						'Please fill out all required fields and try again.'
				),
			invalid_args: () =>
				translate(
					'Oops! It looks like something was wrong with the supplied credentials. ' +
						'Please confirm and try again.'
				),
			invalid_credentials: () =>
				translate(
					'We could not login with the supplied credentials. Please confirm and try again.'
				),
			invalid_wordpress_path: () =>
				translate(
					'We could not find `wp-config.php` on the remote server with the given installation path. ' +
						'Please confirm and try again.'
				),
			read_only_install: () =>
				translate(
					'We were unable to write on the remote server. We cannot proceed with read-only credentials. ' +
						'Please confirm and try again.'
				),
			unreachable_path: () =>
				translate(
					'We were unable to confirm the mapping between the WordPress installation path and a ' +
						'publicly-available URL. Please make sure the directory is accessible and try again.'
				),
		},
		error.error,
		() => translate( 'Error saving. Please check your credentials and try again.' )
	)();

	dispatch( errorNotice( errorMessage, { duration: 4000, id: action.noticeId } ) );
};

export default {
	[ JETPACK_CREDENTIALS_UPDATE ]: [ dispatchRequest( request, success, failure ) ],
};
