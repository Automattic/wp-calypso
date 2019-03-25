/** @format */
/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import url from 'url';
import { trim } from 'lodash';

/**
 * Internal dependencies
 */
import {
	IMPORT_IS_SITE_IMPORTABLE_ERROR,
	IMPORT_IS_SITE_IMPORTABLE_RECEIVE,
	IMPORT_SIGNUP_SITE_PREVIEW_ERROR,
	IMPORT_SIGNUP_SITE_PREVIEW_FETCH,
	IMPORT_SIGNUP_SITE_PREVIEW_RECEIVE,
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

export const submitImportUrlStep = ( { stepName, siteUrl: siteUrlFromInput } ) => dispatch => {
	dispatch(
		infoNotice( translate( "Please wait, we're checking to see if we can import this site." ), {
			id: CHECKING_SITE_IMPORTABLE_NOTICE,
			icon: 'info',
			isLoading: true,
		} )
	);

	return dispatch( fetchIsSiteImportable( siteUrlFromInput ) )
		.then( async siteDetails => {
			const { engine, error, favicon, siteTitle, siteUrl: importSiteUrl } = siteDetails;

			if ( error ) {
				throw new Error( error );
			}

			dispatch( {
				type: IMPORT_SIGNUP_SITE_PREVIEW_FETCH,
			} );

			const imageBlob = await loadmShotsPreview( {
				url: normalizeUrl( siteUrlFromInput ),
				maxRetries: 30,
				retryTimeout: 1000,
			} );

			dispatch( removeNotice( CHECKING_SITE_IMPORTABLE_NOTICE ) );
			dispatch( {
				type: IMPORT_SIGNUP_SITE_PREVIEW_RECEIVE,
			} );

			return SignupActions.submitSignupStep( { stepName }, [], {
				sitePreviewImageBlob: imageBlob,
				importEngine: engine,
				importFavicon: favicon,
				importSiteTitle: siteTitle,
				importSiteUrl,
				themeSlugWithRepo: 'pub/modern-business',
			} );
		} )
		.catch( error => {
			dispatch( removeNotice( CHECKING_SITE_IMPORTABLE_NOTICE ) );
			dispatch( {
				type: IMPORT_SIGNUP_SITE_PREVIEW_ERROR,
			} );

			throw new Error( error );
		} );
};
