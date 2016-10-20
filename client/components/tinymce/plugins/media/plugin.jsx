/**
 * External dependencies
 */
var ReactDom = require( 'react-dom' ),
	ReactDomServer = require( 'react-dom/server' ),
	ReduxProvider = require( 'react-redux' ).Provider,
	React = require( 'react' ),
	tinymce = require( 'tinymce/tinymce' ),
	pick = require( 'lodash/pick' ),
	assign = require( 'lodash/assign' ),
	values = require( 'lodash/values' ),
	debounce = require( 'lodash/debounce' ),
	includes = require( 'lodash/includes' ),
	i18n = require( 'i18n-calypso' ),
	Shortcode = require( 'lib/shortcode' ),
	closest = require( 'component-closest' );

/**
 * Internal dependencies
 */
var sites = require( 'lib/sites-list' )(),
	PostActions = require( 'lib/posts/actions' ),
	PostEditStore = require( 'lib/posts/post-edit-store' ),
	MediaConstants = require( 'lib/media/constants' ),
	MediaActions = require( 'lib/media/actions' ),
	MediaUtils = require( 'lib/media/utils' ),
	MediaSerialization = require( 'lib/media-serialization' ),
	MediaMarkup = require( 'post-editor/media-modal/markup' ),
	MediaStore = require( 'lib/media/store' ),
	MediaLibrarySelectedData = require( 'components/data/media-library-selected-data' ),
	notices = require( 'notices' ),
	TinyMCEDropZone = require( './drop-zone' ),
	restrictSize = require( './restrict-size' ).default,
	advanced = require( './advanced' ),
	Gridicon = require( 'components/gridicon' ),
	config = require( 'config' );
import EditorMediaModal from 'post-editor/media-modal';
import { setEditorMediaModalView } from 'state/ui/editor/actions';
import { ModalViews } from 'state/ui/media-modal/constants';

/**
 * Module variables
 */
var REGEXP_IMG = /<img\s[^>]*\/?>/ig,
	SIZE_ORDER = [ 'thumbnail', 'medium', 'large', 'full' ];

