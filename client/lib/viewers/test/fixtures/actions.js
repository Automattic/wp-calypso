var site = require( './site' ),
	viewerData = require( './viewers-1' ),
	moreViewerData = require( './viewers-2' );

module.exports = {
	fetchedViewersEmpty: {
		type: 'RECEIVE_VIEWERS',
		siteId: site.ID,
		data: { found: 20, viewers: [] },
		page: 2,
		error: null
	},

	fetchedViewers: {
		type: 'RECEIVE_VIEWERS',
		siteId: site.ID,
		data: viewerData,
		page: 1,
		error: null
	},

	fetchedMoreViewers: {
		type: 'RECEIVE_VIEWERS',
		siteId: site.ID,
		data: moreViewerData,
		page: 2,
		error: null
	},

	removeViewer: {
		type: 'REMOVE_VIEWER',
		siteId: site.ID,
		viewer: viewerData.viewers[ 0 ]
	},

	removeViewerError: {
		type: 'RECEIVE_REMOVE_VIEWER_ERROR',
		siteId: site.ID,
		viewer: viewerData.viewers[ 0 ]
	}
};
