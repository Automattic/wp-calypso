/** @format */
/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import url from 'url';
import { get, trim } from 'lodash';

/**
 * Internal dependencies
 */
import {
	IMPORT_IS_SITE_IMPORTABLE_ERROR,
	IMPORT_IS_SITE_IMPORTABLE_RECEIVE,
	IMPORTER_NUX_URL_INPUT_SET,
	IMPORT_IS_SITE_IMPORTABLE_START_FETCH,
} from 'state/action-types';
import { infoNotice, removeNotice } from 'state/notices/actions';
import { loadmShotsPreview } from 'my-sites/importer/site-importer/site-preview-actions';
import wpLib from 'lib/wp';
import SignupActions from 'lib/signup/actions';

const wpcom = wpLib.undocumented();

const CHECKING_SITE_IMPORTABLE_NOTICE = 'checking-site-importable';

const normalizeUrl = targetUrl => {
	const siteURL = trim( targetUrl );

	if ( ! siteURL ) {
		return;
	}

	const { hostname, pathname } = url.parse(
		siteURL.startsWith( 'http' ) ? siteURL : 'https://' + siteURL
	);

	if ( ! hostname ) {
		return;
	}

	return hostname + pathname;
};

export const setNuxUrlInputValue = value => ( {
	type: IMPORTER_NUX_URL_INPUT_SET,
	value,
} );

export const setImportOriginSiteDetails = response => ( {
	type: IMPORT_IS_SITE_IMPORTABLE_RECEIVE,
	...response,
} );

export const fetchIsSiteImportable = site_url => dispatch => {
	dispatch( {
		type: IMPORT_IS_SITE_IMPORTABLE_START_FETCH,
	} );

	return wpcom
		.isSiteImportable( site_url )
		.then( ( { engine, favicon, site_title: siteTitle, site_url: siteUrl } ) =>
			dispatch(
				setImportOriginSiteDetails( {
					engine,
					favicon,
					siteTitle,
					siteUrl,
				} )
			)
		)
		.catch( error => dispatch( { type: IMPORT_IS_SITE_IMPORTABLE_ERROR, error } ) );
};

export const submitImportUrlStep = ( { stepName, siteUrl } ) => dispatch => {
	dispatch(
		infoNotice( translate( "Please wait, we're checking to see if we can import this site." ), {
			id: CHECKING_SITE_IMPORTABLE_NOTICE,
			icon: 'info',
			isLoading: true,
		} )
	);

	return dispatch( fetchIsSiteImportable( siteUrl ) )
		.then( async siteDetails => {
			const error = get( siteDetails, 'error' );

			if ( error ) {
				throw new Error( error );
			}

			const imageBlob = await loadmShotsPreview( {
				url: normalizeUrl( siteUrl ),
				maxRetries: 30,
				retryTimeout: 1000,
			} );

			dispatch( removeNotice( CHECKING_SITE_IMPORTABLE_NOTICE ) );

			return SignupActions.submitSignupStep( { stepName }, [], {
				sitePreviewImageBlob: imageBlob,
				importSiteDetails: siteDetails,
				importUrl: siteDetails.siteUrl,
				themeSlugWithRepo: 'pub/radcliffe-2',
			} );
		} )
		.catch( error => {
			dispatch( removeNotice( CHECKING_SITE_IMPORTABLE_NOTICE ) );

			throw new Error( error );
		} );
};
