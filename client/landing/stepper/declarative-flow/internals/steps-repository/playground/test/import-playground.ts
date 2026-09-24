import { updateImporter } from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import { startPlaygroundImportIfReady } from '../lib/import-playground';

jest.mock( 'calypso/state/imports/actions', () => ( {
	uploadExportFile: jest.fn(),
	updateImporter: jest.fn(),
} ) );

const updateImporterMock = updateImporter as jest.Mock;

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
