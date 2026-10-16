/**
 * @jest-environment jsdom
 */
import wpcomRequest from 'wpcom-proxy-request';
import { updateImporter, uploadExportFile } from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import { importPlaygroundSite, startPlaygroundImportIfReady } from '../lib/import-playground';

jest.mock( 'calypso/state/imports/actions', () => ( {
	uploadExportFile: jest.fn(),
	updateImporter: jest.fn(),
} ) );

jest.mock( 'wpcom-proxy-request', () => jest.fn() );

jest.mock(
	'https://playground.wordpress.net/client/index.js',
	() => ( {
		startPlaygroundAPI: async () => ( {
			exportSavedSiteAsZip: async () => new Blob( [ 'zip' ] ),
		} ),
	} ),
	{ virtual: true }
);

const updateImporterMock = updateImporter as jest.Mock;
const uploadExportFileMock = uploadExportFile as jest.Mock;
const wpcomRequestMock = wpcomRequest as unknown as jest.Mock;

describe( 'startPlaygroundImportIfReady', () => {
	const siteId = 123;
	const status = {
		importerId: 'import-id',
		importerState: appStates.UPLOAD_SUCCESS,
		importerFileType: 'playground',
		type: 'importer-type-wordpress',
		site: { ID: siteId },
	};

	beforeEach( () => {
		jest.clearAllMocks();
		updateImporterMock.mockResolvedValue( {} );
	} );

	it( 'starts a Playground import as soon as its upload succeeds', async () => {
		await expect( startPlaygroundImportIfReady( siteId, status ) ).resolves.toBe( true );

		expect( updateImporterMock ).toHaveBeenCalledWith( siteId, {
			importerId: 'import-id',
			progress: undefined,
			importStatus: 'importing',
			siteId,
			type: 'wordpress',
		} );
	} );

	it( 'waits when the Playground upload is still processing', async () => {
		await expect(
			startPlaygroundImportIfReady( siteId, {
				...status,
				importerState: appStates.UPLOAD_PROCESSING,
			} )
		).resolves.toBe( false );

		expect( updateImporterMock ).not.toHaveBeenCalled();
	} );

	it( 'does not start a non-Playground upload', async () => {
		await expect(
			startPlaygroundImportIfReady( siteId, {
				...status,
				importerFileType: 'content',
			} )
		).resolves.toBe( false );

		expect( updateImporterMock ).not.toHaveBeenCalled();
	} );
} );

describe( 'importPlaygroundSite', () => {
	const siteId = 123;

	beforeEach( () => {
		jest.clearAllMocks();
		updateImporterMock.mockResolvedValue( {} );
		uploadExportFileMock.mockImplementation( async ( _siteId, { onprogress } ) => {
			onprogress( { lengthComputable: true, loaded: 25, total: 100 } );
			onprogress( { lengthComputable: false, loaded: 50, total: 0 } );
			return {
				importId: 'import-id',
				importStatus: 'uploadSuccess',
				importerFileType: 'playground',
				type: 'wordpress',
				siteId,
			};
		} );
	} );

	it( 'reports packing, real upload progress, and each polled import status', async () => {
		wpcomRequestMock.mockResolvedValue( {
			importId: 'import-id',
			importStatus: 'importSuccess',
			importerFileType: 'playground',
			type: 'wordpress',
			siteId,
			progress: { steps: { completed: 9, total: 9 } },
			customData: { current_step: 'clean_up' },
		} );
		const onProgress = jest.fn();

		await expect(
			importPlaygroundSite( 'slug', siteId, { waitForCompletion: true, onProgress } )
		).resolves.toBe( 'import-id' );

		expect( onProgress.mock.calls.map( ( [ progress ] ) => progress ) ).toEqual( [
			{ phase: 'packing' },
			{ phase: 'uploading' },
			{ phase: 'uploading', percent: 25 },
			{ phase: 'uploading', percent: undefined },
			{
				phase: 'importing',
				job: expect.objectContaining( {
					importerState: appStates.IMPORT_SUCCESS,
					progress: { steps: { completed: 9, total: 9 } },
					customData: { current_step: 'clean_up' },
				} ),
			},
		] );
	} );

	it( 'stops reporting after the upload when it does not wait for completion', async () => {
		const onProgress = jest.fn();

		await importPlaygroundSite( 'slug', siteId, { onProgress } );

		expect( onProgress ).toHaveBeenLastCalledWith( { phase: 'uploading', percent: undefined } );
		expect( wpcomRequestMock ).not.toHaveBeenCalled();
	} );
} );
