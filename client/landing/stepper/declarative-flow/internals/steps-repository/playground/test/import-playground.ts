/**
 * @jest-environment jsdom
 */
import wpcomRequest from 'wpcom-proxy-request';
import { updateImporter, uploadExportFile } from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import {
	ImportFailureError,
	UnsupportedExportError,
	importPlaygroundSite,
	ensureImportStarted,
} from '../lib/import-playground';
import type { ImportJob } from 'calypso/blocks/importer/types';

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

describe( 'ensureImportStarted', () => {
	const siteId = 123;
	const status = {
		importerId: 'import-id',
		importerState: appStates.UPLOAD_SUCCESS,
		importerFileType: 'playground',
		type: 'importer-type-wordpress',
		site: { ID: siteId },
	} as ImportJob;

	beforeEach( () => {
		jest.clearAllMocks();
		updateImporterMock.mockResolvedValue( {} );
	} );

	it( 'starts a Playground import as soon as its upload succeeds', async () => {
		await expect( ensureImportStarted( siteId, status ) ).resolves.toBe( true );

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
			ensureImportStarted( siteId, {
				...status,
				importerState: appStates.UPLOAD_PROCESSING,
			} )
		).resolves.toBe( false );

		expect( updateImporterMock ).not.toHaveBeenCalled();
	} );

	it( 'reports an auto-started import as started without sending the start', async () => {
		await expect(
			ensureImportStarted( siteId, { ...status, importerState: appStates.IMPORTING } )
		).resolves.toBe( true );

		expect( updateImporterMock ).not.toHaveBeenCalled();
	} );

	it( 'fails a non-Playground upload instead of waiting for it', async () => {
		await expect(
			ensureImportStarted( siteId, {
				...status,
				importerFileType: 'content',
			} )
		).rejects.toBeInstanceOf( UnsupportedExportError );

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

		await expect( importPlaygroundSite( 'slug', siteId, onProgress ) ).resolves.toBe( 'import-id' );

		expect( onProgress.mock.calls.map( ( [ progress ] ) => progress ) ).toEqual( [
			{ phase: 'packing' },
			{ phase: 'uploading' },
			{ phase: 'uploading', percent: 25 },
			{ phase: 'uploading', percent: undefined },
			{ phase: 'starting' },
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

	it( 'reports server progress only after the start trigger is sent', async () => {
		uploadExportFileMock.mockResolvedValue( {
			importId: 'import-id',
			importStatus: 'uploadProcessing',
			importerFileType: 'playground',
			type: 'wordpress',
			siteId,
		} );
		const poll = ( importStatus: string ) => ( {
			importId: 'import-id',
			importStatus,
			importerFileType: 'playground',
			type: 'wordpress',
			siteId,
		} );
		wpcomRequestMock
			.mockResolvedValueOnce( poll( 'uploadProcessing' ) )
			.mockResolvedValueOnce( poll( 'uploadSuccess' ) )
			.mockResolvedValueOnce( poll( 'importSuccess' ) );
		jest.useFakeTimers();
		const onProgress = jest.fn();

		const result = importPlaygroundSite( 'slug', siteId, onProgress );
		await jest.runAllTimersAsync();
		await expect( result ).resolves.toBe( 'import-id' );
		jest.useRealTimers();

		const phases = onProgress.mock.calls.map( ( [ progress ] ) => progress.phase );
		expect( phases.slice( phases.indexOf( 'starting' ) ) ).toEqual( [
			'starting',
			'importing',
			'importing',
		] );
		expect( updateImporterMock ).toHaveBeenCalledTimes( 1 );
		expect( updateImporterMock.mock.invocationCallOrder[ 0 ] ).toBeLessThan(
			onProgress.mock.invocationCallOrder[ phases.indexOf( 'importing' ) ]
		);
	} );

	it( 'reports server progress at once when the upload already started the import', async () => {
		uploadExportFileMock.mockResolvedValue( {
			importId: 'import-id',
			importStatus: 'importing',
			importerFileType: 'playground',
			type: 'wordpress',
			siteId,
			progress: { steps: { completed: 0, total: 9 } },
		} );
		wpcomRequestMock
			.mockResolvedValueOnce( {
				importId: 'import-id',
				importStatus: 'importing',
				importerFileType: 'playground',
				type: 'wordpress',
				siteId,
				customData: { current_step: 'download_archive' },
				progress: { steps: { completed: 1, total: 9 } },
			} )
			.mockResolvedValueOnce( {
				importId: 'import-id',
				importStatus: 'importSuccess',
				importerFileType: 'playground',
				type: 'wordpress',
				siteId,
			} );
		jest.useFakeTimers();
		const onProgress = jest.fn();

		const result = importPlaygroundSite( 'slug', siteId, onProgress );
		await jest.runAllTimersAsync();
		await expect( result ).resolves.toBe( 'import-id' );
		jest.useRealTimers();

		expect( onProgress ).toHaveBeenCalledWith( {
			phase: 'importing',
			job: expect.objectContaining( { customData: { current_step: 'download_archive' } } ),
		} );
		expect( updateImporterMock ).not.toHaveBeenCalled();
	} );

	it( 'fails when the server reports an import failure', async () => {
		wpcomRequestMock.mockResolvedValue( {
			importId: 'import-id',
			importStatus: 'importFailure',
			importerFileType: 'playground',
			type: 'wordpress',
			siteId,
		} );

		await expect( importPlaygroundSite( 'slug', siteId ) ).rejects.toBeInstanceOf(
			ImportFailureError
		);
	} );

	it( 'fails at once when the upload is not recognized as a Playground export', async () => {
		uploadExportFileMock.mockResolvedValue( {
			importId: 'import-id',
			importStatus: 'uploadSuccess',
			importerFileType: 'content',
			type: 'wordpress',
			siteId,
		} );

		await expect( importPlaygroundSite( 'slug', siteId ) ).rejects.toBeInstanceOf(
			UnsupportedExportError
		);
		expect( updateImporterMock ).not.toHaveBeenCalled();
		expect( wpcomRequestMock ).not.toHaveBeenCalled();
	} );
} );
