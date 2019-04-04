/** @format */
/**
 * External dependencies
 */
import Dispatcher from 'dispatcher';
import { stringify } from 'qs';
import { defer, every, get } from 'lodash';

/**
 * Internal dependencies
 */
import { toApi, fromApi } from 'lib/importer/common';
import wpLib from 'lib/wp';
import user from 'lib/user';
import {
	mapAuthor,
	startMappingAuthors,
	startImporting,
	createFinishUploadAction,
} from 'lib/importer/actions';
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';
import { setSelectedEditor } from 'state/selected-editor/actions';
import {
	SITE_IMPORTER_IMPORT_START,
	SITE_IMPORTER_IMPORT_SUCCESS,
	SITE_IMPORTER_IMPORT_FAILURE,
	SITE_IMPORTER_IMPORT_RESET,
	SITE_IMPORTER_VALIDATION_ERROR_SET,
	SITE_IMPORTER_VALIDATE_SITE_IMPORTABLE_START,
	SITE_IMPORTER_VALIDATE_SITE_IMPORTABLE_SUCCESS,
	SITE_IMPORTER_VALIDATE_SITE_IMPORTABLE_FAILURE,
} from './action-types';
import { getState as getImporterState } from 'lib/importer/store';
import { prefetchmShotsPreview } from 'lib/mshots';

const wpcom = wpLib.undocumented();

export const startSiteImporterImport = () => ( {
	type: SITE_IMPORTER_IMPORT_START,
} );

export const siteImporterImportSuccessful = importData => ( {
	type: SITE_IMPORTER_IMPORT_SUCCESS,
	importData,
} );

export const siteImporterImportFailed = error => ( {
	type: SITE_IMPORTER_IMPORT_FAILURE,
	message: error.message,
} );

export const startSiteImporterIsSiteImportable = () => ( {
	type: SITE_IMPORTER_VALIDATE_SITE_IMPORTABLE_START,
} );

export const startSiteImporterIsSiteImportableSuccessful = response => ( {
	type: SITE_IMPORTER_VALIDATE_SITE_IMPORTABLE_SUCCESS,
	response,
} );

export const startSiteImporterIsSiteImportableFailed = error => ( {
	type: SITE_IMPORTER_VALIDATE_SITE_IMPORTABLE_FAILURE,
	message: error.message,
} );

export const setValidationError = message => ( {
	type: SITE_IMPORTER_VALIDATION_ERROR_SET,
	message,
} );

export const startMappingSiteImporterAuthors = ( {
	importerStatus,
	site,
	targetSiteUrl,
} ) => dispatch => {
	const singleAuthorSite = get( site, 'single_user_site', true );
	const siteId = site.ID;
	const { importerId } = importerStatus;

	// WXR was uploaded, map the authors
	if ( singleAuthorSite ) {
		const currentUserData = user().get();
		const currentUser = {
			...currentUserData,
			name: currentUserData.display_name,
		};
		const sourceAuthors = get( importerStatus, 'customData.sourceAuthors', [] );

		// map all the authors to the current user
		// TODO: when converting to redux, allow for multiple mappings in a single action
		sourceAuthors.forEach( author => mapAuthor( importerId, author, currentUser ) );

		// Check if all authors are mapped before starting the import.
		defer( () => {
			const newState = get( getImporterState(), [ 'importers', importerId ] );
			const areAllAuthorsMapped = every(
				get( newState, 'customData.sourceAuthors', [] ),
				'mappedTo'
			);

			if ( areAllAuthorsMapped ) {
				startImporting( newState );

				dispatch(
					recordTracksEvent( 'calypso_site_importer_map_authors_single', {
						blog_id: siteId,
						site_url: targetSiteUrl,
					} )
				);
			}
		} );
	} else {
		startMappingAuthors( importerId );

		recordTracksEvent( 'calypso_site_importer_map_authors_multi', {
			blog_id: siteId,
			site_url: targetSiteUrl,
		} );
	}
};

