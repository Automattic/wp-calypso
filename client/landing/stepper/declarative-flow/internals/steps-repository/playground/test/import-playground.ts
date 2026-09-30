/**
 * @jest-environment jsdom
 */
import { updateImporter, uploadExportFile } from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import { SESSION_KEY_STATIC_SITE_IMPORT_SHARE } from '../lib/constants';
import { startPlaygroundImportIfReady, uploadPlaygroundSiteZip } from '../lib/import-playground';

jest.mock( 'calypso/state/imports/actions', () => ( {
	uploadExportFile: jest.fn(),
	updateImporter: jest.fn(),
} ) );

const updateImporterMock = updateImporter as jest.Mock;
const uploadExportFileMock = uploadExportFile as jest.Mock;

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

describe( 'uploadPlaygroundSiteZip', () => {
	const siteId = 123;
	const siteZip = new File( [ 'zip' ], 'site.zip', { type: 'application/zip' } );

	beforeEach( () => {
		jest.clearAllMocks();
		sessionStorage.clear();
		uploadExportFileMock.mockResolvedValue( { importId: 'import-id' } );
	} );

	it( 'sends the static site import share token it was opened from, once', async () => {
		sessionStorage.setItem( SESSION_KEY_STATIC_SITE_IMPORT_SHARE, 'a.b.c' );

		await uploadPlaygroundSiteZip( siteId, siteZip );

		expect( uploadExportFileMock ).toHaveBeenCalledWith(
			siteId,
			expect.objectContaining( { file: siteZip, autoStart: true, staticSiteImportShare: 'a.b.c' } )
		);
		expect( sessionStorage.getItem( SESSION_KEY_STATIC_SITE_IMPORT_SHARE ) ).toBeNull();
	} );

	it( 'sends no share token for a Playground that did not come from an import', async () => {
		await uploadPlaygroundSiteZip( siteId, siteZip );

		expect( uploadExportFileMock ).toHaveBeenCalledWith(
			siteId,
			expect.objectContaining( { staticSiteImportShare: undefined } )
		);
	} );
} );
