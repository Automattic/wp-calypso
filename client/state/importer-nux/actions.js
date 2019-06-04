/** @format */
/**
 * External dependencies
 */
import url from 'url';
import { trim } from 'lodash';

/**
 * Internal dependencies
 */
import {
	IMPORT_IS_SITE_IMPORTABLE_ERROR,
	IMPORT_IS_SITE_IMPORTABLE_RECEIVE,
	IMPORTER_NUX_URL_INPUT_SET,
	IMPORTER_NUX_FROM_SIGNUP_CLEAR,
	IMPORTER_NUX_FROM_SIGNUP_SET,
	IMPORT_IS_SITE_IMPORTABLE_START_FETCH,
} from 'state/action-types';
import { loadmShotsPreview } from 'lib/mshots';
import wpcom from 'lib/wp';
import { setSiteTitle } from 'state/signup/steps/site-title/actions';
import { submitSignupStep } from 'state/signup/progress/actions';

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
		.undocumented()
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

export const submitImportUrlStep = ( { stepName, siteUrl: siteUrlFromInput } ) => dispatch =>
	dispatch( fetchIsSiteImportable( siteUrlFromInput ) )
		.then( async siteDetails => {
			const { engine, error, favicon, siteTitle, siteUrl: importSiteUrl } = siteDetails;

			if ( error ) {
				throw new Error( error );
			}

			dispatch( setSiteTitle( siteTitle ) );

			const imageBlob = await loadmShotsPreview( {
				url: normalizeUrl( siteUrlFromInput ),
				maxRetries: 30,
				retryTimeout: 1000,
			} );

			dispatch(
				submitSignupStep(
					{ stepName },
					{
						sitePreviewImageBlob: imageBlob,
						importEngine: engine,
						importFavicon: favicon,
						importSiteUrl,
						siteTitle,
						themeSlugWithRepo: 'pub/modern-business',
					}
				)
			);
		} )
		.catch( error => {
			throw new Error( error );
		} );

export const setImportingFromSignupFlow = () => ( {
	type: IMPORTER_NUX_FROM_SIGNUP_SET,
} );

export const clearImportingFromSignupFlow = () => ( {
	type: IMPORTER_NUX_FROM_SIGNUP_CLEAR,
} );
