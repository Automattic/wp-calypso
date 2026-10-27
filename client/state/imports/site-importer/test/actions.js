import wpcom from 'calypso/lib/wp';
import { appStates } from 'calypso/state/imports/constants';
import { importSite, validateSiteIsImportable } from '../actions';

jest.mock( 'calypso/lib/wp', () => ( {
	req: {
		get: jest.fn(),
		post: jest.fn(),
	},
} ) );

jest.mock( 'calypso/lib/mshots', () => ( {
	prefetchmShotsPreview: jest.fn(),
} ) );

const flushPromises = () => new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

const getTracksEvent = ( dispatch, eventName ) =>
	dispatch.mock.calls
		.map( ( [ action ] ) => action?.meta?.analytics?.[ 0 ]?.payload )
		.find( ( payload ) => payload?.name === eventName )?.properties;

const apiError = ( body ) =>
	Object.assign(
		new Error( body.message ),
		{ name: 'InternalServerError', statusCode: 500 },
		body
	);

describe( 'site importer actions', () => {
	const site = { ID: 123 };
	const targetSiteUrl = 'https://example.com';

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'importSite', () => {
		const runImportSite = async () => {
			const dispatch = jest.fn();
			importSite( {
				engine: 'wix',
				importerStatus: {
					importerId: 'importer-id',
					importerState: appStates.READY_FOR_UPLOAD,
					site,
					type: 'importer-type-wix',
				},
				params: { engine: 'wix' },
				site,
				supportedContent: [],
				targetSiteUrl,
				unsupportedContent: [],
			} )( dispatch );
			await flushPromises();
			return dispatch;
		};

		test( 'records the error code and type when the request fails', async () => {
			wpcom.req.post.mockRejectedValue(
				apiError( {
					code: 1000002,
					message: 'A translated message (ID: 2d1c6c9e)',
					data: { status: 500 },
				} )
			);

			const dispatch = await runImportSite();

			const properties = getTracksEvent(
				dispatch,
				'calypso_site_importer_start_import_request_failure'
			);
			expect( properties ).toMatchObject( {
				blog_id: 123,
				site_url: targetSiteUrl,
				error_code: 1000002,
				error_type: 'InternalServerError',
			} );
			expect( JSON.stringify( properties ) ).not.toContain( 'translated message' );
		} );

		test( 'records the error type for exceptions thrown after a successful request', async () => {
			wpcom.req.post.mockResolvedValue( null );

			const dispatch = await runImportSite();

			const properties = getTracksEvent(
				dispatch,
				'calypso_site_importer_start_import_request_failure'
			);
			expect( properties.error_code ).toBeUndefined();
			expect( properties.error_type ).toBe( 'TypeError' );
		} );
	} );

	describe( 'validateSiteIsImportable', () => {
		const mockIsSiteImportable = ( result ) =>
			wpcom.req.get.mockImplementation( ( { path } ) =>
				path.includes( 'is-site-importable' ) ? result() : Promise.resolve( {} )
			);

		test( 'records the reason code when the site is not importable', async () => {
			mockIsSiteImportable( () =>
				Promise.reject( apiError( { code: 'unauthorized', message: 'Not allowed' } ) )
			);
			const dispatch = jest.fn();

			await validateSiteIsImportable( { params: {}, site, targetSiteUrl } )( dispatch );

			expect( getTracksEvent( dispatch, 'calypso_site_importer_validate_site_failure' ) ).toEqual( {
				blog_id: 123,
				site_url: targetSiteUrl,
				error_code: 'unauthorized',
			} );
		} );

		test( 'records no reason code when the failure has none', async () => {
			mockIsSiteImportable( () => Promise.reject( new Error( 'Network error' ) ) );
			const dispatch = jest.fn();

			await validateSiteIsImportable( { params: {}, site, targetSiteUrl } )( dispatch );

			const properties = getTracksEvent( dispatch, 'calypso_site_importer_validate_site_failure' );
			expect( properties.blog_id ).toBe( 123 );
			expect( properties.error_code ).toBeUndefined();
		} );
	} );
} );
