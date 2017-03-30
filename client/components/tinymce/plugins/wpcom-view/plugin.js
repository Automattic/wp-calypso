/**
 * Adapted from the WordPress wp-view TinyMCE plugin.
 *
 * @copyright 2015 by the WordPress contributors.
 * @license See CREDITS.md.
*/

/* eslint-disable no-cond-assign */

/**
 * External dependencies
 */
var tinymce = require( 'tinymce/tinymce' ),
	debounce = require( 'lodash/debounce' ),
	ReactDom = require( 'react-dom' ),
	React = require( 'react'),
	i18n = require( 'i18n-calypso' );

/**
 * Internal dependencies
 */
var views = require( './views' ),
	sites = require( 'lib/sites-list' )();

import { renderWithReduxStore } from 'lib/react-helpers';

/**
 * WordPress View plugin.
 */
function wpview( editor ) {
	var $ = editor.$,
		selected,
		Env = tinymce.Env,
		VK = tinymce.util.VK,
		TreeWalker = tinymce.dom.TreeWalker,
		toRemove = false,
		firstFocus = true,
		isios = /iPad|iPod|iPhone/.test( navigator.userAgent ),
		cursorInterval,
		lastKeyDownNode,
		setViewCursorTries,
		focus,
		execCommandView,
		execCommandBefore,
		toolbar;

	/**
	 * Replaces all marker nodes tied to this view instance.
	 */
	function replaceMarkers() {
		var markers = $( '.wpview-marker' );

		if ( ! markers.length ) {
			return false;
		}

		markers.each( function( index, node ) {
			var text = editor.dom.getAttrib( node, 'data-wpview-text' ),
				type = editor.dom.getAttrib( node, 'data-wpview-type' );
			editor.dom.replace(
				editor.dom.createFragment(
					'<div class="wpview-wrap" data-wpview-text="' + text + '" data-wpview-type="' + type + '">' +
						'<p class="wpview-selection-before">\u00a0</p>' +
						'<div class="wpview-body" contenteditable="false"></div>' +
						'<p class="wpview-selection-after">\u00a0</p>' +
					'</div>'
				),
				node
			);
		} );

		return true;
	}

	function triggerNodeChanged() {
		editor.nodeChanged();
	}

	function renderViews() {
		if ( ! replaceMarkers() ) {
			return;
		}

		$( '.wpview-wrap' ).each( function( index, view ) {
			var $view = $( view ),
				type;

			if ( undefined !== $view.attr( 'data-wpview-rendered' ) ) {
				return;
			}

			type = $view.attr( 'data-wpview-type' );

			renderWithReduxStore(
				React.createElement( views.components[ type ], {
					content: getText( view ),
					siteId: sites.getSelectedSite() ? sites.getSelectedSite().ID : null,
					onResize: debounce( triggerNodeChanged, 500 )
				} ),
				$view.find( '.wpview-body' )[0],
				editor.getParam( 'redux_store' )
			);

			$view.attr( 'data-wpview-rendered', '' );
		} );
	}

	function getText( node ) {
		return decodeURIComponent( $( node ).attr( 'data-wpview-text' ) || '' );
	}

	function getView( node ) {
		return getParent( node, 'wpview-wrap' );
	}

	/**
	 * Returns the node or a parent of the node that has the passed className.
	 * Doing this directly is about 40% faster
	 */
	function getParent( node, className ) {
		while ( node && node.parentNode ) {
			if ( node.className && ( ' ' + node.className + ' ' ).indexOf( ' ' + className + ' ' ) !== -1 ) {
				return node;
			}

			node = node.parentNode;
		}

		return false;
	}

	function _stop( event ) {
		event.stopPropagation();
	}

	function setViewCursor( before, view ) {
		var location = before ? 'before' : 'after',
			offset = before ? 0 : 1;
		deselect();
		editor.selection.setCursorLocation( editor.dom.select( '.wpview-selection-' + location, view )[ 0 ], offset );
		editor.nodeChanged();
	}

	function handleEnter( view, before, key ) {
		var dom = editor.dom,
			padNode = dom.create( 'p' );

		if ( ! ( Env.ie && Env.ie < 11 ) ) {
			padNode.innerHTML = '<br data-mce-bogus="1">';
		}

		if ( before ) {
			view.parentNode.insertBefore( padNode, view );
		} else {
			dom.insertAfter( padNode, view );
		}

		deselect();

		if ( before && key === VK.ENTER ) {
			setViewCursor( before, view );
		} else {
			editor.selection.setCursorLocation( padNode, 0 );
		}

		editor.nodeChanged();
	}

	function removeView( view ) {
		editor.undoManager.transact( function() {
			handleEnter( view );
			ReactDom.unmountComponentAtNode( $( view ).find( '.wpview-body' )[ 0 ] );
			editor.dom.remove( view );
			editor.focus();
		} );
	}

	function select( viewNode ) {
		var clipboard,
			dom = editor.dom;

		if ( ! viewNode ) {
			return;
		}

		if ( viewNode !== selected ) {
			// Make sure that the editor is focused.
			// It is possible that the editor is not focused when the mouse event fires
			// without focus, the selection will not work properly.
			if ( ! focus ) {
				editor.getBody().focus();
			}

			deselect();
			selected = viewNode;
			dom.setAttrib( viewNode, 'data-mce-selected', 1 );

			clipboard = dom.create( 'div', {
				'class': 'wpview-clipboard',
				contenteditable: 'true'
			}, getText( viewNode ) );

			editor.dom.select( '.wpview-body', viewNode )[ 0 ].appendChild( clipboard );

			// Both of the following are necessary to prevent manipulating the selection/focus
			dom.bind( clipboard, 'beforedeactivate focusin focusout', _stop );
			dom.bind( selected, 'beforedeactivate focusin focusout', _stop );

			// select the hidden div
			if ( isios ) {
				editor.selection.select( clipboard );
			} else {
				editor.selection.select( clipboard, true );
			}
		}

		editor.nodeChanged();
		editor.fire( 'wpview-selected', viewNode );
	}

	/**
	 * Deselect a selected view and remove clipboard
	 */
	function deselect() {
		var clipboard,
			dom = editor.dom;

		if ( selected ) {
			clipboard = editor.dom.select( '.wpview-clipboard', selected )[ 0 ];
			dom.unbind( clipboard );
			dom.remove( clipboard );

			dom.unbind( selected, 'beforedeactivate focusin focusout click mouseup', _stop );
			dom.setAttrib( selected, 'data-mce-selected', null );
		}

		selected = null;
	}

	function resetViewsCallback( match, viewText ) {
		return '<p>' + window.decodeURIComponent( viewText ) + '</p>';
	}

	// Replace the view tags with the view string
	function resetViews( content ) {
		return content.replace( /<div[^>]+data-wpview-text="([^"]+)"[^>]*>(?:[\s\S]+?wpview-selection-after[^>]+>[^<>]*<\/p>\s*|\.)<\/div>/g, resetViewsCallback )
			.replace( /<p [^>]*?data-wpview-text="([^"]+)"[^>]*>[\s\S]*?<\/p>/g, resetViewsCallback );
	}

	function setMarkers() {
		var content, processedContent;

		if ( editor.isHidden() ) {
			return;
		}

		content = editor.getContent( { format: 'raw' } );
		processedContent = views.setMarkers( content );

		if ( content !== processedContent ) {
			editor.setContent( processedContent, {
				format: 'raw',
				isSettingMarkers: true
			} );
		}
	}

	// Prevent adding undo levels on changes inside a view wrapper
	editor.on( 'BeforeAddUndo', function( event ) {
		if ( event.level.content ) {
			event.level.content = resetViews( event.level.content );
		}
	});

	// When the editor's content changes, scan the new content for
	// matching view patterns, and transform the matches into
	// view wrappers.
	editor.on( 'BeforeSetContent', function( event ) {
		var node;

		if ( ! event.selection ) {
			$( '.wpview-wrap .wpview-body' ).each( function( i, viewBody ) {
				ReactDom.unmountComponentAtNode( viewBody );
			} );
		}

		if ( ! event.content ) {
			return;
		}

		if ( ! event.load ) {
			if ( selected ) {
				removeView( selected );
			}

			node = editor.selection.getNode();

			if ( node && node !== editor.getBody() && /^\s*https?:\/\/\S+\s*$/i.test( event.content ) ) {
				// When a url is pasted or inserted, only try to embed it when it is in an empty paragrapgh.
				node = editor.dom.getParent( node, 'p' );

				if ( node && /^[\s\uFEFF\u00A0]*$/.test( $( node ).text() || '' ) ) {
					// Make sure there are no empty inline elements in the <p>
					node.innerHTML = '';
				} else {
					return;
				}
			}
		}

		if ( ! event.isSettingMarkers ) {
			event.content = views.setMarkers( event.content );
		}
	} );

	// When pasting strip all tags and check if the string is an URL.
	// Then replace the pasted content with the cleaned URL.
	editor.on( 'pastePreProcess', function( event ) {
		var pastedStr = event.content;

		if ( pastedStr ) {
			pastedStr = tinymce.trim( pastedStr.replace( /<[^>]+>/g, '' ) );

			const imageMatch = /(https?:\/\/[^<]*)(\.jpg|\.jpeg|\.gif|\.png)\??.*$/i.exec( pastedStr );
			if ( imageMatch ) {
				// If the link looks like an image, replace the pasted content with an <img> tag.
				// As a side effect, this won't request an embed code to the REST API anymore.
				event.content = `<img src="${ imageMatch[ 1 ] }${ imageMatch[ 2 ] }" style="max-width:100%;" />`;
			} else if ( /^https?:\/\/\S+$/i.test( pastedStr ) ) {
				// Otherwise replace the content with the cleaned URL.
				event.content = pastedStr;
			}
		}
	});

	// When the editor's content has been updated and the DOM has been
	// processed, render the views in the document.
	editor.on( 'SetContent', function() {
		renderViews();
	});

	// Set the cursor before or after a view when clicking next to it.
	editor.on( 'click', function( event ) {
		var x = event.clientX,
			y = event.clientY,
			body = editor.getBody(),
			bodyRect = body.getBoundingClientRect(),
			first = body.firstChild,
			last = body.lastChild,
			firstRect, lastRect, view;

		if ( ! first || ! last ) {
			return;
		}

		firstRect = first.getBoundingClientRect();
		lastRect = last.getBoundingClientRect();

		if ( y < firstRect.top && ( view = getView( first ) ) ) {
			setViewCursor( true, view );
			event.preventDefault();
		} else if ( y > lastRect.bottom && ( view = getView( last ) ) ) {
			setViewCursor( false, view );
			event.preventDefault();
		} else if ( x < bodyRect.left || x > bodyRect.right ) {
			tinymce.each( editor.dom.select( '.wpview-wrap' ), function( view ) {
				var rect = view.getBoundingClientRect();

				if ( y < rect.top ) {
					return false;
				}

				if ( y >= rect.top && y <= rect.bottom ) {
					if ( x < bodyRect.left ) {
						setViewCursor( true, view );
						event.preventDefault();
					} else if ( x > bodyRect.right ) {
						setViewCursor( false, view );
						event.preventDefault();
					}

					return false;
				}
			});
		}
	});

	editor.on( 'init', function() {
		var scrolled = false,
			selection = editor.selection,
			MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

		// When a view is selected, ensure content that is being pasted
		// or inserted is added to a text node (instead of the view).
		editor.on( 'BeforeSetContent', function() {
			var walker, target,
				view = getView( selection.getNode() );

			// If the selection is not within a view, bail.
			if ( ! view ) {
				return;
			}

			if ( ! view.nextSibling || getView( view.nextSibling ) ) {
				// If there are no additional nodes or the next node is a
				// view, create a text node after the current view.
				target = editor.getDoc().createTextNode('');
				editor.dom.insertAfter( target, view );
			} else {
				// Otherwise, find the next text node.
				walker = new TreeWalker( view.nextSibling, view.nextSibling );
				target = walker.next();
			}

			// Select the `target` text node.
			selection.select( target );
			selection.collapse( true );
		});

		editor.dom.bind( editor.getDoc(), 'touchmove', function() {
			scrolled = true;
		});

		editor.on( 'mousedown mouseup click touchend', function( event ) {
			var view = getView( event.target );

			firstFocus = false;

			// Contain clicks inside the view wrapper
			if ( view ) {
				event.stopImmediatePropagation();
				event.preventDefault();

				if ( event.type === 'touchend' && scrolled ) {
					scrolled = false;
				} else {
					select( view );
				}

				// Returning false stops the ugly bars from appearing in IE11 and stops the view being selected as a range in FF.
				// Unfortunately, it also inhibits the dragging of views to a new location.
				return false;
			} else if ( event.type === 'touchend' || event.type === 'mousedown' ) {
				deselect();
			}

			if ( event.type === 'touchend' && scrolled ) {
				scrolled = false;
			}
		}, true );

		if ( MutationObserver ) {
			new MutationObserver( function() {
				editor.fire( 'wp-body-class-change' );
			} )
			.observe( editor.getBody(), {
				attributes: true,
				attributeFilter: [ 'class' ]
			} );
		}
	});

	editor.on( 'preinit show', function() {
		views.emitters.forEach( function( emitter ) {
			emitter.addListener( 'change', setMarkers );
		} );

		setMarkers();
	} );

	editor.on( 'hide remove', function() {
		views.emitters.forEach( function( emitter ) {
			emitter.removeListener( 'change', setMarkers );
		} );
	} );

	// Empty the wpview wrap and marker nodes
	function emptyViewNodes( rootNode ) {
		$( 'div.wpview-wrap, p.wpview-marker', rootNode ).each( function( i, node ) {
			node.innerHTML = '.';
		} );
	}

	// Run that before the DOM cleanup
	editor.on( 'PreProcess', function( event ) {
		emptyViewNodes( event.node );
	}, true );

	editor.on( 'hide', function() {
		deselect();
		emptyViewNodes();
	});

	editor.on( 'GetContent', function( event ) {
		if ( event.format === 'raw' && event.content && ! event.selection ) {
			event.content = resetViews( event.content );
		}
	} );

	editor.on( 'PostProcess', function( event ) {
		if ( event.content ) {
			event.content = event.content.replace( /<div [^>]*?data-wpview-text="([^"]+)"[^>]*>[\s\S]*?<\/div>/g, resetViewsCallback )
				.replace( /<p [^>]*?data-wpview-text="([^"]+)"[^>]*>[\s\S]*?<\/p>/g, resetViewsCallback );
		}
	} );

	// Excludes arrow keys, delete, backspace, enter, space bar.
	// Ref: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent.keyCode
	function isSpecialKey( key ) {
		return ( ( key <= 47 && key !== VK.SPACEBAR && key !== VK.ENTER && key !== VK.DELETE && key !== VK.BACKSPACE && ( key < 37 || key > 40 ) ) ||
			key >= 224 || // OEM or non-printable
			( key >= 144 && key <= 150 ) || // Num Lock, Scroll Lock, OEM
			( key >= 91 && key <= 93 ) || // Windows keys
			( key >= 112 && key <= 135 ) ); // F keys
	}

	// (De)select views when arrow keys are used to navigate the content of the editor.
	editor.on( 'keydown', function( event ) {
		var key = event.keyCode,
			dom = editor.dom,
			selection = editor.selection,
			node, view, cursorBefore, cursorAfter,
			range, clonedRange, tempRange;

		if ( selected ) {
			// Ignore key presses that involve the command or control key, but continue when in combination with backspace or v.
			// Also ignore the F# keys.
			if ( ( ( event.metaKey || event.ctrlKey ) && key !== VK.BACKSPACE && key !== 86 ) || ( key >= 112 && key <= 123 ) ) {
				// Remove the view when pressing cmd/ctrl+x on keyup, otherwise the browser can't copy the content.
				if ( ( event.metaKey || event.ctrlKey ) && key === 88 ) {
					toRemove = selected;
				}
				return;
			}

			view = getView( selection.getNode() );

			// If the caret is not within the selected view, deselect the view and bail.
			if ( view !== selected ) {
				deselect();
				return;
			}

			if ( key === VK.LEFT ) {
				setViewCursor( true, view );
				event.preventDefault();
			} else if ( key === VK.UP ) {
				if ( view.previousSibling ) {
					if ( getView( view.previousSibling ) ) {
						setViewCursor( true, view.previousSibling );
					} else {
						deselect();
						selection.select( view.previousSibling, true );
						selection.collapse();
					}
				} else {
					setViewCursor( true, view );
				}
				event.preventDefault();
			} else if ( key === VK.RIGHT ) {
				setViewCursor( false, view );
				event.preventDefault();
			} else if ( key === VK.DOWN ) {
				if ( view.nextSibling ) {
					if ( getView( view.nextSibling ) ) {
						setViewCursor( false, view.nextSibling );
					} else {
						deselect();
						selection.setCursorLocation( view.nextSibling, 0 );
					}
				} else {
					setViewCursor( false, view );
				}

				event.preventDefault();
			// Ignore keys that don't insert anything.
			} else if ( ! isSpecialKey( key ) ) {
				removeView( selected );

				if ( key === VK.ENTER || key === VK.DELETE || key === VK.BACKSPACE ) {
					event.preventDefault();
				}
			}
		} else {
			if ( event.metaKey || event.ctrlKey || ( key >= 112 && key <= 123 ) ) {
				return;
			}

			node = selection.getNode();
			lastKeyDownNode = node;
			view = getView( node );

			// Make sure we don't delete part of a view.
			// If the range ends or starts with the view, we'll need to trim it.
			if ( ! selection.isCollapsed() ) {
				range = selection.getRng();

				if ( view = getView( range.endContainer ) ) {
					clonedRange = range.cloneRange();
					selection.select( view.previousSibling, true );
					selection.collapse();
					tempRange = selection.getRng();
					clonedRange.setEnd( tempRange.endContainer, tempRange.endOffset );
					selection.setRng( clonedRange );
				} else if ( view = getView( range.startContainer ) ) {
					clonedRange = range.cloneRange();
					clonedRange.setStart( view.nextSibling, 0 );
					selection.setRng( clonedRange );
				}
			}

			if ( ! view ) {
				// Make sure we don't eat any content.
				if ( event.keyCode === VK.BACKSPACE ) {
					if ( editor.dom.isEmpty( node ) ) {
						if ( view = getView( node.previousSibling ) ) {
							setViewCursor( false, view );
							editor.dom.remove( node );
							event.preventDefault();
						}
					} else if ( ( range = selection.getRng() ) &&
							range.startOffset === 0 &&
							range.endOffset === 0 &&
							( view = getView( node.previousSibling ) ) ) {
						setViewCursor( false, view );
						event.preventDefault();
					}
				}
				return;
			}

			if ( ! ( ( cursorBefore = dom.hasClass( view, 'wpview-selection-before' ) ) ||
					( cursorAfter = dom.hasClass( view, 'wpview-selection-after' ) ) ) ) {
				return;
			}

			if ( isSpecialKey( key ) ) {
				// ignore
				return;
			}

			if ( ( cursorAfter && key === VK.UP ) || ( cursorBefore && key === VK.BACKSPACE ) ) {
				if ( view.previousSibling ) {
					if ( getView( view.previousSibling ) ) {
						setViewCursor( false, view.previousSibling );
					} else if ( dom.isEmpty( view.previousSibling ) && key === VK.BACKSPACE ) {
						dom.remove( view.previousSibling );
					} else {
						selection.select( view.previousSibling, true );
						selection.collapse();
					}
				} else {
					setViewCursor( true, view );
				}
				event.preventDefault();
			} else if ( cursorAfter && ( key === VK.DOWN || key === VK.RIGHT ) ) {
				if ( view.nextSibling ) {
					if ( getView( view.nextSibling ) ) {
						setViewCursor( key === VK.RIGHT, view.nextSibling );
					} else {
						selection.setCursorLocation( view.nextSibling, 0 );
					}
				}
				event.preventDefault();
			} else if ( cursorBefore && ( key === VK.UP || key === VK.LEFT ) ) {
				if ( view.previousSibling ) {
					if ( getView( view.previousSibling ) ) {
						setViewCursor( key === VK.UP, view.previousSibling );
					} else {
						selection.select( view.previousSibling, true );
						selection.collapse();
					}
				}
				event.preventDefault();
			} else if ( cursorBefore && key === VK.DOWN ) {
				if ( view.nextSibling ) {
					if ( getView( view.nextSibling ) ) {
						setViewCursor( true, view.nextSibling );
					} else {
						selection.setCursorLocation( view.nextSibling, 0 );
					}
				} else {
					setViewCursor( false, view );
				}
				event.preventDefault();
			} else if ( ( cursorAfter && key === VK.LEFT ) || ( cursorBefore && key === VK.RIGHT ) ) {
				select( view );
				event.preventDefault();
			} else if ( cursorAfter && key === VK.BACKSPACE ) {
				removeView( view );
				event.preventDefault();
			} else if ( cursorAfter ) {
				handleEnter( view );
			} else if ( cursorBefore ) {
				handleEnter( view, true, key );
			}

			if ( key === VK.ENTER ) {
				event.preventDefault();
			}
		}
	});

	editor.on( 'keyup', function() {
		if ( toRemove ) {
			removeView( toRemove );
			toRemove = false;
		}
	});

	editor.on( 'focus', function() {
		var view;

		focus = true;
		editor.dom.addClass( editor.getBody(), 'has-focus' );

		// Edge case: show the fake caret when the editor is focused for the first time
		// and the first element is a view.
		if ( firstFocus && ( view = getView( editor.getBody().firstChild ) ) ) {
			setViewCursor( true, view );
		}

		firstFocus = false;
	} );

	editor.on( 'blur', function() {
		focus = false;
		editor.dom.removeClass( editor.getBody(), 'has-focus' );
	} );

	editor.on( 'NodeChange', function( event ) {
		var dom = editor.dom,
			views = editor.dom.select( '.wpview-wrap' ),
			className = event.element.className,
			view = getView( event.element ),
			lKDN = lastKeyDownNode;

		lastKeyDownNode = false;

		clearInterval( cursorInterval );

		// This runs a lot and is faster than replacing each class separately
		tinymce.each( views, function ( view ) {
			if ( view.className ) {
				view.className = view.className.replace( / ?\bwpview-(?:selection-before|selection-after|cursor-hide)\b/g, '' );
			}
		});

		if ( focus && view ) {
			if ( ( className === 'wpview-selection-before' || className === 'wpview-selection-after' ) &&
				editor.selection.isCollapsed() ) {

				setViewCursorTries = 0;

				deselect();

				// Make sure the cursor arrived in the right node.
				// This is necessary for Firefox.
				if ( lKDN === view.previousSibling ) {
					setViewCursor( true, view );
					return;
				} else if ( lKDN === view.nextSibling ) {
					setViewCursor( false, view );
					return;
				}

				dom.addClass( view, className );

				cursorInterval = setInterval( function() {
					if ( dom.hasClass( view, 'wpview-cursor-hide' ) ) {
						dom.removeClass( view, 'wpview-cursor-hide' );
					} else {
						dom.addClass( view, 'wpview-cursor-hide' );
					}
				}, 500 );
			// If the cursor lands anywhere else in the view, set the cursor before it.
			// Only try this once to prevent a loop. (You never know.)
			} else if ( ! getParent( event.element, 'wpview-clipboard' ) && ! setViewCursorTries ) {
				deselect();
				setViewCursorTries++;
				setViewCursor( true, view );
			}
		}
	});

	editor.on( 'BeforeExecCommand', function() {
		var node = editor.selection.getNode(),
			view;

		if ( node && ( ( execCommandBefore = node.className === 'wpview-selection-before' ) || node.className === 'wpview-selection-after' ) && ( view = getView( node ) ) ) {
			handleEnter( view, execCommandBefore );
			execCommandView = view;
		}
	});

	editor.on( 'ExecCommand', function() {
		var toSelect, node;

		if ( selected ) {
			toSelect = selected;
			deselect();
			select( toSelect );
		}

		if ( execCommandView ) {
			node = execCommandView[ execCommandBefore ? 'previousSibling' : 'nextSibling' ];

			if ( node && node.nodeName === 'P' && editor.dom.isEmpty( node ) ) {
				editor.dom.remove( node );
				setViewCursor( execCommandBefore, execCommandView );
			}

			execCommandView = false;
		}
	});

	editor.on( 'ResolveName', function( event ) {
		if ( editor.dom.hasClass( event.target, 'wpview-wrap' ) ) {
			event.name = editor.dom.getAttrib( event.target, 'data-wpview-type' ) || 'wpview';
			event.stopPropagation();
		} else if ( getView( event.target ) ) {
			event.preventDefault();
			event.stopPropagation();
		}
	});

	editor.addButton( 'wp_view_edit', {
		tooltip: i18n.translate( 'Edit', { context: 'verb' } ),
		icon: 'dashicon dashicons-edit',
		onPostRender: function() {
			editor.on( 'wptoolbar', function() {
				var type;

				if ( ! selected ) {
					return;
				}

				type = editor.dom.getAttrib( selected, 'data-wpview-type' );
				this.visible( views.isEditable( type ) );
			}.bind( this ) );
		},
		onClick: function() {
			var type;

			if ( ! selected ) {
				return;
			}

			type = editor.dom.getAttrib( selected, 'data-wpview-type' );
			views.edit( type, editor, getText( selected ) );
		}
	} );

	editor.addButton( 'wp_view_remove', {
		tooltip: i18n.translate( 'Remove' ),
		icon: 'dashicon dashicons-no',
		onClick: function() {
			selected && removeView( selected );
		}
	} );

	editor.once( 'preinit', function() {
		toolbar = editor.wp._createToolbar( [
			'wp_view_edit',
			'wp_view_remove'
		] );
	} );

	editor.on( 'wptoolbar', function( event ) {
		if ( selected ) {
			event.element = selected;
			event.toolbar = toolbar;
		}
	} );
}

module.exports = function() {
	tinymce.PluginManager.add( 'wpcom/view', wpview );
};
