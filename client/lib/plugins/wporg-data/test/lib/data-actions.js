var dummyPluginList = [
	{
		name: 'Jetpack',
		slug: 'jetpack',
		version: '1.0',
		author: '<a href=\'http://jetpack.me\'>Automattic</a>',
		author_profile: '//profiles.wordpress.org/automattic',
		contributors: { Abiral: '' },
		rating: 0,
		num_ratings: '0',
		ratings: {
			1: 0,
			2: 0,
			3: 0,
			4: 0,
			5: 0
		},
		homepage: 'http://jetpack.me/',
		short_description: 'Your WordPress, Simplified.',
		banners: [],
		icons: { default: 'image.png' }
	}
];

module.exports = {
	// Fetch Data
	fetchedPlugin: {
		data: {
			author: 'Automattic',
			author_url: 'http://automattic.com/wordpress-plugins/',
			banners: undefined,
			description: 'Akismet checks your comments against the Akismet Web service to see if they look like spam or not.',
			detailsFetched: 1431631567269,
			icon: '//ps.w.org/akismet/assets/icon-256x256.png?rev=969272',
			last_updated: '2015-04-28 2:50pm GMT',
			name: 'Akismet',
			num_ratings: '216',
			rating: 92,
			ratings: undefined,
			section: {
				changelog: 'stuff',
				description: '<p>Akismet checks your comments against the Akismet Web service to see if they look like spam or not and lets you review the spam it catches under your blog\'s \'Comments\' admin screen.</p>↵↵<p>Major features in Akismet include:</p>↵↵<ul>↵<li>Automatically checks all comments and filters out the ones that look like spam.</li>↵<li>Each comment has a status history, so you can easily see which comments were caught or cleared by Akismet and which were spammed or unspammed by a moderator.</li>↵<li>URLs are shown in the comment body to reveal hidden or misleading links.</li>↵<li>Moderators can see the number of approved comments for each user.</li>↵<li>A discard feature that outright blocks the worst spam, saving you disk space and speeding up your site.</li>↵</ul>↵↵<p>PS: You\'ll need an <a href=\'http://akismet.com/get/\'>Akismet.com API key</a> to use it.  Keys are free for personal blogs; paid subscriptions are available for businesses and commercial sites.</p>',
				installation: '<p>Upload the Akismet plugin to your blog, Activate it, then enter your <a href=\'http://akismet.com/get/\'>Akismet.com API key</a>.</p>↵↵<p>1, 2, 3: You\'re done!</p>'
			},
			slug: 'akismet',
			version: '3.1.1'
		},
		error: null,
		pluginSlug: 'akismet',
		type: 'RECEIVE_WPORG_PLUGIN_DATA',
	},

	fetchedNoPlugin: {
		data: null,
		error: { message: 'Unrecognized response format' },
		pluginSlug: 'no-kismet',
		type: 'RECEIVE_WPORG_PLUGIN_DATA',
	},

	fetchedNewPluginsList: {
		error: null,
		page: 1,
		category: 'new',
		type: 'RECEIVE_WPORG_PLUGINS_LIST',
		data: dummyPluginList
	},

	fetchedNewPluginsListSecondPage: {
		error: null,
		page: 2,
		category: 'new',
		type: 'RECEIVE_WPORG_PLUGINS_LIST',
		data: dummyPluginList
	},

	fetchedSearchPluginsList: {
		error: null,
		page: 1,
		category: 'search',
		searchTerm: 'test',
		type: 'RECEIVE_WPORG_PLUGINS_LIST',
		data: dummyPluginList
	},

	fetchedSearchPluginsListSecondPage: {
		error: null,
		page: 2,
		category: 'search',
		searchTerm: 'test',
		type: 'RECEIVE_WPORG_PLUGINS_LIST',
		data: dummyPluginList
	},

	fetchedPopularPluginsList: {
		error: null,
		category: 'popular',
		type: 'RECEIVE_WPORG_PLUGINS_LIST',
		data: dummyPluginList
	},

	fetchingPopularPluginsList: {
		error: null,
		category: 'popular',
		type: 'FETCH_WPORG_PLUGINS_LIST',
		action: 'FETCH_WPORG_PLUGINS_LIST'
	},

	fetchingSearchPluginsList: {
		error: null,
		page: 1,
		category: 'search',
		searchTerm: 'test',
		type: 'FETCH_WPORG_PLUGINS_LIST',
		action: 'FETCH_WPORG_PLUGINS_LIST'
	},

};
