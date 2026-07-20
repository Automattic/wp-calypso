import wpcomRequest from 'wpcom-proxy-request';
import { uploadExportFile } from 'calypso/state/imports/actions';
import { createPlaygroundImport } from '../lib/import-playground';

jest.mock( 'wpcom-proxy-request', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

jest.mock( 'calypso/state/imports/actions', () => ( {
	uploadExportFile: jest.fn(),
	updateImporter: jest.fn(),
} ) );

const wpcomRequestMock = wpcomRequest as jest.Mock;
const uploadExportFileMock = uploadExportFile as jest.Mock;

describe( 'createPlaygroundImport', () => {
	const siteId = 123;
	const siteZip = new File( [ 'zip contents' ], 'site.zip', { type: 'application/zip' } );

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'uploads the export to the Atomic site and passes its media ID to the importer', async () => {
		wpcomRequestMock.mockResolvedValue( { media: [ { ID: 456 } ] } );
		uploadExportFileMock.mockResolvedValue( { importId: 'import-id' } );

		await expect( createPlaygroundImport( siteId, siteZip ) ).resolves.toEqual( {
			importId: 'import-id',
		} );

		expect( wpcomRequestMock ).toHaveBeenCalledWith( {
			path: '/sites/123/media/new',
			apiVersion: '1.1',
			method: 'POST',
			formData: [ [ 'media[]', siteZip ] ],
		} );
		expect( uploadExportFileMock ).toHaveBeenCalledWith( siteId, {
			importStatus: {
				importStatus: 'importer-ready-for-upload',
				siteId,
				type: 'wordpress',
			},
			mediaID: 456,
		} );
	} );

	it( 'does not start an import when the media upload has no attachment ID', async () => {
		wpcomRequestMock.mockResolvedValue( { media: [] } );

		await expect( createPlaygroundImport( siteId, siteZip ) ).rejects.toThrow(
			'No media ID returned after uploading the Playground export.'
		);
		expect( uploadExportFileMock ).not.toHaveBeenCalled();
	} );
} );
