import wp from 'calypso/lib/wp';
import { uploadExportFile } from 'calypso/state/imports/actions';

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

	it( 'keeps uploading files through the import field', () => {
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

	it( 'supports starting an import with an attachment ID', () => {
		uploadExportFile( siteId, { importStatus, attachmentId: 456 } );

		expect( wp.req.post ).toHaveBeenCalledWith(
			{
				path: '/sites/123/imports/new',
				formData: [
					[ 'importStatus', JSON.stringify( importStatus ) ],
					[ 'attachmentId', 456 ],
				],
			},
			expect.any( Function )
		);
	} );
} );
