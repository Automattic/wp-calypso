/**
 * Adapted from the WordPress wp-editimage TinyMCE plugin.
 *
 * @copyright 2015 by the WordPress contributors.
 * @license See CREDITS.md.
*/

/**
 * External dependencies
 */
var tinymce = require( 'tinymce/tinymce' );

function wpEditImage( editor ) {
	var toolbar, serializer,
		each = tinymce.each,
		iOS = tinymce.Env.iOS;

	function isPlaceholder( node ) {
		return !! ( editor.dom.getAttrib( node, 'data-mce-placeholder' ) || editor.dom.getAttrib( node, 'data-mce-object' ) );
	}

	editor.addButton( 'wp_img_remove', {
		tooltip: 'Remove',
		icon: 'dashicon dashicons-no',
		onclick: function() {
			removeImage( editor.selection.getNode() );
		}
	} );

	each( {
		alignleft: 'Align left',
		aligncenter: 'Align center',
		alignright: 'Align right',
		alignnone: 'No alignment'
	}, function( tooltip, name ) {
		var direction = name.slice( 5 );

		editor.addButton( 'wp_img_' + name, {
			tooltip: tooltip,
			icon: 'dashicon dashicons-align-' + direction,
			cmd: 'alignnone' === name ? 'wpAlignNone' : 'Justify' + direction.slice( 0, 1 ).toUpperCase() + direction.slice( 1 ),
			onPostRender: function() {
				var self = this;

				editor.on( 'NodeChange', function( event ) {
					var node;

					// Don't bother.
					if ( event.element.nodeName !== 'IMG' ) {
						return;
					}

					node = editor.dom.getParent( event.element, '.wp-caption' ) || event.element;

					if ( 'alignnone' === name ) {
						self.active( ! /\balign(left|center|right)\b/.test( node.className ) );
					} else {
						self.active( editor.dom.hasClass( node, name ) );
					}
				} );
			}
		} );
	} );

	editor.once( 'preinit', function() {
		toolbar = editor.wp._createToolbar( [
			'wp_img_alignleft',
			'wp_img_aligncenter',
			'wp_img_alignright',
			'wp_img_alignnone',
			'wpcom_img_size_decrease',
			'wpcom_img_size_increase',
			'wp_img_caption', // See plugins/media
			'wp_img_remove'
		] );
	} );

	editor.on( 'wptoolbar', function( event ) {
		if ( event.element.nodeName === 'IMG' && ! isPlaceholder( event.element ) ) {
			event.toolbar = toolbar;
		}
	} );

	// Safari on iOS fails to select image nodes in contentEditoble mode on touch/click.
	// Select them again.
	if ( iOS ) {
		editor.on( 'click', function( event ) {
			if ( event.target.nodeName === 'IMG' ) {
				var node = event.target;

				window.setTimeout( function() {
					editor.selection.select( node );
					editor.nodeChanged();
				}, 200 );
			} else {
				toolbar.hide();
			}
		} );
	}

	function parseShortcode( content ) {
		return content.replace( /(?:<p>)?\[(?:wp_)?caption([^\]]+)\]([\s\S]+?)\[\/(?:wp_)?caption\](?:<\/p>)?/g, function( a, b, c ) {
			var id, align, classes, caption, img, width,
				trim = tinymce.trim;

			id = b.match( /id=['"]([^'"]*)['"] ?/ );
			if ( id ) {
				b = b.replace( id[0], '' );
			}

			align = b.match( /align=['"]([^'"]*)['"] ?/ );
			if ( align ) {
				b = b.replace( align[0], '' );
			}

			classes = b.match( /class=['"]([^'"]*)['"] ?/ );
			if ( classes ) {
				b = b.replace( classes[0], '' );
			}

			width = b.match( /width=['"]([0-9]*)['"] ?/ );
			if ( width ) {
				b = b.replace( width[0], '' );
			}

			c = trim( c );
			img = c.match( /((?:<a [^>]+>)?<img [^>]+>(?:<\/a>)?)([\s\S]*)/i );

			if ( img && img[2] ) {
				caption = trim( img[2] );
				img = trim( img[1] );
			} else {
				// old captions shortcode style
				caption = trim( b ).replace( /caption=['"]/, '' ).replace( /['"]$/, '' );
				img = c;
			}

			id = ( id && id[1] ) ? id[1].replace( /[<>&]+/g,  '' ) : '';
			align = ( align && align[1] ) ? align[1] : 'alignnone';
			classes = ( classes && classes[1] ) ? ' ' + classes[1].replace( /[<>&]+/g,  '' ) : '';

			if ( ! width && img ) {
				width = img.match( /width=['"]([0-9]*)['"]/ );
			}

			if ( width && width[1] ) {
				width = width[1];
			}

			if ( ! width || ! caption ) {
				return c;
			}

			width = parseInt( width, 10 );
			if ( ! editor.getParam( 'wpeditimage_html5_captions' ) ) {
				width += 10;
			}

			return '<div class="mceTemp"><dl id="' + id + '" class="wp-caption ' + align + classes + '" style="width: ' + width + 'px">' +
				'<dt class="wp-caption-dt">'+ img +'</dt><dd class="wp-caption-dd">'+ caption +'</dd></dl></div>';
		} );
	}

	function getShortcode( content ) {
		return content.replace( /<div (?:id="attachment_|class="mceTemp)[^>]*>([\s\S]+?)<\/div>/g, function( a, b ) {
			var out = '';

			if ( b.indexOf('<img ') === -1 ) {
				// Broken caption. The user managed to drag the image out?
				// Try to return the caption text as a paragraph.
				out = b.match( /<dd [^>]+>([\s\S]+?)<\/dd>/i );

				if ( out && out[1] ) {
					return '<p>' + out[1] + '</p>';
				}

				return '';
			}

			out = b.replace( /\s*<dl ([^>]+)>\s*<dt [^>]+>([\s\S]+?)<\/dt>\s*<dd [^>]+>([\s\S]*?)<\/dd>\s*<\/dl>\s*/gi, function( a, b, c, caption ) {
				var id, classes, align, width;

				width = c.match( /width="([0-9]*)"/ );
				width = ( width && width[1] ) ? width[1] : '';

				classes = b.match( /class="([^"]*)"/ );
				classes = ( classes && classes[1] ) ? classes[1] : '';
				align = classes.match( /align[a-z]+/i ) || 'alignnone';

				if ( ! width || ! caption ) {
					if ( 'alignnone' !== align[0] ) {
						c = c.replace( /><img/, ' class="' + align[0] + '"><img' );
					}
					return c;
				}

				id = b.match( /id="([^"]*)"/ );
				id = ( id && id[1] ) ? id[1] : '';

				classes = classes.replace( /wp-caption ?|align[a-z]+ ?/gi, '' );

				if ( classes ) {
					classes = ' class="' + classes + '"';
				}

				caption = caption.replace( /\r\n|\r/g, '\n' ).replace( /<[a-zA-Z0-9]+( [^<>]+)?>/g, function( a ) {
					// no line breaks inside HTML tags
					return a.replace( /[\r\n\t]+/, ' ' );
				} );

				// convert remaining line breaks to <br>
				caption = caption.replace( /\s*\n\s*/g, '<br />' );

				return '[caption id="' + id + '" align="' + align + '" width="' + width + '"' + classes + ']' + c + ' ' + caption + '[/caption]';
			} );

			if ( out.indexOf('[caption') === -1 ) {
				// the caption html seems broken, try to find the image that may be wrapped in a link
				// and may be followed by <p> with the caption text.
				out = b.replace( /[\s\S]*?((?:<a [^>]+>)?<img [^>]+>(?:<\/a>)?)(<p>[\s\S]*<\/p>)?[\s\S]*/gi, '<p>$1</p>$2' );
			}

			return out;
		} );
	}

	// Verify HTML in captions
	function verifyHTML( caption ) {
		if ( ! caption || ( caption.indexOf( '<' ) === -1 && caption.indexOf( '>' ) === -1 ) ) {
			return caption;
		}

		if ( ! serializer ) {
			serializer = new tinymce.html.Serializer( {}, editor.schema );
		}

		return serializer.serialize( editor.parser.parse( caption, { forced_root_block: false } ) );
	}

	function removeImage( node ) {
		var wrap;

		if ( node.nodeName === 'DIV' && editor.dom.hasClass( node, 'mceTemp' ) ) {
			wrap = node;
		} else if ( node.nodeName === 'IMG' || node.nodeName === 'DT' || node.nodeName === 'A' ) {
			wrap = editor.dom.getParent( node, 'div.mceTemp' );
		}

		if ( wrap ) {
			if ( wrap.nextSibling ) {
				editor.selection.select( wrap.nextSibling );
			} else if ( wrap.previousSibling ) {
				editor.selection.select( wrap.previousSibling );
			} else {
				editor.selection.select( wrap.parentNode );
			}

			editor.selection.collapse( true );
			editor.dom.remove( wrap );
		} else {
			editor.dom.remove( node );
		}

		editor.nodeChanged();
		editor.undoManager.add();
	}

	editor.on( 'init', function() {
		var dom = editor.dom,
			captionClass = editor.getParam( 'wpeditimage_html5_captions' ) ? 'html5-captions' : 'html4-captions';

		dom.addClass( editor.getBody(), captionClass );

		// Add caption field to the default image dialog
		editor.on( 'wpLoadImageForm', function( event ) {
			if ( editor.getParam( 'wpeditimage_disable_captions' ) ) {
				return;
			}

			var captionField = {
				type: 'textbox',
				flex: 1,
				name: 'caption',
				minHeight: 60,
				multiline: true,
				scroll: true,
				label: 'Image caption'
			};

			event.data.splice( event.data.length - 1, 0, captionField );
		} );

		// Fix caption parent width for images added from URL
		editor.on( 'wpNewImageRefresh', function( event ) {
			var parent, captionWidth;

			if ( parent = dom.getParent( event.node, 'dl.wp-caption' ) ) { //eslint-disable-line no-cond-assign
				if ( ! parent.style.width ) {
					captionWidth = parseInt( event.node.clientWidth, 10 ) + 10;
					captionWidth = captionWidth ? captionWidth + 'px' : '50%';
					dom.setStyle( parent, 'width', captionWidth );
				}
			}
		} );

		editor.on( 'wpImageFormSubmit', function( event ) {
			var data = event.imgData.data,
				imgNode = event.imgData.node,
				caption = event.imgData.caption,
				captionId = '',
				captionAlign = '',
				captionWidth = '',
				wrap, parent, node, html, imgId;

			// Temp image id so we can find the node later
			data.id = '__wp-temp-img-id';
			// Cancel the original callback
			event.imgData.cancel = true;

			if ( ! data.style ) {
				data.style = null;
			}

			if ( ! data.src ) {
				// Delete the image and the caption
				if ( imgNode ) {
					if ( wrap = dom.getParent( imgNode, 'div.mceTemp' ) ) { //eslint-disable-line no-cond-assign
						dom.remove( wrap );
					} else if ( imgNode.parentNode.nodeName === 'A' ) {
						dom.remove( imgNode.parentNode );
					} else {
						dom.remove( imgNode );
					}

					editor.nodeChanged();
				}
				return;
			}

			if ( caption ) {
				caption = caption.replace( /\r\n|\r/g, '\n' ).replace( /<\/?[a-zA-Z0-9]+( [^<>]+)?>/g, function( a ) {
					// No line breaks inside HTML tags
					return a.replace( /[\r\n\t]+/, ' ' );
				} );

				// Convert remaining line breaks to <br>
				caption = caption.replace( /(<br[^>]*>)\s*\n\s*/g, '$1' ).replace( /\s*\n\s*/g, '<br />' );
				caption = verifyHTML( caption );
			}

			if ( ! imgNode ) {
				// New image inserted
				html = dom.createHTML( 'img', data );

				if ( caption ) {
					node = editor.selection.getNode();

					if ( data.width ) {
						captionWidth = parseInt( data.width, 10 );

						if ( ! editor.getParam( 'wpeditimage_html5_captions' ) ) {
							captionWidth += 10;
						}

						captionWidth = ' style="width: ' + captionWidth + 'px"';
					}

					html = '<dl class="wp-caption alignnone"' + captionWidth + '>' +
						'<dt class="wp-caption-dt">'+ html +'</dt><dd class="wp-caption-dd">'+ caption +'</dd></dl>';

					if ( node.nodeName === 'P' ) {
						parent = node;
					} else {
						parent = dom.getParent( node, 'p' );
					}

					if ( parent && parent.nodeName === 'P' ) {
						wrap = dom.create( 'div', { 'class': 'mceTemp' }, html );
						parent.parentNode.insertBefore( wrap, parent );
						editor.selection.select( wrap );
						editor.nodeChanged();

						if ( dom.isEmpty( parent ) ) {
							dom.remove( parent );
						}
					} else {
						editor.selection.setContent( '<div class="mceTemp">' + html + '</div>' );
					}
				} else {
					editor.selection.setContent( html );
				}
			} else {
				// Edit existing image

				// Store the original image id if any
				imgId = imgNode.id || null;
				// Update the image node
				dom.setAttribs( imgNode, data );
				wrap = dom.getParent( imgNode, 'dl.wp-caption' );

				if ( caption ) {
					if ( wrap ) {
						if ( parent = dom.select( 'dd.wp-caption-dd', wrap )[0] ) { //eslint-disable-line no-cond-assign
							parent.innerHTML = caption;
						}
					} else {
						if ( imgNode.className ) {
							captionId = imgNode.className.match( /wp-image-([0-9]+)/ );
							captionAlign = imgNode.className.match( /align(left|right|center|none)/ );
						}

						if ( captionAlign ) {
							captionAlign = captionAlign[0];
							imgNode.className = imgNode.className.replace( /align(left|right|center|none)/g, '' );
						} else {
							captionAlign = 'alignnone';
						}

						captionAlign = ' class="wp-caption ' + captionAlign + '"';

						if ( captionId ) {
							captionId = ' id="attachment_' + captionId[1] + '"';
						}

						captionWidth = data.width || imgNode.clientWidth;

						if ( captionWidth ) {
							captionWidth = parseInt( captionWidth, 10 );

							if ( ! editor.getParam( 'wpeditimage_html5_captions' ) ) {
								captionWidth += 10;
							}

							captionWidth = ' style="width: '+ captionWidth +'px"';
						}

						if ( imgNode.parentNode && imgNode.parentNode.nodeName === 'A' ) {
							node = imgNode.parentNode;
						} else {
							node = imgNode;
						}

						html = '<dl ' + captionId + captionAlign + captionWidth + '>' +
							'<dt class="wp-caption-dt"></dt><dd class="wp-caption-dd">'+ caption +'</dd></dl>';

						wrap = dom.create( 'div', { 'class': 'mceTemp' }, html );

						if ( parent = dom.getParent( node, 'p' ) ) { //eslint-disable-line no-cond-assign
							parent.parentNode.insertBefore( wrap, parent );
						} else {
							node.parentNode.insertBefore( wrap, node );
						}

						editor.$( wrap ).find( 'dt.wp-caption-dt' ).append( node );

						if ( parent && dom.isEmpty( parent ) ) {
							dom.remove( parent );
						}
					}
				} else {
					if ( wrap ) {
						// Remove the caption wrapper and place the image in new paragraph
						if ( imgNode.parentNode.nodeName === 'A' ) {
							html = dom.getOuterHTML( imgNode.parentNode );
						} else {
							html = dom.getOuterHTML( imgNode );
						}

						parent = dom.create( 'p', {}, html );
						dom.insertAfter( parent, wrap.parentNode );
						editor.selection.select( parent );
						editor.nodeChanged();
						dom.remove( wrap.parentNode );
					}
				}
			}

			imgNode = dom.get('__wp-temp-img-id');
			dom.setAttrib( imgNode, 'id', imgId );
			event.imgData.node = imgNode;
		} );

		editor.on( 'wpLoadImageData', function( event ) {
			var parent,
				data = event.imgData.data,
				imgNode = event.imgData.node;

			if ( parent = dom.getParent( imgNode, 'dl.wp-caption' ) ) { //eslint-disable-line no-cond-assign
				parent = dom.select( 'dd.wp-caption-dd', parent )[0];

				if ( parent ) {
					data.caption = editor.serializer.serialize( parent )
						.replace( /<br[^>]*>/g, '$&\n' ).replace( /^<p>/, '' ).replace( /<\/p>$/, '' );
				}
			}
		} );

		dom.bind( editor.getDoc(), 'dragstart', function( event ) {
			var node = editor.selection.getNode();

			// Prevent dragging images out of the caption elements
			if ( node.nodeName === 'IMG' && dom.getParent( node, '.wp-caption' ) ) {
				event.preventDefault();
			}
		} );

		// Prevent IE11 from making dl.wp-caption resizable
		if ( tinymce.Env.ie && tinymce.Env.ie > 10 ) {
			// The 'mscontrolselect' event is supported only in IE11+
			dom.bind( editor.getBody(), 'mscontrolselect', function( event ) {
				if ( event.target.nodeName === 'IMG' && dom.getParent( event.target, '.wp-caption' ) ) {
					// Hide the thick border with resize handles around dl.wp-caption
					editor.getBody().focus(); // :(
				} else if ( event.target.nodeName === 'DL' && dom.hasClass( event.target, 'wp-caption' ) ) {
					// Trigger the thick border with resize handles...
					// This will make the caption text editable.
					event.target.focus();
				}
			} );
		}
	} );

	editor.on( 'ObjectResized', function( event ) {
		var node = event.target;

		if ( node.nodeName === 'IMG' ) {
			editor.undoManager.transact( function() {
				var parent, width,
					dom = editor.dom;

				node.className = node.className.replace( /\bsize-[^ ]+/, '' );

				if ( parent = dom.getParent( node, '.wp-caption' ) ) { //eslint-disable-line no-cond-assign
					width = event.width || dom.getAttrib( node, 'width' );

					if ( width ) {
						width = parseInt( width, 10 );

						if ( ! editor.getParam( 'wpeditimage_html5_captions' ) ) {
							width += 10;
						}

						dom.setStyle( parent, 'width', width + 'px' );
					}
				}
			} );
		}
	} );

	editor.on( 'BeforeExecCommand', function( event ) {
		var node, p, DL, align, replacement,
			cmd = event.command,
			dom = editor.dom;

		if ( cmd === 'mceInsertContent' ) {
			// When inserting content, if the caret is inside a caption create new paragraph under
			// and move the caret there
			if ( node = dom.getParent( editor.selection.getNode(), 'div.mceTemp' ) ) { //eslint-disable-line no-cond-assign
				p = dom.create( 'p' );
				dom.insertAfter( p, node );
				editor.selection.setCursorLocation( p, 0 );
				editor.nodeChanged();
			}
		} else if ( cmd === 'JustifyLeft' || cmd === 'JustifyRight' || cmd === 'JustifyCenter' || cmd === 'wpAlignNone' ) {
			node = editor.selection.getNode();
			align = 'align' + cmd.slice( 7 ).toLowerCase();
			DL = editor.dom.getParent( node, '.wp-caption' );

			if ( node.nodeName !== 'IMG' && ! DL ) {
				return;
			}

			node = DL || node;

			if ( editor.dom.hasClass( node, align ) ) {
				replacement = ' alignnone';
			} else {
				replacement = ' ' + align;
			}

			node.className = node.className.replace( / ?align(left|center|right|none)/g, '' ) + replacement;

			editor.nodeChanged();
			event.preventDefault();

			if ( toolbar ) {
				toolbar.reposition();
			}

			editor.fire( 'ExecCommand', {
				command: cmd,
				ui: event.ui,
				value: event.value
			} );
		}
	} );

	editor.on( 'keydown', function( event ) {
		var node, wrap, P, spacer,
			selection = editor.selection,
			keyCode = event.keyCode,
			dom = editor.dom,
			VK = tinymce.util.VK;

		if ( keyCode === VK.ENTER ) {
			// When pressing Enter inside a caption move the caret to a new parapraph under it
			node = selection.getNode();
			wrap = dom.getParent( node, 'div.mceTemp' );

			if ( wrap ) {
				dom.events.cancel( event ); // Doesn't cancel all :(

				// Remove any extra dt and dd cleated on pressing Enter...
				tinymce.each( dom.select( 'dt, dd', wrap ), function( element ) {
					if ( dom.isEmpty( element ) ) {
						dom.remove( element );
					}
				} );

				spacer = tinymce.Env.ie && tinymce.Env.ie < 11 ? '' : '<br data-mce-bogus="1" />';
				P = dom.create( 'p', null, spacer );

				if ( node.nodeName === 'DD' ) {
					dom.insertAfter( P, wrap );
				} else {
					wrap.parentNode.insertBefore( P, wrap );
				}

				editor.nodeChanged();
				selection.setCursorLocation( P, 0 );
			}
		} else if ( keyCode === VK.DELETE || keyCode === VK.BACKSPACE ) {
			node = selection.getNode();

			if ( node.nodeName === 'DIV' && dom.hasClass( node, 'mceTemp' ) ) {
				wrap = node;
			} else if ( node.nodeName === 'IMG' || node.nodeName === 'DT' || node.nodeName === 'A' ) {
				wrap = dom.getParent( node, 'div.mceTemp' );
			}

			if ( wrap ) {
				dom.events.cancel( event );
				removeImage( node );
				return false;
			}
		}
	} );

	// After undo/redo FF seems to set the image height very slowly when it is set to 'auto' in the CSS.
	// This causes image.getBoundingClientRect() to return wrong values and the resize handles are shown in wrong places.
	// Collapse the selection to remove the resize handles.
	if ( tinymce.Env.gecko ) {
		editor.on( 'undo redo', function() {
			if ( editor.selection.getNode().nodeName === 'IMG' ) {
				editor.selection.collapse();
			}
		} );
	}

	editor.wpSetImgCaption = function( content ) {
		return parseShortcode( content );
	};

	editor.wpGetImgCaption = function( content ) {
		return getShortcode( content );
	};

	editor.on( 'BeforeSetContent', function( event ) {
		if ( event.format !== 'raw' ) {
			event.content = editor.wpSetImgCaption( event.content );
		}
	} );

	editor.on( 'PostProcess', function( event ) {
		if ( event.get ) {
			event.content = editor.wpGetImgCaption( event.content );
		}
	} );

	// Add to editor.wp
	editor.wp = editor.wp || {};
	editor.wp.isPlaceholder = isPlaceholder;

}

module.exports = function() {
	tinymce.PluginManager.add( 'wpeditimage', wpEditImage );
};
