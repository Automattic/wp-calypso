// Returns a function that returns a translated text when applied
const translate = ( text ) => ( tr ) => tr( text );

const KEY_BINDINGS = {
	listNavigation: [
		{
			eventName: 'move-selection-down',
			keys: [ 'j' ],
			description: {
				keys: [ 'j' ],
				text: translate( 'Move selection down' ),
			},
		},
		{
			eventName: 'move-selection-up',
			keys: [ 'k' ],
			description: {
				keys: [ 'k' ],
				text: translate( 'Move selection up' ),
			},
		},
		{
			eventName: 'open-selection',
			keys: [ [ 'enter' ] ],
			description: {
				keys: [ [ 'enter' ] ],
				text: translate( 'Open selection' ),
			},
		},
		{
			eventName: 'open-selection-new-tab',
			keys: [ [ 'v' ] ],
			description: {
				keys: [ [ 'v' ] ],
				text: translate( 'Open selection in a new tab' ),
			},
		},
		{
			eventName: 'go-to-top',
			keys: [ '.' ],
			description: {
				keys: [ '.' ],
				text: translate( 'Go to top' ),
			},
		},
	],

	siteNavigation: [
		{
			eventName: 'open-keyboard-shortcuts-menu',
			keys: [
				[ 'shift', '/' ],
				[ 'shift', ',' ],
			],
			// On Win/Webkit `?` is incorrectly identified as upside-down
			// question mark. https://bugs.webkit.org/show_bug.cgi?id=19906
			checkKeys: [ '?', '\u00BF', '\u00BC' ],
			description: {
				keys: [ '?' ],
				text: translate( 'This menu' ),
			},
		},
		{
			eventName: 'open-help',
			keys: [ 'g', 'h' ],
			type: 'sequence',
			description: {
				keys: [ 'g', 'h' ],
				text: translate( 'Open Help' ),
			},
		},
		{
			eventName: 'go-to-reader',
			keys: [ 'g', 'r' ],
			type: 'sequence',
			description: {
				keys: [ 'g', 'r' ],
				text: translate( 'Go to Reader' ),
			},
		},
		{
			eventName: 'go-to-my-likes',
			keys: [ 'g', 'l' ],
			type: 'sequence',
			description: {
				keys: [ 'g', 'l' ],
				text: translate( 'Go to My Likes' ),
			},
		},
		{
			eventName: 'open-site-selector',
			keys: [ 'g', 'w' ],
			type: 'sequence',
			description: {
				keys: [ 'g', 'w' ],
				text: translate( 'Switch Site' ),
			},
		},
		{
			eventName: 'go-to-stats',
			keys: [ 'g', 's' ],
			type: 'sequence',
			description: {
				keys: [ 'g', 's' ],
				text: translate( 'Go to Stats' ),
			},
		},
		{
			eventName: 'go-to-blog-posts',
			keys: [ 'g', 'b' ],
			type: 'sequence',
			description: {
				keys: [ 'g', 'b' ],
				text: translate( 'Go to Blog Posts' ),
			},
		},
		{
			eventName: 'go-to-pages',
			keys: [ 'g', 'p' ],
			type: 'sequence',
			description: {
				keys: [ 'g', 'p' ],
				text: translate( 'Go to Pages' ),
			},
		},
		{
			eventName: 'open-notifications',
			keys: [ 'n' ],
			description: {
				keys: [ 'n' ],
				text: translate( 'Open Notifications' ),
			},
		},
		{
			eventName: 'exit-support-user',
			keys: [ 's', 'u' ],
			type: 'sequence',
		},
	],

	reader: [
		{
			eventName: 'like-selection',
			keys: [ 'l' ],
			description: {
				keys: [ 'l' ],
				text: translate( 'Like post' ),
			},
		},
		{
			eventName: 'close-full-post',
			keys: [ 'esc' ],
			description: {
				keys: [ 'esc' ],
				text: translate( 'Close full post' ),
			},
		},
	],

	blogPostsAndPages: [
		{
			eventName: 'edit-selection',
			keys: [ 'e' ],
			description: {
				keys: [ 'e' ],
				text: translate( 'Edit selection' ),
			},
		},
		{
			eventName: 'open-stats-page',
			keys: [ 's' ],
			description: {
				keys: [ 's' ],
				text: translate( 'Open stats page' ),
			},
		},
	],

	developer: [
		{
			eventName: 'go-to-dev-docs',
			keys: [ 'g', 'd' ],
			type: 'sequence',
			description: {
				keys: [ 'g', 'd' ],
				text: translate( 'Go to DevDocs' ),
			},
		},
	],
};

export default KEY_BINDINGS;