export const importSite = ( {
	engine,
	importerStatus,
	params,
	site,
	supportedContent,
	targetSiteUrl,
	unsupportedContent,
} ) => dispatch => {
	const siteId = site.ID;
	const trackingParams = {
		blog_id: siteId,
		site_url: targetSiteUrl,
		supported_content: supportedContent
			.slice( 0 )
			.sort()
			.join( ', ' ),
		unsupported_content: unsupportedContent
			.slice( 0 )
			.sort()
			.join( ', ' ),
		site_engine: engine,
	};

	dispatch(
		withAnalytics(
			recordTracksEvent( 'calypso_site_importer_start_import_request', trackingParams ),
			startSiteImporterImport()
		)
	);

	wpcom.wpcom.req
		.post( {
			path: `/sites/${ siteId }/site-importer/import-site?${ stringify( params ) }`,
			apiNamespace: 'wpcom/v2',
			formData: [
				[ 'import_status', JSON.stringify( toApi( importerStatus ) ) ],
				[ 'site_url', targetSiteUrl ],
			],
		} )
		.then( response => {
			// At this point we're assuming that an import is going to happen
			// so we set the user's editor to Gutenberg in order to make sure
			// that the posts aren't mangled by the classic editor.
			if ( 'godaddy-gocentral' === engine ) {
				dispatch( setSelectedEditor( siteId, 'gutenberg' ) );
			}

			dispatch(
				withAnalytics(
					recordTracksEvent( 'calypso_site_importer_start_import_success', trackingParams ),
					siteImporterImportSuccessful( response )
				)
			);

			defer( () => {
				const data = fromApi( response );
				// Note: We're creating the finishUploadAction using the locally generated ID here
				// as opposed to the new import ID recieved in the API response.
				const action = createFinishUploadAction( importerStatus.importerId, data );

				Dispatcher.handleViewAction( action );

				startMappingSiteImporterAuthors( {
					importerStatus: data,
					site,
					targetSiteUrl,
				} )( dispatch );
			} );
		} )
		.catch( error => {
			dispatch(
				withAnalytics(
					recordTracksEvent( 'calypso_site_importer_start_import_fail', trackingParams ),
					siteImporterImportFailed( error )
				)
			);
		} );
};

export const validateSiteIsImportable = ( { params, site, targetSiteUrl } ) => dispatch => {
	const siteId = site.ID;

	prefetchmShotsPreview( targetSiteUrl );

	dispatch(
		withAnalytics(
			recordTracksEvent( 'calypso_site_importer_validate_site_start', {
				blog_id: siteId,
				site_url: targetSiteUrl,
			} ),
			startSiteImporterIsSiteImportable()
		)
	);

	return wpcom.wpcom.req
		.get( {
			path: `/sites/${ siteId }/site-importer/is-site-importable?${ stringify( params ) }`,
			apiNamespace: 'wpcom/v2',
		} )
		.then( response =>
			dispatch(
				withAnalytics(
					recordTracksEvent( 'calypso_site_importer_validate_site_success', {
						blog_id: siteId,
						site_url: response.site_url,
						supported_content: response.supported_content
							.slice( 0 )
							.sort()
							.join( ', ' ),
						unsupported_content: response.unsupported_content
							.slice( 0 )
							.sort()
							.join( ', ' ),
						site_engine: response.engine,
					} ),
					startSiteImporterIsSiteImportableSuccessful( response )
				)
			)
		)
		.catch( error =>
			dispatch(
				withAnalytics(
					recordTracksEvent( 'calypso_site_importer_validate_site_fail', {
						blog_id: siteId,
						site_url: targetSiteUrl,
					} ),
					startSiteImporterIsSiteImportableFailed( error )
				)
			)
		);
};

export const resetSiteImporterImport = ( { importStage, site, targetSiteUrl } ) => dispatch =>
	dispatch(
		withAnalytics(
			recordTracksEvent( 'calypso_site_importer_reset_import', {
				blog_id: site.ID,
				site_url: targetSiteUrl,
				previous_stage: importStage,
			} ),
			{ type: SITE_IMPORTER_IMPORT_RESET }
		)
	);
