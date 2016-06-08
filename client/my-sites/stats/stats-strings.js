var i18n = require( 'i18n-calypso' );

module.exports = function() {
	var statsStrings = {};

	statsStrings.posts = {
		title: i18n.translate( 'Posts & Pages', { context: 'Stats: title of module' } ),
		item: i18n.translate( 'Title', { context: 'Stats: module row header for post title.' } ),
		value: i18n.translate( 'Views', { context: 'Stats: module row header for number of post views.' } ),
		empty: i18n.translate( 'No posts or pages viewed', { context: 'Stats: Info box label when the Posts & Pages module is empty' } )
	};

	statsStrings.referrers = {
		title: i18n.translate( 'Referrers', { context: 'Stats: title of module' } ),
		item: i18n.translate( 'Referrer', { context: 'Stats: module row header for post referrer.' } ),
		value: i18n.translate( 'Views', { context: 'Stats: module row header for number of post views by referrer.' } ),
		empty: i18n.translate( 'No referrers recorded', { context: 'Stats: Info box label when the Referrers module is empty' } )
	};

	statsStrings.clicks = {
		title: i18n.translate( 'Clicks', { context: 'Stats: title of module' } ),
		item: i18n.translate( 'Link', { context: 'Stats: module row header for links in posts.' } ),
		value: i18n.translate( 'Clicks', { context: 'Stats: module row header for number of clicks on a given link in a post.' } ),
		empty: i18n.translate( 'No clicks recorded', { context: 'Stats: Info box label when the Clicks module is empty' } )
	};

	statsStrings.search = {
		title: i18n.translate( 'Search Terms', { context: 'Stats: title of module' } ),
		item: i18n.translate( 'Search Term', { context: 'Stats: module row header for search in search terms.' } ),
		value: i18n.translate( 'Views', { context: 'Stats: module row header for views of a given search in search terms.' } ),
		empty: i18n.translate( 'No search terms recorded', { context: 'Stats: Info box label when the Search Terms module is empty' } )
	};

	statsStrings.authors = {
		title: i18n.translate( 'Authors', { context: 'Stats: title of module' } ),
		item: i18n.translate( 'Author', { context: 'Stats: module row header for authors.' } ),
		value: i18n.translate( 'Views', { context: 'Stats: module row header for number of views per author.' } ),
		empty: i18n.translate( 'No posts or pages viewed', { context: 'Stats: Info box label when the Authors module is empty' } )
	};

	statsStrings.videoplays = {
		title: i18n.translate( 'Videos', { context: 'Stats: title of module' } ),
		item: i18n.translate( 'Video', { context: 'Stats: module row header for videos.' } ),
		value: i18n.translate( 'Plays', { context: 'Stats: module row header for number of plays per video.' } ),
		empty: i18n.translate( 'No videos played', { context: 'Stats: Info box label when the Videos module is empty' } )
	};

	statsStrings.tags = {
		title: i18n.translate( 'Tags & Categories', { context: 'Stats: title of module' } ),
		item: i18n.translate( 'Topic', { context: 'Stats: module row header for tags and categories.' } ),
		value: i18n.translate( 'Views', { context: 'Stats: module row header for number of views per tag or category.' } ),
		empty: i18n.translate( 'No tagged posts or pages viewed', { context: 'Stats: Info box label when the Tags module is empty' } )
	};

	statsStrings.publicize = {
		title: i18n.translate( 'Publicize', { context: 'Stats: title of module' } ),
		item: i18n.translate( 'Service', { context: 'Stats: module row header for publicize service.' } ),
		value: i18n.translate( 'Followers', { context: 'Stats: module row header for number of followers on the service.' } ),
		empty: i18n.translate( 'No publicize followers recorded', { context: 'Stats: Info box label when the publicize module is empty' } )
	};
	
	return statsStrings;
};