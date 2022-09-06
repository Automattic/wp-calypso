import { wpcomRequest } from '../wpcom-request-controls';
import {
	GetSubscribersImportResponse,
	GetSubscribersImportsResponse,
	ImportJob,
	ImportJobStatus,
	ImportSubscribersError,
	ImportSubscribersResponse,
} from './types';

export function createActions() {
	/**
	 * ↓ Import subscribers by CSV
	 */
	const importCsvSubscribersStart = ( siteId: number ) => ( {
		type: 'IMPORT_CSV_SUBSCRIBERS_START' as const,
		siteId,
	} );

	const importCsvSubscribersStartSuccess = ( siteId: number, jobId: number ) => ( {
		type: 'IMPORT_CSV_SUBSCRIBERS_START_SUCCESS' as const,
		siteId,
		jobId,
	} );

	const importCsvSubscribersStartFailed = ( siteId: number, error: ImportSubscribersError ) => ( {
		type: 'IMPORT_CSV_SUBSCRIBERS_START_FAILED' as const,
		siteId,
		error,
	} );

	const importCsvSubscribersUpdate = ( job: ImportJob | undefined ) => ( {
		type: 'IMPORT_CSV_SUBSCRIBERS_UPDATE' as const,
		job,
	} );

	function* importCsvSubscribers( siteId: number, file: File ) {
		yield importCsvSubscribersStart( siteId );

		try {
			const data: ImportSubscribersResponse = yield wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteId ) }/subscribers/import`,
				method: 'POST',
				apiNamespace: 'wpcom/v2',
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				formData: [ [ 'import', file, file.name ] ],
			} );

			yield importCsvSubscribersStartSuccess( siteId, data.upload_id );
		} catch ( error ) {
			yield importCsvSubscribersStartFailed( siteId, error as ImportSubscribersError );
		}
	}

	/**
	 * ↓ Get import
	 */
	const getSubscribersImportSuccess = ( siteId: number, importJob: ImportJob ) => ( {
		type: 'GET_SUBSCRIBERS_IMPORT_SUCCESS' as const,
		siteId,
		importJob,
	} );

	function* getSubscribersImport( siteId: number, importId: number ) {
		try {
			const data: GetSubscribersImportResponse = yield wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteId ) }/subscribers/import/${ importId }`,
				method: 'GET',
				apiNamespace: 'wpcom/v2',
			} );

			yield getSubscribersImportSuccess( siteId, data );
		} catch ( e ) {}
	}

	/**
	 * ↓ Get imports
	 */
	const getSubscribersImportsSuccess = (
		siteId: number,
		imports: GetSubscribersImportsResponse
	) => ( {
		type: 'GET_SUBSCRIBERS_IMPORTS_SUCCESS' as const,
		siteId,
		imports,
	} );

	function* getSubscribersImports( siteId: number, status?: ImportJobStatus ) {
		const path = `/sites/${ encodeURIComponent( siteId ) }/subscribers/import`;
		const data: GetSubscribersImportsResponse = yield wpcomRequest( {
			path: ! status ? path : `${ path }?status=${ encodeURIComponent( status ) }`,
			method: 'GET',
			apiNamespace: 'wpcom/v2',
		} );

		yield getSubscribersImportsSuccess( siteId, data );
	}

	return {
		importCsvSubscribersStart,
		importCsvSubscribersStartSuccess,
		importCsvSubscribersStartFailed,
		importCsvSubscribersUpdate,
		importCsvSubscribers,
		getSubscribersImport,
		getSubscribersImportSuccess,
		getSubscribersImports,
		getSubscribersImportsSuccess,
	};
}

export type ActionCreators = ReturnType< typeof createActions >;

export type Action = ReturnType<
	| ActionCreators[ 'importCsvSubscribersStart' ]
	| ActionCreators[ 'importCsvSubscribersStartSuccess' ]
	| ActionCreators[ 'importCsvSubscribersStartFailed' ]
	| ActionCreators[ 'importCsvSubscribersUpdate' ]
	| ActionCreators[ 'getSubscribersImportSuccess' ]
	| ActionCreators[ 'getSubscribersImportsSuccess' ]
>;
