import { __, sprintf } from '@wordpress/i18n';
import { get } from 'lodash';
import { stringify } from 'qs';
import { convertPlatformName } from 'calypso/blocks/import/util.ts';
import { prefetchmShotsPreview } from 'calypso/lib/mshots';
import wpcom from 'calypso/lib/wp';
import {
	SITE_IMPORTER_IMPORT_FAILURE,
	SITE_IMPORTER_IMPORT_RESET,
	SITE_IMPORTER_IMPORT_START,
	SITE_IMPORTER_IMPORT_SUCCESS,
	SITE_IMPORTER_IS_SITE_IMPORTABLE_FAILURE,
	SITE_IMPORTER_IS_SITE_IMPORTABLE_START,
	SITE_IMPORTER_IS_SITE_IMPORTABLE_SUCCESS,
	SITE_IMPORTER_VALIDATION_ERROR_SET,
} from 'calypso/state/action-types';
import { recordTracksEvent, withAnalytics } from 'calypso/state/analytics/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import {
	mapAuthor,
	startMappingAuthors,
	startImporting,
	finishUpload,
} from 'calypso/state/imports/actions';
import { toApi, fromApi } from 'calypso/state/imports/api';
import { getImporterStatus } from 'calypso/state/imports/selectors';

import 'calypso/state/imports/init';

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

export const startMappingSiteImporterAuthors =
	( { importerStatus, site, targetSiteUrl } ) =>
	( dispatch, getState ) => {
		const singleAuthorSite = get( site, 'single_user_site', true );
		const siteId = site.ID;
		const { importerId } = importerStatus;

		// WXR was uploaded, map the authors
		if ( singleAuthorSite ) {
			const currentUserData = getCurrentUser( getState() );
			const currentUser = {
				...currentUserData,
				name: currentUserData.display_name,
			};
			const sourceAuthors = get( importerStatus, 'customData.sourceAuthors', [] );

			// map all the authors to the current user
			// TODO: when converting to redux, allow for multiple mappings in a single action
			sourceAuthors.forEach( ( author ) =>
				dispatch( mapAuthor( importerId, author, currentUser ) )
			);

			// Check if all authors are mapped before starting the import.
			const newState = getImporterStatus( getState(), importerId );
			const areAllAuthorsMapped = get( newState, 'customData.sourceAuthors', [] ).every(
				( { mappedTo } ) => mappedTo
			);

			if ( areAllAuthorsMapped ) {
				dispatch( startImporting( newState ) );

				dispatch(
					recordTracksEvent( 'calypso_site_importer_map_authors_single', {
						blog_id: siteId,
						site_url: targetSiteUrl,
					} )
				);
			}
		} else {
			dispatch( startMappingAuthors( importerId ) );

			dispatch(
				recordTracksEvent( 'calypso_site_importer_map_authors_multi', {
					blog_id: siteId,
					site_url: targetSiteUrl,
				} )
			);
		}
	};

export const importSite =
	( {
		engine,
		importerStatus,
		params,
		site,
		supportedContent,
		targetSiteUrl,
		unsupportedContent,
	} ) =>
	( dispatch ) => {
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

		wpcom.req
			.post( {
				path: `/sites/${ siteId }/site-importer/import-site?${ stringify( params ) }`,
				apiNamespace: 'wpcom/v2',
				formData: [
					[ 'import_status', JSON.stringify( toApi( importerStatus ) ) ],
					[ 'site_url', targetSiteUrl ],
				],
			} )
			.then( ( response ) => {
				dispatch(
					recordTracksEvent( 'calypso_site_importer_start_import_success', trackingParams )
				);
				dispatch( siteImporterImportSuccessful( response ) );

				const data = fromApi( response );
				// Note: We're creating the finishUpload action using the locally generated ID here
				// as opposed to the new import ID recieved in the API response.
				dispatch( finishUpload( importerStatus.importerId, data ) );

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

export const validateSiteIsImportable =
	( { params, site, targetSiteUrl, targetPlatform } ) =>
	async ( dispatch ) => {
		const siteId = site.ID;

		prefetchmShotsPreview( targetSiteUrl );

		dispatch(
			recordTracksEvent( 'calypso_site_importer_validate_site_start', {
				blog_id: siteId,
				site_url: targetSiteUrl,
			} )
		);
		dispatch( startSiteImporterIsSiteImportable() );

		const isSiteImportable = wpcom.req.get( {
			path: `/sites/${ siteId }/site-importer/is-site-importable?${ stringify( params ) }`,
			apiNamespace: 'wpcom/v2',
		} );

		const analyzeUrl = wpcom.req.get( {
			path: `/imports/analyze-url?${ stringify( { site_url: targetSiteUrl } ) }`,
			apiNamespace: 'wpcom/v2',
		} );

		const [ isSiteImportableResult, analyzeUrlResult ] = await Promise.allSettled( [
			isSiteImportable,
			analyzeUrl,
		] );

		if ( isSiteImportableResult.status === 'fulfilled' ) {
			const response = isSiteImportableResult.value;
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
		} else {
			dispatch(
				recordTracksEvent( 'calypso_site_importer_validate_site_fail', {
					blog_id: siteId,
					site_url: targetSiteUrl,
				} )
			);

			// do platform validation if param - targetPlatform is given
			if (
				isSiteImportableResult?.reason?.code === 1000002 &&
				targetPlatform &&
				analyzeUrlResult?.value?.platform !== targetPlatform
			) {
				const message = sprintf(
					/* translators: %s - the formatted website platform name (eg: Wix, Squarespace, Blogger, etc.) */
					__( 'The URL you entered does not seem to be a %s site.' ),
					convertPlatformName( targetPlatform )
				);
				dispatch( siteImporterIsSiteImportableFailed( { message } ) );
			} else {
				dispatch( siteImporterIsSiteImportableFailed( isSiteImportableResult.reason ) );
			}
		}

		return;
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
