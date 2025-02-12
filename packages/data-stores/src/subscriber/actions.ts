import * as oauthToken from '@automattic/oauth-token';
import wpcomProxyRequest from 'wpcom-proxy-request';
import type {
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
		file: File | undefined,
		emails: string[],
		categories: number[]
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

	const importCsvSubscribers =
		(
			siteId: number,
			file?: File,
			emails: string[] = [],
			categories: number[] = [],
			parseOnly: boolean = false
		) =>
		async ( { dispatch }: ThunkArgs ) => {
			dispatch.importCsvSubscribersStart( siteId, file, emails, categories );

			try {
				const token = oauthToken.getToken();
				const formDataEntries: Array<
					[ string, string | number | File ] | [ string, File, string ]
				> = [
					...( file ? [ [ 'import', file, file.name ] as [ string, File, string ] ] : [] ),

					...categories.map(
						( categoryId ) => [ 'categories[]', categoryId ] as [ string, number ]
					),

					...emails.map( ( email ) => [ 'emails[]', email ] as [ string, string ] ),

					[ 'parse_only', String( parseOnly ) ] as [ string, string ],
				];

				const data = ( await wpcomProxyRequest( {
					path: `/sites/${ encodeURIComponent( siteId ) }/subscribers/import`,
					method: 'POST',
					apiNamespace: 'wpcom/v2',
					token: typeof token === 'string' ? token : undefined,
					formData: formDataEntries as ( string | File )[][],
				} ) ) as ImportSubscribersResponse & { error?: { code: string; message: string } };

				if ( data.upload_id ) {
					dispatch.importCsvSubscribersStartSuccess( siteId, data.upload_id );
				} else {
					dispatch.importCsvSubscribersStartFailed( siteId, data as ImportSubscribersError );
				}
			} catch ( error ) {
				dispatch.importCsvSubscribersStartFailed( siteId, error as ImportSubscribersError );
			}
		};

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

	const addSubscribers =
		( siteId: number, emails: string[] ) =>
		async ( { dispatch }: ThunkArgs ) => {
			dispatch.addSubscribersStart( siteId );

			try {
				const response: AddSubscribersResponse = await wpcomProxyRequest( {
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

				dispatch.addSubscribersSuccess( siteId, response );
			} catch {
				dispatch.addSubscribersFailed( siteId );
			}
		};

	/**
	 * ↓ Get import
	 */
	const getSubscribersImportSuccess = ( siteId: number, importJob: ImportJob ) => ( {
		type: 'GET_SUBSCRIBERS_IMPORT_SUCCESS' as const,
		siteId,
		importJob,
	} );

	const getSubscribersImport =
		( siteId: number, importId: number ) =>
		async ( { dispatch }: ThunkArgs ) => {
			try {
				const token = oauthToken.getToken();
				const importJob: GetSubscribersImportResponse = await wpcomProxyRequest( {
					path: `/sites/${ encodeURIComponent( siteId ) }/subscribers/import/${ importId }`,
					method: 'GET',
					apiNamespace: 'wpcom/v2',
					token: typeof token === 'string' ? token : undefined,
				} );

				dispatch.getSubscribersImportSuccess( siteId, importJob );
			} catch ( e ) {}
		};

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

	const getSubscribersImports =
		( siteId: number, status?: ImportJobStatus ) =>
		async ( { dispatch }: ThunkArgs ) => {
			try {
				const path = `/sites/${ encodeURIComponent( siteId ) }/subscribers/import`;
				const token = oauthToken.getToken();
				const imports: GetSubscribersImportsResponse = await wpcomProxyRequest( {
					path: ! status ? path : `${ path }?status=${ encodeURIComponent( status ) }`,
					method: 'GET',
					apiNamespace: 'wpcom/v2',
					token: typeof token === 'string' ? token : undefined,
				} );

				dispatch.getSubscribersImportsSuccess( siteId, imports );
			} catch ( error ) {
				dispatch.importCsvSubscribersStartFailed( siteId, error as ImportSubscribersError );
			}
		};

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

type ThunkArgs = { dispatch: ActionCreators };

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
