/** @format */
/**
 * Internal dependencies
 */
import {
	IMPORT_IS_SITE_IMPORTABLE_ERROR,
	IMPORT_IS_SITE_IMPORTABLE_RECEIVE,
	IMPORTER_NUX_SITE_PREVIEW_FETCH,
	IMPORTER_NUX_SITE_PREVIEW_RECEIVE,
	IMPORTER_NUX_SITE_PREVIEW_FAIL,
	IMPORTER_NUX_URL_INPUT_SET,
	IMPORTER_NUX_URL_VALIDATION_SET,
	IMPORT_IS_SITE_IMPORTABLE_START_FETCH,
} from 'state/action-types';
import wpLib from 'lib/wp';
import {
	recordTracksEvent,
	withAnalytics,
} from 'state/analytics/actions';
import { loadmShotsPreview } from 'my-sites/importer/site-importer/site-preview-actions';

const wpcom = wpLib.undocumented();

export const setNuxUrlInputValue = value => ( {
	type: IMPORTER_NUX_URL_INPUT_SET,
	value,
} );

export const setValidationMessage = message => ( {
	type: IMPORTER_NUX_URL_VALIDATION_SET,
	message,
} );

export const fetchSitePreviewImage = importUrl => dispatch => {
	dispatch( {
		type: IMPORTER_NUX_SITE_PREVIEW_FETCH,
	} );
	const previewStartTime = Date.now();

	console.log('fetchSitePreviewImage...')

	loadmShotsPreview( {
		url: importUrl,
		maxRetries: 30,
		retryTimeout: 1000,
	} )
		.then( imageBlob => {
			console.log('fetchSitePreviewImage then...')
			// dispatch( {
			// 	type: IMPORTER_NUX_SITE_PREVIEW_RECEIVE,
			// 	imageBlob,
			// } );
			// this.props.recordTracksEvent( 'calypso_importer_signup_site_preview_success', {
			// 	site_url: importUrl,
			// 	time_taken_ms: Date.now() - previewStartTime,
			// } );
			dispatch(
				withAnalytics(
					recordTracksEvent( 'calypso_importer_signup_site_preview_success', {
						site_url: importUrl,
						time_taken_ms: Date.now() - previewStartTime,
					} ),
					{
						type: IMPORTER_NUX_SITE_PREVIEW_RECEIVE,
						imageBlob,
					}
				)
			)
		} )
		.catch( () => {
			console.log('fetchSitePreviewImage catch...')
			// dispatch( {
			// 	type: IMPORTER_NUX_SITE_PREVIEW_FAIL,
			// } );
			// this.props.recordTracksEvent( 'calypso_importer_signup_site_preview_fail', {
			// 	site_url: importUrl,
			// 	time_taken_ms: Date.now() - previewStartTime,
			// } );
			dispatch(
				withAnalytics(
					recordTracksEvent( 'calypso_importer_signup_site_preview_fail', {
						site_url: importUrl,
						time_taken_ms: Date.now() - previewStartTime,
					} ),
					{ type: IMPORTER_NUX_SITE_PREVIEW_FAIL }
				)
			)
		} );
};


export const fetchIsSiteImportable = site_url => dispatch => {
	dispatch( {
		type: IMPORT_IS_SITE_IMPORTABLE_START_FETCH,
	} );

	return wpcom
		.isSiteImportable( site_url )
		.then( response => {
			console.log( 'fetchIsSiteImportable then' );
			dispatch( { type: IMPORT_IS_SITE_IMPORTABLE_RECEIVE, response } )
			const a = fetchSitePreviewImage( site_url )( dispatch );

			console.log( IMPORT_IS_SITE_IMPORTABLE_RECEIVE, { a } )
		} )
		.catch( error => {
			console.log( { error } );
			dispatch( { type: IMPORT_IS_SITE_IMPORTABLE_ERROR, error } )
		} );
};
