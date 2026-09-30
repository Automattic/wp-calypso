/**
 * @jest-environment jsdom
 */
import { updateImporter, uploadExportFile } from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import { STATIC_SITE_IMPORT_SHARE_KEY_PREFIX } from '../lib/constants';
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
	const shareKey = STATIC_SITE_IMPORT_SHARE_KEY_PREFIX + 'playground-1';

	beforeEach( () => {
		jest.clearAllMocks();
		localStorage.clear();
		uploadExportFileMock.mockResolvedValue( { importId: 'import-id' } );
	} );

	it( 'sends the share token its Playground was booted from, once', async () => {
		localStorage.setItem( shareKey, 'a.b.c' );

		await uploadPlaygroundSiteZip( siteId, siteZip, 'playground-1' );

		expect( uploadExportFileMock ).toHaveBeenCalledWith(
			siteId,
			expect.objectContaining( { file: siteZip, autoStart: true, staticSiteImportShare: 'a.b.c' } )
		);
		expect( localStorage.getItem( shareKey ) ).toBeNull();
	} );

	it( "does not send another Playground's share token", async () => {
		localStorage.setItem( shareKey, 'a.b.c' );

		await uploadPlaygroundSiteZip( siteId, siteZip, 'playground-2' );

		expect( uploadExportFileMock ).toHaveBeenCalledWith(
			siteId,
			expect.objectContaining( { staticSiteImportShare: undefined } )
		);
		expect( localStorage.getItem( shareKey ) ).toBe( 'a.b.c' );
	} );
} );
