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
import wpcom from 'lib/wp';
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
	SITE_IMPORTER_IMPORT_FAILURE,
	SITE_IMPORTER_IMPORT_RESET,
	SITE_IMPORTER_IMPORT_START,
	SITE_IMPORTER_IMPORT_SUCCESS,
	SITE_IMPORTER_IS_SITE_IMPORTABLE_FAILURE,
	SITE_IMPORTER_IS_SITE_IMPORTABLE_START,
	SITE_IMPORTER_IS_SITE_IMPORTABLE_SUCCESS,
	SITE_IMPORTER_VALIDATION_ERROR_SET,
} from 'state/action-types';
import { getState as getImporterState } from 'lib/importer/store';
import { prefetchmShotsPreview } from 'lib/mshots';

const sortAndStringify = ( items ) => items.slice( 0 ).sort().join( ', ' );

export const startSiteImporterImport = () => ( {
	type: SITE_IMPORTER_IMPORT_START,
} );

export const siteImporterImportSuccessful = ( importData ) => ( {
	type: SITE_IMPORTER_IMPORT_SUCCESS,
	importData,
} );

export const siteImporterImportFailed = ( error ) => ( {
	type: SITE_IMPORTER_IMPORT_FAILURE,
	message: error.message,
} );

export const startSiteImporterIsSiteImportable = () => ( {
	type: SITE_IMPORTER_IS_SITE_IMPORTABLE_START,
} );

export const siteImporterIsSiteImportableSuccessful = ( response ) => ( {
	type: SITE_IMPORTER_IS_SITE_IMPORTABLE_SUCCESS,
	response,
} );

export const siteImporterIsSiteImportableFailed = ( error ) => ( {
	type: SITE_IMPORTER_IS_SITE_IMPORTABLE_FAILURE,
	message: error.message,
} );

export const setValidationError = ( message ) => ( {
	type: SITE_IMPORTER_VALIDATION_ERROR_SET,
	message,
} );

export const startMappingSiteImporterAuthors = ( { importerStatus, site, targetSiteUrl } ) => (
	dispatch
) => {
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
		sourceAuthors.forEach( ( author ) => mapAuthor( importerId, author, currentUser ) );

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

		dispatch(
			recordTracksEvent( 'calypso_site_importer_map_authors_multi', {
				blog_id: siteId,
				site_url: targetSiteUrl,
			} )
		);
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
} ) => ( dispatch ) => {
	const siteId = site.ID;
	const trackingParams = {
		blog_id: siteId,
		site_url: targetSiteUrl,
		supported_content: sortAndStringify( supportedContent ),
		unsupported_content: sortAndStringify( unsupportedContent ),
		site_engine: engine,
	};

	dispatch( recordTracksEvent( 'calypso_site_importer_start_import_request', trackingParams ) );
	dispatch( startSiteImporterImport() );

	wpcom
		.undocumented()
		.importWithSiteImporter( siteId, toApi( importerStatus ), params, targetSiteUrl )
		.then( ( response ) => {
			// At this point we're assuming that an import is going to happen
			// so we set the user's editor to Gutenberg in order to make sure
			// that the posts aren't mangled by the classic editor.
			if ( 'godaddy-gocentral' === engine ) {
				dispatch( setSelectedEditor( siteId, 'gutenberg' ) );
			}

			dispatch( recordTracksEvent( 'calypso_site_importer_start_import_success', trackingParams ) );
			dispatch( siteImporterImportSuccessful( response ) );

			const data = fromApi( response );
			// Note: We're creating the finishUploadAction using the locally generated ID here
			// as opposed to the new import ID recieved in the API response.
			const action = createFinishUploadAction( importerStatus.importerId, data );

			Dispatcher.handleViewAction( action );

			dispatch(
				startMappingSiteImporterAuthors( {
					importerStatus: data,
					site,
					targetSiteUrl,
				} )
			);
		} )
		.catch( ( error ) => {
			dispatch( recordTracksEvent( 'calypso_site_importer_start_import_fail', trackingParams ) );
			dispatch( siteImporterImportFailed( error ) );
		} );
};

export const validateSiteIsImportable = ( { params, site, targetSiteUrl } ) => ( dispatch ) => {
	const siteId = site.ID;

	prefetchmShotsPreview( targetSiteUrl );

	dispatch(
		recordTracksEvent( 'calypso_site_importer_validate_site_start', {
			blog_id: siteId,
			site_url: targetSiteUrl,
		} )
	);
	dispatch( startSiteImporterIsSiteImportable() );

	return wpcom.req
		.get( {
			path: `/sites/${ siteId }/site-importer/is-site-importable?${ stringify( params ) }`,
			apiNamespace: 'wpcom/v2',
		} )
		.then( ( response ) => {
			dispatch(
				recordTracksEvent( 'calypso_site_importer_validate_site_success', {
					blog_id: siteId,
					site_url: response.site_url,
					supported_content: sortAndStringify( response.supported_content ),
					unsupported_content: sortAndStringify( response.unsupported_content ),
					site_engine: response.engine,
				} )
			);
			dispatch( siteImporterIsSiteImportableSuccessful( response ) );
		} )
		.catch( ( error ) => {
			dispatch(
				recordTracksEvent( 'calypso_site_importer_validate_site_fail', {
					blog_id: siteId,
					site_url: targetSiteUrl,
				} )
			);
			dispatch( siteImporterIsSiteImportableFailed( error ) );
		} );
};

export const resetSiteImporterImport = ( { importStage, site, targetSiteUrl } ) =>
	withAnalytics(
		recordTracksEvent( 'calypso_site_importer_reset_import', {
			blog_id: site.ID,
			site_url: targetSiteUrl,
			previous_stage: importStage,
		} ),
		{ type: SITE_IMPORTER_IMPORT_RESET }
	);

export const clearSiteImporterImport = () => ( {
	type: SITE_IMPORTER_IMPORT_RESET,
} );
