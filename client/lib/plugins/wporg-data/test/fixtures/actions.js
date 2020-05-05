const dummyPluginList = [
	{
		name: 'Jetpack',
		slug: 'jetpack',
		version: '1.0',
		author: "<a href='http://jetpack.me'>Automattic</a>",
		author_profile: '//profiles.wordpress.org/automattic',
		contributors: { Abiral: '' },
		rating: 0,
		num_ratings: '0',
		ratings: {
			1: 0,
			2: 0,
			3: 0,
			4: 0,
			5: 0,
		},
		homepage: 'http://jetpack.me/',
		short_description: 'Your WordPress, Simplified.',
		banners: [],
		icons: { default: 'image.png' },
	},
];

export default {
	// Fetch Data
	fetchedNewPluginsList: {
		error: null,
		page: 1,
		category: 'new',
		type: 'RECEIVE_WPORG_PLUGINS_LIST',
		data: dummyPluginList,
	},

	fetchedNewPluginsListSecondPage: {
		error: null,
		page: 2,
		category: 'new',
		type: 'RECEIVE_WPORG_PLUGINS_LIST',
		data: dummyPluginList,
	},

	fetchedSearchPluginsList: {
		error: null,
		page: 1,
		category: 'search',
		searchTerm: 'test',
		type: 'RECEIVE_WPORG_PLUGINS_LIST',
		data: dummyPluginList,
	},

	fetchedSearchPluginsListSecondPage: {
		error: null,
		page: 2,
		category: 'search',
		searchTerm: 'test',
		type: 'RECEIVE_WPORG_PLUGINS_LIST',
		data: dummyPluginList,
	},

	fetchedPopularPluginsList: {
		error: null,
		category: 'popular',
		type: 'RECEIVE_WPORG_PLUGINS_LIST',
		data: dummyPluginList,
	},

	fetchingPopularPluginsList: {
		error: null,
		category: 'popular',
		type: 'FETCH_WPORG_PLUGINS_LIST',
		action: 'FETCH_WPORG_PLUGINS_LIST',
	},

	fetchingSearchPluginsList: {
		error: null,
		page: 1,
		category: 'search',
		searchTerm: 'test',
		type: 'FETCH_WPORG_PLUGINS_LIST',
		action: 'FETCH_WPORG_PLUGINS_LIST',
	},
};