function mediaButton( editor ) {
	const store = editor.getParam( 'redux_store' );
	var nodes = {},
		updateMedia, resizeEditor;

	function insertMedia( markup ) {
		editor.execCommand( 'mceInsertContent', false, markup );
	}

	function renderModal( props = {}, options = {} ) {
		var selectedSite = sites.getSelectedSite();
		if ( ! selectedSite ) {
			return;
		}

		// When opening modal, we want to unrender the base drop-zone so that
		// two drop-zones aren't visible on the page at the same time
		renderDropZone( { visible: ! props.visible } );

		// Create rendering context for modal
		if ( ! nodes.modal ) {
			nodes.modal = editor.getContainer().appendChild( document.createElement( 'div' ) );
		}

		// Dismiss software keyboard if transitioning from editor
		if ( props.visible && ! options.preserveFocus ) {
			editor.focus( false );
		}

		// Dispatch modal active view
		if ( props.visible ) {
			const { view = ModalViews.LIST } = options;
			store.dispatch( setEditorMediaModalView( view ) );
		}

		ReactDom.render(
			<ReduxProvider store={ store }>
				<MediaLibrarySelectedData siteId={ selectedSite.ID }>
					<EditorMediaModal
						{ ...props }
						onClose={ renderModal.bind( null, { visible: false } ) }
						onInsertMedia={ ( markup ) => {
							insertMedia( markup );
							renderModal( { visible: false } );
						} }
						site={ selectedSite } />
				</MediaLibrarySelectedData>
			</ReduxProvider>,
			nodes.modal
		);
	}

	function renderDropZone( { visible } ) {
		if ( ! visible ) {
			if ( nodes.dropzone ) {
				ReactDom.unmountComponentAtNode( nodes.dropzone );
			}
			return;
		}

		// Create rendering context for drop zone
		if ( ! nodes.dropzone ) {
			nodes.dropzone = document.createElement( 'div' );
			editor.getContainer().parentNode.insertBefore( nodes.dropzone, editor.getContainer() );
		}

		ReactDom.render(
			<TinyMCEDropZone
				editor={ editor }
				sites={ sites }
				onInsertMedia={ insertMedia }
				onRenderModal={ renderModal } />,
			nodes.dropzone
		);
	}

	const loadedImages = ( () => {
		const loaded = {};

		function isLoaded( url ) {
			return !! loaded[ url ];
		}

		function onLoad( url ) {
			loaded[ url ] = true;
			updateMedia();
		}

		return { isLoaded, onLoad };
	} )();

	updateMedia = debounce( function() {
		var selectedSite = sites.getSelectedSite(),
			isTransientDetected = false,
			transients = 0,
			isVisualEditMode, content, images;

		if ( ! selectedSite ) {
			return;
		}

		isVisualEditMode = ! editor.isHidden();

		if ( isVisualEditMode ) {
			images = editor.dom.select( 'img' );
		} else {
			// Attempt to pull the post from the edit store so that the post
			// contents can be analyzed for images.
			content = PostEditStore.getRawContent();
			if ( ! content ) {
				return;
			}

			images = content.match( REGEXP_IMG ) || [];
		}

		images.forEach( function( img ) {
			const current = MediaSerialization.deserialize( img );

			// Ignore images which weren't inserted via media modal
			if ( ! current.media.ID ) {
				return;
			}

			if ( current.media.transient ) {
				transients++;
				isTransientDetected = true;
			}

			// We only want to update post contents in cases where the media
			// transitions to being persisted
			const media = MediaStore.get( selectedSite.ID, current.media.ID );
			if ( current.media.transient && ( ! media || ! media.transient ) ) {
				transients--;
			} else {
				return;
			}

			let markup;
			if ( media ) {
				// Detect whether any parsed attributes of the updated media differ
				// from the one detected in the post
				if ( media.ID === current.media.ID && media.URL === current.media.URL ) {
					return;
				}

				// When merging, allow any updated field to be used if it doesn't
				// already exist in the current markup, but otherwise only force
				// update ID and URL attributes to their new values
				const merged = assign( {}, media, current.media, pick( media, 'ID', 'URL' ), {
					transient: !! media.transient
				} );
				const options = assign( {}, current.appearance, {
					forceResize: ! media.transient && current.media.width && current.media.width !== media.width
				} );

				// Since we're explicitly targetting the image, don't allow the
				// caption to be considered in the generated markup
				delete merged.caption;

				// Use markup utility to generate replacement element
				markup = MediaMarkup.get( merged, options );
			} else {
				// If there's an unidentifiable blob image in the post content,
				// we assume that an error occurred, that the image should be
				// removed, and that the user should be notified.
				notices.error( 'An error occurred while uploading the file' );
				markup = '';
			}

			// Enable plugins to filter markup
			let event = {
				content: markup,
				mode: isVisualEditMode ? 'tinymce' : 'html'
			};
			editor.fire( 'BeforeSetWpcomMedia', event );

			// To avoid an undesirable flicker after the image uploads but
			// hasn't yet been loaded, we preload the image before rendering.
			const imageUrl = MediaSerialization.deserialize( event.content ).media.URL;
			if ( ! loadedImages.isLoaded( imageUrl ) ) {
				const preloadImage = new Image();
				preloadImage.src = imageUrl;
				preloadImage.onload = loadedImages.onLoad.bind( null, imageUrl );
				preloadImage.onerror = preloadImage.onload;

				transients++;
				return;
			}

			// The `img` object can be a string or a DOM node. We need a
			// normalized string to replace the post content markup
			let imgString;
			if ( img.outerHTML ) {
				imgString = img.outerHTML;

				// In visual editing mode, we apply the changes immediately by
				// mutating the DOM node directly
				img.outerHTML = event.content;
			} else {
				imgString = img;
			}

			// Replace the instance in the original post content
			if ( content ) {
				content = content.replace( imgString, event.content );
			}

			// Not only should the content be replaced here, but also for every
			// instance in the undo stack.
			//
			// See: https://github.com/tinymce/tinymce/blob/4.2.4/js/tinymce/classes/EditorUpload.js#L49-L53
			editor.undoManager.data = editor.undoManager.data.map( function( level ) {
				level.content = level.content.replace( imgString, event.content );
				return level;
			} );
		} );

		if ( ! transients && PostEditStore.isSaveBlocked( 'MEDIA_MODAL_TRANSIENT_INSERT' ) ) {
			// At this point, no temporary media should remain in the post
			// contents, so we can safely allow saving once more
			PostActions.unblockSave( 'MEDIA_MODAL_TRANSIENT_INSERT' );
		}

		if ( isTransientDetected && ! transients ) {
			// If the HTML tab is active, set content to replace the current
			// textarea value
			if ( ! isVisualEditMode ) {
				editor.fire( 'SetTextAreaContent', { content } );
			}

			// Trigger an editor change so that dirty detection and
			// autosave take effect
			editor.fire( 'change' );
		}
	} );

	function hideDropZoneOnDrag( event ) {
		renderDropZone( { visible: event.type === 'dragend' } );
	}

	editor.addCommand( 'wpcomAddMedia', () => {
		var selectedSite = sites.getSelectedSite();
		if ( selectedSite ) {
			MediaActions.clearValidationErrors( selectedSite.ID );
		}

		renderModal( {
			visible: true
		} );
	} );

	editor.addButton( 'wpcom_add_media', {
		classes: 'btn wpcom-icon-button media',
		cmd: 'wpcomAddMedia',
		title: i18n.translate( 'Add Media' ),
		onPostRender: function() {
			this.innerHtml( ReactDomServer.renderToStaticMarkup(
				<button type="button" role="presentation" tabIndex="-1">
					{ /* eslint-disable wpcalypso/jsx-gridicon-size */ }
					<Gridicon icon="image-multiple" size={ 20 } />
					{ /* eslint-enable wpcalypso/jsx-gridicon-size */ }
				</button>
			) );
		}
	} );

	editor.addButton( 'wp_img_caption', {
		tooltip: i18n.translate( 'Caption', { context: 'verb' } ),
		icon: 'dashicon dashicons-admin-comments',
		classes: 'toolbar-segment-start toolbar-segment-end',
		stateSelector: '.wp-caption',
		onclick: function() {
			var node = editor.selection.getStart(),
				site = sites.getSelectedSite(),
				parsed = MediaSerialization.deserialize( node ),
				caption, media, content, attrs, shortcode;

			if ( ! parsed || ! site ) {
				return;
			}

			caption = closest( node, '.wp-caption' );
			if ( caption ) {
				// If already wrapped as caption, restore the original image
				editor.dom.replace( node, caption.parentNode );
				if ( editor.selection.getStart() !== node ) {
					editor.selection.select( node );
				}

				// Update resize handle position
				editor.selection.controlSelection.showResizeRect( node );

				// Update toolbar button active state
				editor.nodeChanged();
				return;
			}

			// Attempt to find media in Flux store
			media = MediaStore.get( site.ID, parsed.media.ID );
			if ( media && media.caption ) {
				content = media.caption;
			} else {
				content = i18n.translate( 'Enter a caption' );
			}

			// Assign missing DOM dimensions to image node. The `wpeditimage`
			// plugin strips any caption where dimension attributes are missing
			[ 'width', 'height' ].forEach( function( dimension ) {
				if ( null === node.getAttribute( dimension ) && parsed.media[ dimension ] ) {
					node.setAttribute( dimension, parsed.media[ dimension ] );
				}
			} );

			// Generate a caption to wrap the image
			attrs = {
				width: parsed.media.width
			};

			if ( parsed.media.ID ) {
				attrs.id = 'attachment_' + parsed.media.ID;
			}

			if ( parsed.appearance.align ) {
				attrs.align = 'align' + parsed.appearance.align;
			}

			shortcode = Shortcode.stringify( {
				tag: 'caption',
				attrs: attrs,
				content: [ node.outerHTML, content ].join( ' ' )
			} );

			editor.selection.setContent( shortcode );
			editor.selection.select( editor.selection.getStart().querySelector( '.wp-caption-dd' ), true );
			editor.selection.controlSelection.hideResizeRect();
			this.rootControl.hide();
		}
	} );

	function resize( increment ) {
		const node = editor.selection.getStart();
		const site = sites.getSelectedSite();
		const parsed = MediaSerialization.deserialize( node );

		if ( ! parsed || ! site ) {
			return;
		}

		// If the image is a caption, set the selection to the caption so that
		// we replace the caption wrapper, since captions are width-aware.
		const caption = editor.dom.getParent( node, '.mceTemp' );
		if ( caption ) {
			editor.selection.select( caption );
			parsed.media.caption = editor.dom.$( '.wp-caption-dd', caption ).text();
		}

		// Attempt to find media in Flux store
		let media = assign( {}, MediaStore.get( site.ID, parsed.media.ID ) );
		delete media.caption;
		media = assign( {}, parsed.media, media );

		// Determine the next usable size
		let sizeIndex = SIZE_ORDER.indexOf( parsed.appearance.size );
		let size;
		do {
			sizeIndex += increment;
			size = SIZE_ORDER[ Math.max( sizeIndex, 0 ) ];
			const dimensions = MediaUtils.getThumbnailSizeDimensions( size, site );
			if ( media.width > dimensions.width || media.height > dimensions.width ) {
				break;
			}
		} while ( sizeIndex > 0 && sizeIndex < SIZE_ORDER.length - 1 );

		// Generate updated markup
		const markup = MediaMarkup.get( media, assign( parsed.appearance, { size } ) );

		// Replace selected content
		editor.selection.setContent( markup );

		// Re-select image node
		let replacement = editor.selection.getStart();
		if ( 'IMG' !== replacement.nodeName ) {
			replacement = replacement.querySelector( 'img' );
		}

		if ( replacement ) {
			editor.selection.select( replacement );
			editor.selection.controlSelection.showResizeRect( replacement );
		}

		editor.nodeChanged();
	}

	function toggleSizingControls( event ) {
		if ( ! event.element || 'IMG' !== event.element.nodeName ) {
			return;
		}

		const parsed = MediaSerialization.deserialize( event.element );

		// Disable sizing toggles if the image is transient
		let isHidden = parsed.media.transient;

		// Disable sizing toggles if the image is of an unknown size
		if ( ! isHidden ) {
			isHidden = ! parsed.appearance.size || ! includes( SIZE_ORDER, parsed.appearance.size );
		}

		// Disable sizing toggles if the image is smaller than the smallest
		// thumbnail size for the site
		if ( ! isHidden ) {
			const thumb = MediaUtils.getThumbnailSizeDimensions( SIZE_ORDER[ 0 ], sites.getSelectedSite() );
			isHidden = ( parsed.media.width || Infinity ) < thumb.width && ( parsed.media.height || Infinity ) < thumb.height;
		}

		this.classes.toggle( 'hidden', isHidden );
	}

	editor.addButton( 'wpcom_img_size_decrease', {
		tooltip: i18n.translate( 'Decrease size' ),
		classes: 'toolbar-segment-start img-size-decrease',
		icon: 'dashicon dashicons-minus',
		onPostRender: function() {
			editor.selection.selectorChanged( '.size-thumbnail', ( state ) => {
				this.disabled( state );
			} );

			editor.on( 'wptoolbar', toggleSizingControls.bind( this ) );
		},
		onclick: function() {
			resize( -1 );
		}
	} );

	editor.addButton( 'wpcom_img_size_increase', {
		tooltip: i18n.translate( 'Increase size' ),
		classes: 'toolbar-segment-end img-size-increase',
		icon: 'dashicon dashicons-plus',
		onPostRender: function() {
			editor.selection.selectorChanged( '.size-full', ( state ) => {
				this.disabled( state );
			} );

			editor.on( 'wptoolbar', toggleSizingControls.bind( this ) );
		},
		onclick: function() {
			resize( 1 );
		}
	} );

	editor.addCommand( 'WP_Medialib', () => {
		renderModal( { visible: true } );
	} );

	editor.addCommand( 'wpcomEditGallery', function( content ) {
		const site = sites.getSelectedSite();
		if ( ! site ) {
			return;
		}

		let gallery = Shortcode.parse( content );
		if ( gallery.tag !== 'gallery' ) {
			return;
		}

		gallery = assign( {}, MediaConstants.GalleryDefaultAttrs, gallery.attrs.named );

		gallery.items = gallery.ids.split( ',' ).map( ( id ) => {
			id = parseInt( id, 10 );

			const media = MediaStore.get( site.ID, id );
			if ( ! media ) {
				MediaActions.fetch( site.ID, id );
			}

			return assign( { ID: id }, media );
		} );

		delete gallery.ids;

		if ( gallery.columns ) {
			gallery.columns = parseInt( gallery.columns, 10 );
		}

		if ( gallery.orderby ) {
			gallery.orderBy = gallery.orderby;
			delete gallery.orderby;
		}

		MediaActions.setLibrarySelectedItems( site.ID, gallery.items );

		renderModal( {
			visible: true,
			initialGallerySettings: gallery,
			labels: {
				confirm: i18n.translate( 'Update', { context: 'verb' } )
			}
		}, {
			preserveFocus: true,
			view: ModalViews.GALLERY
		} );
	} );

	resizeEditor = debounce( function() {
		editor.execCommand( 'wpcomAutoResize', null, null, { skip_focus: true } );
	}, 400, { leading: true } );

	function resizeOnImageLoad( event ) {
		if ( event.target.nodeName === 'IMG' ) {
			resizeEditor();
		}
	}

	function fetchUnknownImages( event ) {
		var site = sites.getSelectedSite();
		if ( ! site ) {
			return;
		}

		( event.content.match( REGEXP_IMG ) || [] ).forEach( function( img ) {
			const parsed = MediaSerialization.deserialize( img );

			if ( ! parsed.media.ID || MediaStore.get( site.ID, parsed.media.ID ) ) {
				return;
			}

			setTimeout( function() {
				MediaActions.fetch( site.ID, parsed.media.ID );
			}, 0 );
		} );
	}

	function preventCaptionTripleClick( event ) {
		var caption;
		if ( ! event.detail || event.detail < 2 ) {
			return;
		}

		caption = closest( event.target, '.wp-caption-dd', true );
		if ( caption ) {
			editor.selection.select( caption );
		}
	}

	function preventCaptionBackspaceRemove( event ) {
		var target, range;
		if ( 8 !== event.keyCode && 46 !== event.keyCode ) { // Backspace
			return;
		}

		// `event.target` won't return the expected target on a keypress
		// within a `contenteditable`. Passing `true` to `getStart` will
		// return the parent of the collapsed node when no content exists.
		target = editor.selection.getStart( true );
		if ( ! editor.dom.hasClass( target, 'wp-caption-dd' ) ) {
			return;
		}

		// Prevent the keypress default in one of two cases:
		//  - Backspace (8) and selection at start of line
		//  - Forward delete (46) and selection at end of line
		range = editor.selection.getRng();
		if ( ( 8 === event.keyCode && 0 === range.startOffset ) ||
				( 46 === event.keyCode && target.textContent.length === range.endOffset ) ) {
			event.preventDefault();
		}
	}

	function removeEmptyCaptions( focussed ) {
		if ( focussed ) {
			return;
		}

		editor.dom.select( '.wp-caption-dd' ).forEach( function( caption ) {
			var wrapper, img;
			if ( caption.textContent.trim().length ) {
				return;
			}

			wrapper = closest( caption, '.wp-caption' );
			img = wrapper.querySelector( 'img' );
			editor.dom.replace( img, wrapper.parentNode );
		} );
	}

	function selectImageOnTap() {
		let isTouchDragging = false;

		return function( event ) {
			switch ( event.type ) {
				case 'touchstart':
					isTouchDragging = false;
					break;

				case 'touchmove':
					isTouchDragging = true;
					break;

				case 'touchend':
					if ( ! isTouchDragging && 'IMG' === event.target.nodeName ) {
						editor.selection.select( event.target );
						event.preventDefault();
					}
					break;
			}
		};
	}

	editor.on( 'click', preventCaptionTripleClick );

	editor.on( 'keydown', preventCaptionBackspaceRemove );

	// send contextmenu event up to desktop app
	if ( config.isEnabled( 'desktop' ) ) {
		const ipc = require( 'electron' ).ipcRenderer; // From Electron
		editor.on( 'contextmenu', function( ev ) {
			ipc.send( 'mce-contextmenu', ev );
		} );
	}

	editor.on( 'touchstart touchmove touchend', selectImageOnTap() );

	editor.on( 'init', function() {
		MediaStore.on( 'change', updateMedia );
		editor.getDoc().addEventListener( 'load', resizeOnImageLoad, true );
		editor.dom.bind( editor.getDoc(), 'dragstart dragend', hideDropZoneOnDrag );
		editor.selection.selectorChanged( '.wp-caption', removeEmptyCaptions );
	} );

	editor.on( 'init show hide', function() {
		renderDropZone( { visible: ! editor.isHidden() } );
	} );

	editor.on( 'SetContent', fetchUnknownImages );

	editor.on( 'remove', function() {
		values( nodes ).forEach( function( node ) {
			ReactDom.unmountComponentAtNode( node );
			node.parentNode.removeChild( node );
		} );
		nodes = {};

		MediaStore.off( 'change', updateMedia );
		editor.getDoc().removeEventListener( 'load', resizeOnImageLoad );
	} );

	restrictSize( editor );
	advanced( editor );
}

module.exports = function() {
	tinymce.PluginManager.add( 'wpcom/media', mediaButton );
};
