import { translate } from 'i18n-calypso';

export default function () {
	const statsStrings = {};

	statsStrings.posts = {
		title: translate( 'Posts & pages', { context: 'Stats: title of module' } ),
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
		title: translate( 'Search terms', { context: 'Stats: title of module' } ),
		item: translate( 'Search term', {
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
		value: translate( 'Views', {
			context: 'Stats: module row header for number of views per video.',
		} ),
		empty: translate( 'No videos viewed', {
			context: 'Stats: Info box label when the Videos module is empty',
		} ),
	};

	statsStrings.filedownloads = {
		title: translate( 'File downloads', { context: 'Stats: title of module' } ),
		item: translate( 'Files', { context: 'Stats: module row header for file downloads.' } ),
		value: translate( 'downloads', {
			context: 'Stats: module row header for number of downloads per file.',
		} ),
		empty: translate( 'No files downloaded', {
			context: 'Stats: Info box label when the file downloads module is empty',
		} ),
	};

	statsStrings.tags = {
		title: translate( 'Tags & categories', { context: 'Stats: title of module' } ),
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

	statsStrings.emailsOpenStats = {
		title: translate( 'Email opens', { context: 'Stats: title of module' } ),
		item: translate( 'Title', { context: 'Stats: module row header for post title.' } ),
		value: translate( 'Opens', { context: 'Stats: module row header for number of email opens.' } ),
		empty: translate( 'No email opens', {
			context: 'Stats: Info box label when the Email Open module is empty',
		} ),
	};

	statsStrings.emailsClickStats = {
		title: translate( 'Email clicks', { context: 'Stats: title of module' } ),
		item: translate( 'Title', { context: 'Stats: module row header for post title.' } ),
		value: translate( 'Clicks', {
			context: 'Stats: module row header for number of email clicks.',
		} ),
		empty: translate( 'No email clicks', {
			context: 'Stats: Info box label when the Email Click module is empty',
		} ),
	};

	statsStrings.devices = {
		title: translate( 'Devices', { context: 'Stats: title of module' } ),
		item: translate( 'Device', { context: 'Stats: module row header for views by country.' } ),
		value: translate( 'Views', {
			context: 'Stats: module row header for number of views from a country.',
		} ),
		empty: translate( 'No devices recorded', {
			context: 'Stats: Info box label when the Devices module is empty',
		} ),
	};

	statsStrings.clients = {
		title: translate( 'Clients', { context: 'Stats: title of module' } ),
		item: translate( 'Client', { context: 'Stats: module row header for views by country.' } ),
		value: translate( 'Views', {
			context: 'Stats: module row header for number of views from a country.',
		} ),
		empty: translate( 'No clients recorded', {
			context: 'Stats: Info box label when the Email clients module is empty',
		} ),
	};

	statsStrings.links = {
		title: translate( 'Links', { context: 'Stats: title of module' } ),
		item: translate( 'Link', { context: 'Stats: module row header for links in posts.' } ),
		value: translate( 'Clicks', {
			context: 'Stats: module row header for number of clicks on a given link in a post.',
		} ),
		empty: translate( 'No links recorded', {
			context: 'Stats: Info box label when the Links module is empty',
		} ),
	};

	return statsStrings;
}
