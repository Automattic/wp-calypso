/**
 * Adapted from the WordPress wp TinyMCE plugin.
 * 
 *
 * @format
 * @copyright 2015 by the WordPress contributors.
 * @license See CREDITS.md.
 */

/**
 * External dependencies
 */
import tinymce from 'tinymce/tinymce';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import formatting from 'client/lib/formatting';
import { removeEmptySpacesInParagraphs } from './wpcom-utils';

/* eslint-disable */
function wpcomPlugin( editor ) {
	var DOM = tinymce.DOM,
		each = tinymce.each,
		style;

	editor.on( 'focus', function() {
		window.wpActiveEditor = editor.id;
	} );

	// Replace Read More/Next Page tags with images and apply wpautop
	editor.on( 'BeforeSetContent', function( event ) {
		var title;

		if ( event.content ) {
			if ( event.content.indexOf( '<!--more' ) !== -1 ) {
				title = translate( 'Read more…' );

				event.content = event.content.replace( /<!--more(.*?)-->/g, function( match, moretext ) {
					return (
						'<img src="' +
						tinymce.Env.transparentSrc +
						'" data-wp-more="more" data-wp-more-text="' +
						moretext +
						'" ' +
						'class="wp-more-tag mce-wp-more" title="' +
						title +
						'" data-mce-resize="false" data-mce-placeholder="1" />'
					);
				} );
			}

			if ( event.content.indexOf( '<!--nextpage-->' ) !== -1 ) {
				title = translate( 'Page break' );

				event.content = event.content.replace(
					/<!--nextpage-->/g,
					'<img src="' +
						tinymce.Env.transparentSrc +
						'" data-wp-more="nextpage" class="wp-more-tag mce-wp-nextpage" ' +
						'title="' +
						title +
						'" data-mce-resize="false" data-mce-placeholder="1" />'
				);
			}

			if ( event.load && event.format !== 'raw' ) {
				event.content = formatting.wpautop( event.content );
			}
		}
	} );

	// Replace images with tags
	editor.on( 'PostProcess', function( e ) {
		if ( e.get ) {
			e.content = e.content.replace( /<img[^>]+>/g, function( image ) {
				var match,
					moretext = '';

				if ( image.indexOf( 'data-wp-more="more"' ) !== -1 ) {
					if ( ( match = image.match( /data-wp-more-text="([^"]+)"/ ) ) ) {
						//eslint-disable-line no-cond-assign
						moretext = match[ 1 ];
					}

					image = '<!--more' + moretext + '-->';
				} else if ( image.indexOf( 'data-wp-more="nextpage"' ) !== -1 ) {
					image = '<!--nextpage-->';
				}

				return image;
			} );
		}
	} );

	// Display the tag name instead of img in element path
	editor.on( 'ResolveName', function( event ) {
		var attr;

		if (
			event.target.nodeName === 'IMG' &&
			( attr = editor.dom.getAttrib( event.target, 'data-wp-more' ) )
		) {
			event.name = attr;
		}
	} );

	// Register commands
	editor.addCommand( 'WP_More', function( tag ) {
		var parent,
			html,
			title,
			classname = 'wp-more-tag',
			dom = editor.dom,
			node = editor.selection.getNode();

		tag = tag || 'more';
		classname += ' mce-wp-' + tag;
		title = tag === 'more' ? translate( 'Read more…' ) : translate( 'Next page' );
		html =
			'<img src="' +
			tinymce.Env.transparentSrc +
			'" title="' +
			title +
			'" class="' +
			classname +
			'" ' +
			'data-wp-more="' +
			tag +
			'" data-mce-resize="false" data-mce-placeholder="1" />';

		// Most common case
		if (
			node.nodeName === 'BODY' ||
			( node.nodeName === 'P' && node.parentNode.nodeName === 'BODY' )
		) {
			editor.insertContent( html );
			return;
		}

		// Get the top level parent node
		parent = dom.getParent(
			node,
			function( found ) {
				if ( found.parentNode && found.parentNode.nodeName === 'BODY' ) {
					return true;
				}

				return false;
			},
			editor.getBody()
		);

		if ( parent ) {
			if ( parent.nodeName === 'P' ) {
				parent.appendChild( dom.create( 'p', null, html ).firstChild );
			} else {
				dom.insertAfter( dom.create( 'p', null, html ), parent );
			}

			editor.nodeChanged();
		}
	} );

	editor.addCommand( 'WP_Code', function() {
		editor.formatter.toggle( 'code' );
	} );

	editor.addCommand( 'WP_Page', function() {
		editor.execCommand( 'WP_More', 'nextpage' );
	} );

	// Register buttons
	editor.addButton( 'wp_more', {
		tooltip: translate( 'Insert Read More tag' ),
		onclick: function() {
			editor.execCommand( 'WP_More', 'more' );
		},
	} );

	editor.addButton( 'wp_page', {
		tooltip: translate( 'Page break' ),
		onclick: function() {
			editor.execCommand( 'WP_More', 'nextpage' );
		},
	} );

	editor.addButton( 'wp_help', {
		tooltip: translate( 'Keyboard Shortcuts' ),
		cmd: 'WP_Help',
	} );

	editor.addButton( 'wp_charmap', {
		icon: 'charmap',
		tooltip: translate( 'Special Characters' ),
		cmd: 'Wpcom_CharMap',
	} );

	editor.addButton( 'wp_code', {
		tooltip: translate( 'Code' ),
		cmd: 'WP_Code',
		stateSelector: 'code',
	} );

	// Insert "Read More..."
	editor.addMenuItem( 'wp_more', {
		text: translate( 'Insert Read More tag' ),
		icon: 'wp_more',
		context: 'insert',
		onclick: function() {
			editor.execCommand( 'WP_More', 'more' );
		},
	} );

	// Insert "Next Page"
	editor.addMenuItem( 'wp_page', {
		text: translate( 'Page break' ),
		icon: 'wp_page',
		context: 'insert',
		onclick: function() {
			editor.execCommand( 'WP_More', 'nextpage' );
		},
	} );

	editor.on( 'BeforeExecCommand', function( e ) {
		if (
			tinymce.Env.webkit &&
			( e.command === 'InsertUnorderedList' || e.command === 'InsertOrderedList' )
		) {
			if ( ! style ) {
				style = editor.dom.create(
					'style',
					{ type: 'text/css' },
					'#tinymce,#tinymce span,#tinymce li,#tinymce li>span,#tinymce p,#tinymce p>span{font:medium sans-serif;color:#000;line-height:normal;}'
				);
			}

			editor.getDoc().head.appendChild( style );
		}
	} );

	editor.on( 'ExecCommand', function( e ) {
		if (
			tinymce.Env.webkit &&
			style &&
			( 'InsertUnorderedList' === e.command || 'InsertOrderedList' === e.command )
		) {
			editor.dom.remove( style );
		}
	} );

	editor.on( 'init', function() {
		var env = tinymce.Env,
			bodyClass = [ 'mceContentBody' ], // back-compat for themes that use this in editor-style.css...
			doc = editor.getDoc(),
			dom = editor.dom;

		if ( tinymce.Env.iOS ) {
			dom.addClass( doc.documentElement, 'ios' );
		}

		if ( editor.getParam( 'directionality' ) === 'rtl' ) {
			bodyClass.push( 'rtl' );
			dom.setAttrib( doc.documentElement, 'dir', 'rtl' );
		}

		if ( env.ie ) {
			if ( parseInt( env.ie, 10 ) === 9 ) {
				bodyClass.push( 'ie9' );
			} else if ( parseInt( env.ie, 10 ) === 8 ) {
				bodyClass.push( 'ie8' );
			} else if ( env.ie < 8 ) {
				bodyClass.push( 'ie7' );
			}
		} else if ( env.webkit ) {
			bodyClass.push( 'webkit' );
		}

		bodyClass.push( 'wp-editor' );

		each( bodyClass, function( cls ) {
			if ( cls ) {
				dom.addClass( doc.body, cls );
			}
		} );

		// Remove invalid parent paragraphs when inserting HTML
		editor.on( 'BeforeSetContent', function( event ) {
			if ( event.content ) {
				event.content = event.content
					.replace(
						/<p>\s*<(p|div|ul|ol|dl|table|blockquote|h[1-6]|fieldset|pre)( [^>]*)?>/gi,
						'<$1$2>'
					)
					.replace(
						/<\/(p|div|ul|ol|dl|table|blockquote|h[1-6]|fieldset|pre)>\s*<\/p>/gi,
						'</$1>'
					);
			}
		} );

		if ( editor.getParam( 'wp_paste_filters', true ) ) {
			editor.on( 'PastePreProcess', function( event ) {
				// Remove trailing <br> added by WebKit browsers to the clipboard
				event.content = event.content.replace( /<br class="?Apple-interchange-newline"?>/gi, '' );

				// In WebKit this is handled by removeWebKitStyles()
				if ( ! tinymce.Env.webkit ) {
					// Remove all inline styles
					event.content = event.content.replace( /(<[^>]+) style="[^"]*"([^>]*>)/gi, '$1$2' );

					// Put back the internal styles
					event.content = event.content.replace(
						/(<[^>]+) data-mce-style=([^>]+>)/gi,
						'$1 style=$2'
					);
				}
			} );

			editor.on( 'PastePostProcess', function( event ) {
				// Remove empty paragraphs
				each( dom.select( 'p', event.node ), function( node ) {
					if ( dom.isEmpty( node ) ) {
						dom.remove( node );
					}
				} );
			} );
		}
	} );

	editor.on( 'SaveContent', function( e ) {
		// If editor is hidden, we just want the textarea's value to be saved
		if ( ! editor.inline && editor.isHidden() ) {
			e.content = e.element.value;
			return;
		}

		// Keep empty paragraphs :(
		e.content = e.content.replace( /<p>(?:<br ?\/?>|\u00a0|\uFEFF| )*<\/p>/g, '<p>&nbsp;</p>' );

		e.content = formatting.removep( e.content );
	} );

	// Remove spaces from empty paragraphs.
	editor.on( 'BeforeSetContent', function( event ) {
		if ( event.content ) {
			event.content = removeEmptySpacesInParagraphs( event.content );
		}
	} );

	editor.on( 'preInit', function() {
		// Don't replace <i> with <em> and <b> with <strong> and don't remove them when empty
		editor.schema.addValidElements(
			'@[id|accesskey|class|dir|lang|style|tabindex|title|contenteditable|draggable|dropzone|hidden|spellcheck|translate],i,b'
		);

		if ( tinymce.Env.iOS ) {
			editor.settings.height = 300;
		}

		each(
			{
				c: 'JustifyCenter',
				r: 'JustifyRight',
				l: 'JustifyLeft',
				j: 'JustifyFull',
				q: 'mceBlockQuote',
				u: 'InsertUnorderedList',
				o: 'InsertOrderedList',
				s: 'unlink',
				m: 'WP_Medialib',
				t: 'WP_More',
				d: 'Strikethrough',
				h: 'WP_Help',
				p: 'WP_Page',
				x: 'WP_Code',
			},
			function( command, key ) {
				editor.shortcuts.add( 'access+' + key, '', command );
			}
		);
	} );

	/**
	 * Experimental: create a floating toolbar.
	 * This functionality will change in the next releases. Not recommended for use by plugins.
	 */
	editor.on(
		'preinit',
		function() {
			var Factory = tinymce.ui.Factory,
				settings = editor.settings,
				activeToolbar,
				currentSelection,
				timeout,
				container = editor.getContainer(),
				wpAdminbar = document.getElementById( 'wpadminbar' ),
				mceIframe = document.getElementById( editor.id + '_ifr' ),
				mceToolbar,
				mceStatusbar,
				wpStatusbar;

			if ( container ) {
				mceToolbar = tinymce.$( '.mce-toolbar-grp', container )[ 0 ];
				mceStatusbar = tinymce.$( '.mce-statusbar', container )[ 0 ];
			}

			if ( editor.id === 'content' ) {
				wpStatusbar = document.getElementById( 'post-status-info' );
			}

			function create( buttons, bottom ) {
				var toolbar,
					toolbarItems = [],
					buttonGroup;

				each( buttons, function( item ) {
					var itemName;

					function bindSelectorChanged() {
						var selection = editor.selection;

						if ( itemName === 'bullist' ) {
							selection.selectorChanged( 'ul > li', function( state, args ) {
								var i = args.parents.length,
									nodeName;

								while ( i-- ) {
									nodeName = args.parents[ i ].nodeName;

									if ( nodeName === 'OL' || nodeName === 'UL' ) {
										break;
									}
								}

								item.active( state && nodeName === 'UL' );
							} );
						}

						if ( itemName === 'numlist' ) {
							selection.selectorChanged( 'ol > li', function( state, args ) {
								var i = args.parents.length,
									nodeName;

								while ( i-- ) {
									nodeName = args.parents[ i ].nodeName;

									if ( nodeName === 'OL' || nodeName === 'UL' ) {
										break;
									}
								}

								item.active( state && nodeName === 'OL' );
							} );
						}

						if ( item.settings.stateSelector ) {
							selection.selectorChanged(
								item.settings.stateSelector,
								function( state ) {
									item.active( state );
								},
								true
							);
						}

						if ( item.settings.disabledStateSelector ) {
							selection.selectorChanged( item.settings.disabledStateSelector, function( state ) {
								item.disabled( state );
							} );
						}
					}

					if ( item === '|' ) {
						buttonGroup = null;
					} else {
						if ( Factory.has( item ) ) {
							item = {
								type: item,
							};

							if ( settings.toolbar_items_size ) {
								item.size = settings.toolbar_items_size;
							}

							toolbarItems.push( item );

							buttonGroup = null;
						} else {
							if ( ! buttonGroup ) {
								buttonGroup = {
									type: 'buttongroup',
									items: [],
								};

								toolbarItems.push( buttonGroup );
							}

							if ( editor.buttons[ item ] ) {
								itemName = item;
								item = editor.buttons[ itemName ];

								if ( typeof item === 'function' ) {
									item = item();
								}

								item.type = item.type || 'button';

								if ( settings.toolbar_items_size ) {
									item.size = settings.toolbar_items_size;
								}

								item = Factory.create( item );

								buttonGroup.items.push( item );

								if ( editor.initialized ) {
									bindSelectorChanged();
								} else {
									editor.on( 'init', bindSelectorChanged );
								}
							}
						}
					}
				} );

				toolbar = Factory.create( {
					type: 'panel',
					layout: 'stack',
					classes: 'toolbar-grp inline-toolbar-grp',
					ariaRoot: true,
					ariaRemember: true,
					items: [
						{
							type: 'toolbar',
							layout: 'flow',
							items: toolbarItems,
						},
					],
				} );

				toolbar.bottom = bottom;

				function reposition() {
					if ( ! currentSelection ) {
						return this;
					}

					var scrollX = window.pageXOffset || document.documentElement.scrollLeft,
						scrollY = window.pageYOffset || document.documentElement.scrollTop,
						windowWidth = window.innerWidth,
						windowHeight = window.innerHeight,
						iframeRect = mceIframe
							? mceIframe.getBoundingClientRect()
							: {
									top: 0,
									right: windowWidth,
									bottom: windowHeight,
									left: 0,
									width: windowWidth,
									height: windowHeight,
								},
						toolbar = this.getEl(),
						toolbarWidth = toolbar.offsetWidth,
						toolbarHeight = toolbar.offsetHeight,
						selection = currentSelection.getBoundingClientRect(),
						selectionMiddle = ( selection.left + selection.right ) / 2,
						buffer = 5,
						margin = 8,
						spaceNeeded = toolbarHeight + margin + buffer,
						wpAdminbarBottom = wpAdminbar ? wpAdminbar.getBoundingClientRect().bottom : 0,
						mceToolbarBottom = mceToolbar ? mceToolbar.getBoundingClientRect().bottom : 0,
						mceStatusbarTop = mceStatusbar
							? windowHeight - mceStatusbar.getBoundingClientRect().top
							: 0,
						wpStatusbarTop = wpStatusbar
							? windowHeight - wpStatusbar.getBoundingClientRect().top
							: 0,
						blockedTop = Math.max( 0, wpAdminbarBottom, mceToolbarBottom, iframeRect.top ),
						blockedBottom = Math.max(
							0,
							mceStatusbarTop,
							wpStatusbarTop,
							windowHeight - iframeRect.bottom
						),
						spaceTop = selection.top + iframeRect.top - blockedTop,
						spaceBottom = windowHeight - iframeRect.top - selection.bottom - blockedBottom,
						editorHeight = windowHeight - blockedTop - blockedBottom,
						className = '',
						top,
						left;

					if ( spaceTop >= editorHeight || spaceBottom >= editorHeight ) {
						return this.hide();
					}

					if ( this.bottom ) {
						if ( spaceBottom >= spaceNeeded ) {
							className = ' mce-arrow-up';
							top = selection.bottom + iframeRect.top + scrollY;
						} else if ( spaceTop >= spaceNeeded ) {
							className = ' mce-arrow-down';
							top = selection.top + iframeRect.top + scrollY - toolbarHeight - margin;
						}
					} else {
						if ( spaceTop >= spaceNeeded ) {
							className = ' mce-arrow-down';
							top = selection.top + iframeRect.top + scrollY - toolbarHeight - margin;
						} else if (
							spaceBottom >= spaceNeeded &&
							editorHeight / 2 > selection.bottom + iframeRect.top - blockedTop
						) {
							className = ' mce-arrow-up';
							top = selection.bottom + iframeRect.top + scrollY;
						}
					}

					if ( typeof top === 'undefined' ) {
						top = scrollY + blockedTop + buffer;
					}

					left = selectionMiddle - toolbarWidth / 2 + iframeRect.left + scrollX;

					if ( selection.left < 0 || selection.right > iframeRect.width ) {
						left = iframeRect.left + scrollX + ( iframeRect.width - toolbarWidth ) / 2;
					} else if ( toolbarWidth >= windowWidth ) {
						className += ' mce-arrow-full';
						left = 0;
					} else if (
						( left < 0 && selection.left + toolbarWidth > windowWidth ) ||
						( left + toolbarWidth > windowWidth && selection.right - toolbarWidth < 0 )
					) {
						left = ( windowWidth - toolbarWidth ) / 2;
					} else if ( left < iframeRect.left + scrollX ) {
						className += ' mce-arrow-left';
						left = selection.left + iframeRect.left + scrollX;
					} else if ( left + toolbarWidth > iframeRect.width + iframeRect.left + scrollX ) {
						className += ' mce-arrow-right';
						left = selection.right - toolbarWidth + iframeRect.left + scrollX;
					}

					toolbar.className = toolbar.className.replace( / ?mce-arrow-[\w]+/g, '' ) + className;

					DOM.setStyles( toolbar, {
						left: left,
						top: top,
					} );

					return this;
				}

				toolbar.on( 'show', function() {
					this.reposition();
				} );

				toolbar.on( 'keydown', function( event ) {
					if ( event.keyCode === 27 ) {
						this.hide();
						editor.focus();
					}
				} );

				editor.on( 'remove', function() {
					toolbar.remove();
				} );

				toolbar.reposition = reposition;
				toolbar.hide().renderTo( document.body );

				return toolbar;
			}

			editor.shortcuts.add( 'alt+119', '', function() {
				var node;

				if ( activeToolbar ) {
					node = activeToolbar.find( 'toolbar' )[ 0 ];
					node && node.focus( true );
				}
			} );

			editor.on( 'nodechange', function( event ) {
				var collapsed = editor.selection.isCollapsed();

				var args = {
					element: event.element,
					parents: event.parents,
					collapsed: collapsed,
				};

				editor.fire( 'wptoolbar', args );

				currentSelection = args.selection || args.element;

				if ( activeToolbar ) {
					activeToolbar.hide();
				}

				if ( args.toolbar ) {
					activeToolbar = args.toolbar;
					activeToolbar.show();
				} else {
					activeToolbar = false;
				}
			} );

			editor.on( 'focus', function() {
				if ( activeToolbar ) {
					activeToolbar.show();
				}
			} );

			function hide( event ) {
				if ( activeToolbar ) {
					activeToolbar.hide();

					if ( event.type === 'hide' || event.type === 'blur' ) {
						activeToolbar = false;
					} else if ( event.type === 'resizewindow' || event.type === 'scrollwindow' ) {
						clearTimeout( timeout );

						timeout = setTimeout( function() {
							if ( activeToolbar && typeof activeToolbar.show === 'function' ) {
								activeToolbar.show();
							}
						}, 250 );
					}
				}
			}

			DOM.bind( window, 'resize scroll', hide );

			editor.on( 'remove', function() {
				DOM.unbind( window, 'resize scroll', hide );
			} );

			editor.on( 'blur hide', hide );

			editor.wp = editor.wp || {};
			editor.wp._createToolbar = create;
		},
		true
	);
}

export default function() {
	// Set the minimum value for the modals z-index higher than #wpadminbar (100000)
	tinymce.PluginManager.add( 'wpcom', wpcomPlugin );
}
