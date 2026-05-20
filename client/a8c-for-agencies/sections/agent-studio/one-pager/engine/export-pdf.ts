import jsPDF from 'jspdf';
import type { PageRender } from '../services/types';

function safeFileBase( title: string ): string {
	const base = title
		.normalize( 'NFKD' )
		.replace( /[^a-zA-Z0-9-_ ]+/g, '' )
		.trim()
		.replace( /\s+/g, '-' );
	return base || 'one-pager';
}

/**
 * Stitches page PNGs (rendered via the provided renderPng callback) into a
 * single multi-page PDF. Returns a Blob plus the suggested filename.
 * @param request - The export request.
 * @param request.title - The output's title (used for the file name).
 * @param request.pages - The pages to include, in document order.
 * @param request.renderPng - Function that rasterizes a page's HTML to a PNG data URL.
 * @returns A Blob containing the PDF, plus the filename to suggest.
 */
export async function exportPagesAsPdf( request: {
	title: string;
	pages: PageRender[];
	renderPng: ( html: string, width: number, height: number ) => Promise< string >;
} ): Promise< { blob: Blob; fileName: string } > {
	const { title, pages, renderPng } = request;
	if ( pages.length === 0 ) {
		throw new Error( 'No pages to export' );
	}
	const first = pages[ 0 ];
	const orient = first.height >= first.width ? 'p' : 'l';
	// eslint-disable-next-line new-cap
	const doc = new jsPDF( {
		orientation: orient,
		unit: 'pt',
		format: [ first.width, first.height ],
		compress: true,
	} );

	for ( let i = 0; i < pages.length; i++ ) {
		const page = pages[ i ];
		if ( i > 0 ) {
			const orientI = page.height >= page.width ? 'p' : 'l';
			doc.addPage( [ page.width, page.height ], orientI );
		}
		const dataUrl = await renderPng( page.html, page.width, page.height );
		doc.addImage( dataUrl, 'PNG', 0, 0, page.width, page.height, undefined, 'FAST' );
	}

	const blob = doc.output( 'blob' );
	return { blob, fileName: `${ safeFileBase( title ) }.pdf` };
}
