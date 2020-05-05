const stubs = {
	mediaAdd: () => {},
	mediaAddExternal: () => {},
	mediaAddUrls: () => {},
	mediaDelete: () => {},
	mediaGet: () => {},
	mediaList: () => {},
	mediaListExternal: () => {},
	mediaUpdate: () => {},
};

const wp = {
	site: ( siteId ) => ( {
		addMediaFiles: stubs.mediaAdd.bind( siteId ),
		addMediaUrls: stubs.mediaAddUrls.bind( siteId ),
		mediaList: stubs.mediaList.bind( siteId ),
		media: ( mediaId ) => ( {
			get: stubs.mediaGet.bind( [ siteId, mediaId ].join() ),
			update: stubs.mediaUpdate.bind( [ siteId, mediaId ].join() ),
			edit: stubs.mediaUpdate.bind( [ siteId, mediaId ].join() ),
			delete: stubs.mediaDelete.bind( [ siteId, mediaId ].join() ),
		} ),
	} ),
	undocumented: ( siteId ) => ( {
		externalMediaList: stubs.mediaListExternal.bind( siteId ),
		site: () => ( {
			uploadExternalMedia: stubs.mediaAddExternal,
		} ),
	} ),
	stubs,
};

export default wp;
