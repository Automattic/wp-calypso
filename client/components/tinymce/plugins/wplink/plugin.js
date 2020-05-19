/**
 * Adapted from the WordPress wplink TinyMCE plugin.
 *
 *
 * @copyright 2015 by the WordPress contributors.
 * @license See CREDITS.md.
 */

/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import tinymce from 'tinymce/tinymce';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import LinkDialog from './dialog';
import { renderWithReduxStore } from 'lib/react-helpers';

function wpLink( editor ) {
	let node, toolbar, firstLoadComplete;

	function render( visible = true ) {
		renderWithReduxStore(
			React.createElement( LinkDialog, {
				visible: visible,
				editor: editor,
				firstLoad: ! firstLoadComplete,
				onClose: () => render( false ),
			} ),
			node,
			editor.getParam( 'redux_store' )
		);
		if ( visible ) {
			firstLoadComplete = true;
		}

		if ( ! visible ) {
			editor.focus();
		}
	}

	editor.on( 'init', function () {
		node = editor.getContainer().appendChild( document.createElement( 'div' ) );
	} );

	editor.on( 'remove', function () {
		ReactDom.unmountComponentAtNode( node );
		node.parentNode.removeChild( node );
		node = null;
	} );

	editor.addCommand( 'WP_Link', function () {
		return render();
	} );

	// WP default shortcut
	editor.addShortcut( 'access+a', '', 'WP_Link' );
	// The "de-facto standard" shortcut, see #27305
	editor.addShortcut( 'meta+k', '', 'WP_Link' );

	editor.addButton( 'link', {
		icon: 'link',
		tooltip: translate( 'Insert/edit link' ),
		cmd: 'WP_Link',
		stateSelector: 'a[href]',
	} );

	editor.addButton( 'unlink', {
		icon: 'unlink',
		tooltip: 'Remove link',
		cmd: 'unlink',
	} );

	editor.addMenuItem( 'link', {
		icon: 'link',
		text: translate( 'Insert/edit link' ),
		cmd: 'WP_Link',
		stateSelector: 'a[href]',
		context: 'insert',
		prependToContext: true,
	} );

	editor.on( 'pastepreprocess', function ( event ) {
		let pastedStr = event.content;

		if ( ! editor.selection.isCollapsed() ) {
			pastedStr = pastedStr.replace( /<[^>]+>/g, '' );
			pastedStr = tinymce.trim( pastedStr );

			if ( /^(?:https?:)?\/\/\S+$/i.test( pastedStr ) ) {
				editor.execCommand( 'mceInsertLink', false, {
					href: editor.dom.decode( pastedStr ),
				} );

				event.preventDefault();
			}
		}
	} );

	/**
	 * Link Preview
	 */

	tinymce.ui.Factory.add(
		'WPLinkPreview',
		tinymce.ui.Control.extend( {
			url: '#',
			renderHtml: function () {
				return (
					'<div id="' +
					this._id +
					'" class="wp-link-preview">' +
					'<a href="' +
					this.url +
					'" target="_blank" rel="noopener noreferrer" tabindex="-1">' +
					this.url +
					'</a>' +
					'</div>'
				);
			},
			setURL: function ( url ) {
				let index, lastIndex;

				if ( this.url !== url ) {
					this.url = url;

					url = window.decodeURIComponent( url );

					url = url.replace( /^(?:https?:)?\/\/(?:www\.)?/, '' );

					if ( ( index = url.indexOf( '?' ) ) !== -1 ) {
						url = url.slice( 0, index );
					}

					if ( ( index = url.indexOf( '#' ) ) !== -1 ) {
						url = url.slice( 0, index );
					}

					url = url.replace( /(?:index)?\.html$/, '' );

					if ( url.charAt( url.length - 1 ) === '/' ) {
						url = url.slice( 0, -1 );
					}

					// If the URL is longer that 40 chars, concatenate the beginning (after the domain) and ending with ...
					if (
						url.length > 40 &&
						( index = url.indexOf( '/' ) ) !== -1 &&
						( lastIndex = url.lastIndexOf( '/' ) ) !== -1 &&
						lastIndex !== index
					) {
						// If the beginning + ending are shorter that 40 chars, show more of the ending
						if ( index + url.length - lastIndex < 40 ) {
							lastIndex = -( 40 - ( index + 1 ) );
						}

						url = url.slice( 0, index + 1 ) + '\u2026' + url.slice( lastIndex );
					}

					tinymce.$( this.getEl().firstChild ).attr( 'href', this.url ).text( url );
				}
			},
		} )
	);

	editor.addButton( 'wp_link_preview', {
		type: 'WPLinkPreview',
		onPostRender: function () {
			const self = this;

			editor.on( 'wptoolbar', function ( event ) {
				const anchor = editor.dom.getParent( event.element, 'a' );
				let $anchor;
				let href;

				if ( anchor ) {
					$anchor = editor.$( anchor );
					href = $anchor.attr( 'href' );

					if ( href && ! $anchor.find( 'img' ).length ) {
						self.setURL( href );
						event.element = anchor;
						event.toolbar = toolbar;
					}
				}
			} );
		},
	} );

	editor.addButton( 'wp_link_edit', {
		tooltip: 'Edit ', // trailing space is needed, used for context
		icon: 'dashicon dashicons-edit',
		cmd: 'WP_Link',
	} );

	editor.addButton( 'wp_link_remove', {
		tooltip: 'Remove',
		icon: 'dashicon dashicons-no',
		cmd: 'unlink',
	} );

	editor.on( 'preinit', function () {
		if ( editor.wp && editor.wp._createToolbar ) {
			toolbar = editor.wp._createToolbar(
				[ 'wp_link_preview', 'wp_link_edit', 'wp_link_remove' ],
				true
			);
		}
	} );
}

export default function () {
	tinymce.PluginManager.add( 'wplink', wpLink );
}
