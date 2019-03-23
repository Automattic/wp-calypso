/** @format */
/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

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
import wpLib from 'lib/wp';
const wpcom = wpLib.undocumented();

const CHECKING_SITE_IMPORTABLE_NOTICE = 'checking-site-importable';

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

	dispatch(
		infoNotice( translate( "Please wait, we're checking to see if we can import this site." ), {
			id: CHECKING_SITE_IMPORTABLE_NOTICE,
			icon: 'info',
			isLoading: true,
		} )
	);

	return wpcom
		.isSiteImportable( site_url )
		.then( ( { engine, favicon, site_title: siteTitle, site_url: siteUrl } ) => {
			dispatch( removeNotice( CHECKING_SITE_IMPORTABLE_NOTICE ) );

			return dispatch(
				setImportOriginSiteDetails( {
					engine,
					favicon,
					siteTitle,
					siteUrl,
				} )
			);
		} )
		.catch( error => {
			dispatch( removeNotice( CHECKING_SITE_IMPORTABLE_NOTICE ) );

			return dispatch( { type: IMPORT_IS_SITE_IMPORTABLE_ERROR, error } );
		} );
};
