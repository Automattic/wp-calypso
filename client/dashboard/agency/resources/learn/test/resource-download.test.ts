import { getResourceDownload } from '../resource-download';
import type { LibraryResource } from '../types';

const resource: LibraryResource = {
	id: 'example',
	title: 'Example',
	description: '',
	product: 'WooCommerce',
	stage: '',
	audience: 'Agency-facing',
	contentType: 'Guide',
	format: 'Webpage',
	url: 'https://example.com/guide',
};

test( 'recognizes downloadable files independently of the format label', () => {
	expect( getResourceDownload( resource ) ).toBeUndefined();
	expect(
		getResourceDownload( { ...resource, url: 'https://example.com/guide.pdf?version=2' } )
	).toMatchObject( { filename: 'Example.pdf', fetchFile: true } );
	expect(
		getResourceDownload( {
			...resource,
			url: 'https://drive.google.com/file/d/file-id/view?resourcekey=access-key',
		} )?.url
	).toBe( 'https://drive.google.com/uc?export=download&id=file-id&resourcekey=access-key' );
	expect(
		getResourceDownload( { ...resource, url: 'https://drive.google.com/drive/folders/folder-id' } )
	).toBeUndefined();
} );

test.each( [
	[ 'document', 'export?format=pdf', 'PDF' ],
	[ 'presentation', 'export/pdf', 'PDF' ],
	[ 'spreadsheets', 'export?format=xlsx', 'XLSX' ],
] )( 'exports Google %s resources', ( type, suffix, format ) => {
	expect(
		getResourceDownload( { ...resource, url: `https://docs.google.com/${ type }/d/file-id/edit` } )
	).toEqual( {
		url: `https://docs.google.com/${ type }/d/file-id/${ suffix }`,
		exportFormat: format,
	} );
} );

test( 'does not invent exports for published documents or unsafe URLs', () => {
	for ( const url of [
		'https://docs.google.com/presentation/d/e/published-id/embed',
		'javascript:alert(1)',
		'invalid',
	] ) {
		expect( getResourceDownload( { ...resource, url } ) ).toBeUndefined();
	}
} );
