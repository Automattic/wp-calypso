/** @format */

/**
 * External dependencies
 */

import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Emitter from 'lib/mixins/emitter';

function KeyBindings() {
	i18n.on( 'change', this.emitLanguageChange.bind( this ) );
}

// Add EventEmitter methods to prototype to notify subscribers of a language change
Emitter( KeyBindings.prototype );

// emits a 'languageChange' event to subscribers that need to run get() to get key-bindings
// with a newly translated description.
KeyBindings.prototype.emitLanguageChange = function() {
	this.emit( 'language-change', this.get() );
};

KeyBindings.prototype.get = function() {
	return {
		listNavigation: [
			{
				eventName: 'move-selection-down',
				keys: [ 'j' ],
				description: {
					keys: [ 'j' ],
					text: i18n.translate( 'Move selection down' ),
				},
			},
			{
				eventName: 'move-selection-up',
				keys: [ 'k' ],
				description: {
					keys: [ 'k' ],
					text: i18n.translate( 'Move selection up' ),
				},
			},
			{
				eventName: 'open-selection',
				keys: [ 'enter' ],
				description: {
					keys: [ 'enter' ],
					text: i18n.translate( 'Open selection' ),
				},
			},
			{
				eventName: 'go-to-top',
				keys: [ '.' ],
				description: {
					keys: [ '.' ],
					text: i18n.translate( 'Go to top' ),
				},
			},
		],

		siteNavigation: [
			{
				eventName: 'open-keyboard-shortcuts-menu',
				keys: [ [ 'shift', '/' ], [ 'shift', ',' ] ],
				// On Win/Webkit `?` is incorrectly identified as upside-down
				// question mark. https://bugs.webkit.org/show_bug.cgi?id=19906
				checkKeys: [ '?', '\u00BF', '\u00BC' ],
				description: {
					keys: [ '?' ],
					text: i18n.translate( 'This menu' ),
				},
			},
			{
				eventName: 'go-to-reader',
				keys: [ 'g', 'r' ],
				type: 'sequence',
				description: {
					keys: [ 'g', 'r' ],
					text: i18n.translate( 'Go to Reader' ),
				},
			},
			{
				eventName: 'go-to-my-likes',
				keys: [ 'g', 'l' ],
				type: 'sequence',
				description: {
					keys: [ 'g', 'l' ],
					text: i18n.translate( 'Go to My Likes' ),
				},
			},
			{
				eventName: 'go-to-stats',
				keys: [ 'g', 's' ],
				type: 'sequence',
				description: {
					keys: [ 'g', 's' ],
					text: i18n.translate( 'Go to Stats' ),
				},
			},
			{
				eventName: 'go-to-blog-posts',
				keys: [ 'g', 'b' ],
				type: 'sequence',
				description: {
					keys: [ 'g', 'b' ],
					text: i18n.translate( 'Go to Blog Posts' ),
				},
			},
			{
				eventName: 'go-to-pages',
				keys: [ 'g', 'p' ],
				type: 'sequence',
				description: {
					keys: [ 'g', 'p' ],
					text: i18n.translate( 'Go to Pages' ),
				},
			},
			{
				eventName: 'open-notifications',
				keys: [ 'n' ],
				description: {
					keys: [ 'n' ],
					text: i18n.translate( 'Open Notifications' ),
				},
			},
			{
				eventName: 'open-support-user',
				keys: [ 's', 'u' ],
				type: 'sequence',
				description: {
					keys: [],
					text: '',
				},
			},
		],

		reader: [
			{
				eventName: 'like-selection',
				keys: [ 'l' ],
				description: {
					keys: [ 'l' ],
					text: i18n.translate( 'Like post' ),
				},
			},
			{
				eventName: 'close-full-post',
				keys: [ 'esc' ],
				description: {
					keys: [ 'esc' ],
					text: i18n.translate( 'Close full post' ),
				},
			},
		],

		blogPostsAndPages: [
			{
				eventName: 'edit-selection',
				keys: [ 'e' ],
				description: {
					keys: [ 'e' ],
					text: i18n.translate( 'Edit selection' ),
				},
			},
			{
				eventName: 'open-stats-page',
				keys: [ 's' ],
				description: {
					keys: [ 's' ],
					text: i18n.translate( 'Open stats page' ),
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
					text: i18n.translate( 'Go to DevDocs' ),
				},
			},
		],
	};
};

export default new KeyBindings();
