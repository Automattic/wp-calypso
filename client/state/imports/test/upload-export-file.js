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
} );
