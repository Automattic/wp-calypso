import wpcomRequest from 'wpcom-proxy-request';
import { uploadExportFile } from 'calypso/state/imports/actions';
import { pollForAtomicProvisioning } from '../../create-site/early-provisioning';
import { createPlaygroundImport } from '../lib/import-playground';

jest.mock( 'wpcom-proxy-request', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

jest.mock( 'calypso/state/imports/actions', () => ( {
	uploadExportFile: jest.fn(),
	updateImporter: jest.fn(),
} ) );

jest.mock( '../../create-site/early-provisioning', () => ( {
	pollForAtomicProvisioning: jest.fn(),
} ) );

const wpcomRequestMock = wpcomRequest as jest.Mock;
const pollForAtomicProvisioningMock = pollForAtomicProvisioning as jest.Mock;
const uploadExportFileMock = uploadExportFile as jest.Mock;

describe( 'createPlaygroundImport', () => {
	const siteId = 123;
	const siteZip = new File( [ 'zip contents' ], 'site.zip', { type: 'application/zip' } );

	beforeEach( () => {
		jest.clearAllMocks();
		pollForAtomicProvisioningMock.mockResolvedValue( { siteSlug: 'example.wordpress.com' } );
	} );

	it( 'waits for the site to become Atomic before uploading the export', async () => {
		let resolveProvisioning!: ( value: { siteSlug: string } ) => void;
		pollForAtomicProvisioningMock.mockReturnValueOnce(
			new Promise( ( resolve ) => {
				resolveProvisioning = resolve;
			} )
		);
		wpcomRequestMock.mockResolvedValue( { media: [ { ID: 456 } ] } );
		uploadExportFileMock.mockResolvedValue( { importId: 'import-id' } );

		const importPromise = createPlaygroundImport( siteId, siteZip );

		expect( pollForAtomicProvisioningMock ).toHaveBeenCalledWith( siteId );
		expect( wpcomRequestMock ).not.toHaveBeenCalled();
		expect( uploadExportFileMock ).not.toHaveBeenCalled();

		resolveProvisioning( { siteSlug: 'example.wordpress.com' } );

		await expect( importPromise ).resolves.toEqual( {
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
			attachmentId: 456,
		} );
	} );

	it( 'does not upload the export when Atomic provisioning fails', async () => {
		pollForAtomicProvisioningMock.mockRejectedValue( new Error( 'Provisioning failed' ) );

		await expect( createPlaygroundImport( siteId, siteZip ) ).rejects.toThrow(
			'Provisioning failed'
		);
		expect( wpcomRequestMock ).not.toHaveBeenCalled();
		expect( uploadExportFileMock ).not.toHaveBeenCalled();
	} );

	it( 'does not start an import when the media upload has no attachment ID', async () => {
		wpcomRequestMock.mockResolvedValue( { media: [] } );

		await expect( createPlaygroundImport( siteId, siteZip ) ).rejects.toThrow(
			'No media ID returned after uploading the Playground export.'
		);
		expect( uploadExportFileMock ).not.toHaveBeenCalled();
	} );
} );
