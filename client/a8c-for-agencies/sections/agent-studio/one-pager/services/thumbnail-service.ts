import { renderElaPng } from '../engine/render-png';
import type { ThumbnailService } from './types';

// Default impl rasterizes via html-to-image on the client. Server impls
// render through a headless browser and return URLs instead of data URLs.
export const defaultThumbnailService: ThumbnailService = {
	async renderPagePng( { html } ) {
		return renderElaPng( html );
	},
};
