import { createStore, combineReducers, applyMiddleware } from 'redux'; // eslint-disable-line no-restricted-imports
import { thunk } from 'redux-thunk';
import wp from 'calypso/lib/wp';
import { startImport, startUpload, uploadExportFile } from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import imports from 'calypso/state/imports/reducer';
import { getImporterStatus } from 'calypso/state/imports/selectors';

jest.mock( 'calypso/lib/wp', () => ( {
	req: {
		post: jest.fn(),
	},
} ) );

describe( 'uploadExportFile', () => {
	const siteId = 123;
	const importStatus = {
		importStatus: 'importer-ready-for-upload',
		siteId,
		type: 'wordpress',
	};

	beforeEach( () => {
		jest.clearAllMocks();
		wp.req.post.mockReturnValue( { upload: {} } );
	} );

	it( 'requests an auto-starting import when enabled', () => {
		const file = new File( [ 'contents' ], 'export.zip', { type: 'application/zip' } );

		uploadExportFile( siteId, { importStatus, file, autoStart: true } );

		expect( wp.req.post ).toHaveBeenCalledWith(
			{
				path: '/sites/123/imports/new',
				formData: [
					[ 'importStatus', JSON.stringify( importStatus ) ],
					[ 'import', file ],
					[ 'autoStart', '1' ],
				],
			},
			expect.any( Function )
		);
	} );

	it( 'does not auto-start other uploads by default', () => {
		const file = new File( [ 'contents' ], 'export.zip', { type: 'application/zip' } );

		uploadExportFile( siteId, { importStatus, file } );

		expect( wp.req.post ).toHaveBeenCalledWith(
			{
				path: '/sites/123/imports/new',
				formData: [
					[ 'importStatus', JSON.stringify( importStatus ) ],
					[ 'import', file ],
				],
			},
			expect.any( Function )
		);
	} );

	it( 'stores the error code and file when the server rejects the upload', async () => {
		const store = createStore( combineReducers( { imports } ), applyMiddleware( thunk ) );
		const { importerId } = store.dispatch( startImport( siteId, 'importer-type-wordpress' ) );
		const file = new File( [ 'contents' ], 'export.txt', { type: 'text/plain' } );
		const error = Object.assign( new Error( 'A translated message' ), {
			error: 'no_import_file',
			statusCode: 400,
		} );
		wp.req.post.mockImplementation( ( params, resolver ) => {
			resolver( error );
			return { upload: {} };
		} );

		await store.dispatch( startUpload( getImporterStatus( store.getState(), importerId ), file ) );

		expect( getImporterStatus( store.getState(), importerId ) ).toMatchObject( {
			importerState: appStates.UPLOAD_FAILURE,
			errorData: {
				type: 'uploadError',
				code: 'no_import_file',
				description: 'A translated message',
			},
			file,
		} );
	} );

	it( 'stores no error code when the upload fails without one', async () => {
		const store = createStore( combineReducers( { imports } ), applyMiddleware( thunk ) );
		const { importerId } = store.dispatch( startImport( siteId, 'importer-type-wordpress' ) );
		const file = new File( [ 'contents' ], 'export.xml', { type: 'text/xml' } );
		wp.req.post.mockImplementation( ( params, resolver ) => {
			resolver( new Error( 'Network error' ) );
			return { upload: {} };
		} );

		await store.dispatch( startUpload( getImporterStatus( store.getState(), importerId ), file ) );

		const { errorData } = getImporterStatus( store.getState(), importerId );
		expect( errorData.type ).toBe( 'uploadError' );
		expect( errorData.code ).toBeUndefined();
	} );
} );
