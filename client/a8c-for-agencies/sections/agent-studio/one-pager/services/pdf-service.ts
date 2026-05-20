import { exportPagesAsPdf } from '../engine/export-pdf';
import { defaultThumbnailService } from './thumbnail-service';
import type { PdfService } from './types';

// Default impl rasterizes each page to PNG via the thumbnail service, then
// stitches them with jsPDF on the client. Server impls render the source
// HTML through a headless browser for higher-fidelity output.
export const defaultPdfService: PdfService = {
	async exportPdf( { title, pages } ) {
		return exportPagesAsPdf( {
			title,
			pages,
			renderPng: ( html, width, height ) =>
				defaultThumbnailService.renderPagePng( { html, width, height } ),
		} );
	},
};
