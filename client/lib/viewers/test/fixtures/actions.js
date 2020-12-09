/**
 * Internal dependencies
 */

import site from './site';
import viewerData from './viewers-1';
import moreViewerData from './viewers-2';

export default {
	fetchedViewersEmpty: {
		type: 'RECEIVE_VIEWERS',
		siteId: site.ID,
		data: { found: 20, viewers: [] },
		page: 2,
		error: null,
	},

	fetchedViewers: {
		type: 'RECEIVE_VIEWERS',
		siteId: site.ID,
		data: viewerData,
		page: 1,
		error: null,
	},

	fetchedMoreViewers: {
		type: 'RECEIVE_VIEWERS',
		siteId: site.ID,
		data: moreViewerData,
		page: 2,
		error: null,
	},

	removeViewer: {
		type: 'VIEWER_REMOVE',
		siteId: site.ID,
		viewer: viewerData.viewers[ 0 ],
	},

	removeViewerError: {
		type: 'RECEIVE_REMOVE_VIEWER_ERROR',
		siteId: site.ID,
		viewer: viewerData.viewers[ 0 ],
	},
};
