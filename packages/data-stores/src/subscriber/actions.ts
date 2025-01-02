import * as oauthToken from '@automattic/oauth-token';
import { wpcomRequest } from '../wpcom-request-controls';
import {
	AddSubscribersResponse,
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
	const importCsvSubscribersStart = (
		siteId: number,
		file?: File,
		emails: string[] = [],
		categories: number[] = []
	) => ( {
		type: 'IMPORT_CSV_SUBSCRIBERS_START' as const,
		siteId,
		file,
		emails,
		categories,
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

	function* importCsvSubscribers(
		siteId: number,
		file?: File,
		emails: string[] = [],
		categories: number[] = [],
		parseOnly: boolean = false
	) {
		yield importCsvSubscribersStart( siteId, file, emails, categories );

		try {
			const token = oauthToken.getToken();
			const formDataEntries: Array<
				[ string, string | number | File ] | [ string, File, string ]
			> = [
				...( file ? [ [ 'import', file, file.name ] as [ string, File, string ] ] : [] ),

				...categories.map( ( categoryId ) => [ 'categories[]', categoryId ] as [ string, number ] ),

				...emails.map( ( email ) => [ 'emails[]', email ] as [ string, string ] ),

				[ 'data', JSON.stringify( { parse_only: parseOnly } ) ] as [ string, string ],
			];

			const data: ImportSubscribersResponse = yield wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteId ) }/subscribers/import`,
				method: 'POST',
				apiNamespace: 'wpcom/v2',
				token: typeof token === 'string' ? token : undefined,
				formData: formDataEntries as ( string | File )[][],
			} );

			yield importCsvSubscribersStartSuccess( siteId, data.upload_id );
		} catch ( error ) {
			yield importCsvSubscribersStartFailed( siteId, error as ImportSubscribersError );
		}
	}

	/**
	 * ↓ Add subscribers
	 */
	const addSubscribersStart = ( siteId: number ) => ( {
		type: 'ADD_SUBSCRIBERS_START' as const,
		siteId,
	} );

	const addSubscribersSuccess = ( siteId: number, response: AddSubscribersResponse ) => ( {
		type: 'ADD_SUBSCRIBERS_SUCCESS' as const,
		siteId,
		response,
	} );

	const addSubscribersFailed = ( siteId: number ) => ( {
		type: 'ADD_SUBSCRIBERS_FAILED' as const,
		siteId,
	} );

	function* addSubscribers( siteId: number, emails: string[] ) {
		yield addSubscribersStart( siteId );

		try {
			const data: AddSubscribersResponse = yield wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteId ) }/invites/new`,
				method: 'POST',
				apiNamespace: 'rest/v1.1',
				body: {
					invitees: emails,
					role: 'follower',
					source: 'calypso',
					is_external: false,
				},
			} );

			yield addSubscribersSuccess( siteId, data );
		} catch ( err ) {
			yield addSubscribersFailed( siteId );
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
			const token = oauthToken.getToken();
			const data: GetSubscribersImportResponse = yield wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteId ) }/subscribers/import/${ importId }`,
				method: 'GET',
				apiNamespace: 'wpcom/v2',
				token: typeof token === 'string' ? token : undefined,
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
		try {
			const path = `/sites/${ encodeURIComponent( siteId ) }/subscribers/import`;
			const token = oauthToken.getToken();
			const data: GetSubscribersImportsResponse = yield wpcomRequest( {
				path: ! status ? path : `${ path }?status=${ encodeURIComponent( status ) }`,
				method: 'GET',
				apiNamespace: 'wpcom/v2',
				token: typeof token === 'string' ? token : undefined,
			} );

			yield getSubscribersImportsSuccess( siteId, data );
		} catch ( error ) {
			yield importCsvSubscribersStartFailed( siteId, error as ImportSubscribersError );
		}
	}

	return {
		importCsvSubscribersStart,
		importCsvSubscribersStartSuccess,
		importCsvSubscribersStartFailed,
		importCsvSubscribersUpdate,
		importCsvSubscribers,
		addSubscribersStart,
		addSubscribersSuccess,
		addSubscribersFailed,
		addSubscribers,
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
	| ActionCreators[ 'addSubscribersStart' ]
	| ActionCreators[ 'addSubscribersSuccess' ]
	| ActionCreators[ 'addSubscribersFailed' ]
	| ActionCreators[ 'getSubscribersImportSuccess' ]
	| ActionCreators[ 'getSubscribersImportsSuccess' ]
>;
