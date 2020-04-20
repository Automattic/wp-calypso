/**
 * External dependencies
 */

import { translate } from 'i18n-calypso';

export default function () {
	const statsStrings = {};

	statsStrings.posts = {
		title: translate( 'Posts & Pages', { context: 'Stats: title of module' } ),
		item: translate( 'Title', { context: 'Stats: module row header for post title.' } ),
		value: translate( 'Views', { context: 'Stats: module row header for number of post views.' } ),
		empty: translate( 'No posts or pages viewed', {
			context: 'Stats: Info box label when the Posts & Pages module is empty',
		} ),
	};

	statsStrings.referrers = {
		title: translate( 'Referrers', { context: 'Stats: title of module' } ),
		item: translate( 'Referrer', { context: 'Stats: module row header for post referrer.' } ),
		value: translate( 'Views', {
			context: 'Stats: module row header for number of post views by referrer.',
		} ),
		empty: translate( 'No referrers recorded', {
			context: 'Stats: Info box label when the Referrers module is empty',
		} ),
	};

	statsStrings.clicks = {
		title: translate( 'Clicks', { context: 'Stats: title of module' } ),
		item: translate( 'Link', { context: 'Stats: module row header for links in posts.' } ),
		value: translate( 'Clicks', {
			context: 'Stats: module row header for number of clicks on a given link in a post.',
		} ),
		empty: translate( 'No clicks recorded', {
			context: 'Stats: Info box label when the Clicks module is empty',
		} ),
	};

	statsStrings.countries = {
		title: translate( 'Countries', { context: 'Stats: title of module' } ),
		item: translate( 'Country', { context: 'Stats: module row header for views by country.' } ),
		value: translate( 'Views', {
			context: 'Stats: module row header for number of views from a country.',
		} ),
		empty: translate( 'No countries recorded', {
			context: 'Stats: Info box label when the Countries module is empty',
		} ),
	};

	statsStrings.search = {
		title: translate( 'Search Terms', { context: 'Stats: title of module' } ),
		item: translate( 'Search Term', {
			context: 'Stats: module row header for search in search terms.',
		} ),
		value: translate( 'Views', {
			context: 'Stats: module row header for views of a given search in search terms.',
		} ),
		empty: translate( 'No search terms recorded', {
			context: 'Stats: Info box label when the Search Terms module is empty',
		} ),
	};

	statsStrings.authors = {
		title: translate( 'Authors', { context: 'Stats: title of module' } ),
		item: translate( 'Author', { context: 'Stats: module row header for authors.' } ),
		value: translate( 'Views', {
			context: 'Stats: module row header for number of views per author.',
		} ),
		empty: translate( 'No posts or pages viewed', {
			context: 'Stats: Info box label when the Authors module is empty',
		} ),
	};

	statsStrings.videoplays = {
		title: translate( 'Videos', { context: 'Stats: title of module' } ),
		item: translate( 'Video', { context: 'Stats: module row header for videos.' } ),
		value: translate( 'Plays', {
			context: 'Stats: module row header for number of plays per video.',
		} ),
		empty: translate( 'No videos played', {
			context: 'Stats: Info box label when the Videos module is empty',
		} ),
	};

	statsStrings.filedownloads = {
		title: translate( 'File Downloads', { context: 'Stats: title of module' } ),
		item: translate( 'Files', { context: 'Stats: module row header for file downloads.' } ),
		value: translate( 'Downloads', {
			context: 'Stats: module row header for number of downloads per file.',
		} ),
		empty: translate( 'No files downloaded', {
			context: 'Stats: Info box label when the file downloads module is empty',
		} ),
	};

	statsStrings.tags = {
		title: translate( 'Tags & Categories', { context: 'Stats: title of module' } ),
		item: translate( 'Topic', { context: 'Stats: module row header for tags and categories.' } ),
		value: translate( 'Views', {
			context: 'Stats: module row header for number of views per tag or category.',
		} ),
		empty: translate( 'No tagged posts or pages viewed', {
			context: 'Stats: Info box label when the Tags module is empty',
		} ),
	};

	statsStrings.publicize = {
		title: translate( 'Publicize', { context: 'Stats: title of module' } ),
		item: translate( 'Service', { context: 'Stats: module row header for publicize service.' } ),
		value: translate( 'Followers', {
			context: 'Stats: module row header for number of followers on the service.',
		} ),
		empty: translate( 'No publicize followers recorded', {
			context: 'Stats: Info box label when the publicize module is empty',
		} ),
	};

	return statsStrings;
}
