/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import ReactDomServer from 'react-dom/server';
import React from 'react';
import tinymce from 'tinymce/tinymce';
import { assign, debounce, find, findLast, pick, values } from 'lodash';
import i18n from 'i18n-calypso';
import { parse, stringify } from 'lib/shortcode';
import closest from 'component-closest';

/**
 * Internal dependencies
 */
import * as MediaConstants from 'lib/media/constants';
import MediaActions from 'lib/media/actions';
import { getThumbnailSizeDimensions } from 'lib/media/utils';
import { deserialize } from 'lib/media-serialization';
import MediaMarkup from 'post-editor/media-modal/markup';
import MediaStore from 'lib/media/store';
import EditorMediaModal from 'post-editor/editor-media-modal';
import notices from 'notices';
import TinyMCEDropZone from './drop-zone';
import restrictSize from './restrict-size';
import config from 'config';
import { getSelectedSite } from 'state/ui/selectors';
import { setEditorMediaModalView } from 'state/ui/editor/actions';
import { unblockSave } from 'state/ui/editor/save-blockers/actions';
import { getEditorRawContent, isEditorSaveBlocked } from 'state/ui/editor/selectors';
import { ModalViews } from 'state/ui/media-modal/constants';
import { renderWithReduxStore } from 'lib/react-helpers';
import Gridicon from 'components/gridicon';

/**
 * Module variables
 */
const REGEXP_IMG = /<img\s[^>]*\/?>/gi;
const SIZE_ORDER = [ 'thumbnail', 'medium', 'large', 'full' ];

let lastDirtyImage = null,
	numOfImagesToUpdate = null;

function mediaButton( editor ) {
	const store = editor.getParam( 'redux_store' );

	if ( ! store ) {
		return;
	}

	const { dispatch, getState } = store;

	let nodes = {};
	let updateMedia; // eslint-disable-line

	const getSelectedSiteFromState = () => getSelectedSite( getState() );

	function insertMedia( markup ) {
		editor.execCommand( 'mceInsertContent', false, markup );
	}

	function renderModal( props = {}, options = {} ) {
		const selectedSite = getSelectedSiteFromState();
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

		renderWithReduxStore(
			<EditorMediaModal
				{ ...props }
				/* eslint-disable react/jsx-no-bind */
				onClose={ renderModal.bind( null, { visible: false } ) }
				/* eslint-disable react/jsx-no-bind */
				onInsertMedia={ ( markup ) => {
					insertMedia( markup );
					renderModal( { visible: false } );
				} }
			/>,
			nodes.modal,
			store
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

		renderWithReduxStore(
			<TinyMCEDropZone
				editor={ editor }
				onInsertMedia={ insertMedia }
				onRenderModal={ renderModal }
			/>,
			nodes.dropzone,
			store
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

	updateMedia = debounce( function () {
		const originalSelectedNode = editor.selection.getNode();
		let isTransientDetected = false,
			transients = 0,
			content,
			images;
		const selectedSite = getSelectedSiteFromState();
		if ( ! selectedSite ) {
			return;
		}

		const isVisualEditMode = ! editor.isHidden();

		if ( isVisualEditMode ) {
			images = editor.dom.select( 'img' );
		} else {
			// Attempt to pull the post from the edit store so that the post
			// contents can be analyzed for images.
			content = getEditorRawContent( getState() );
			if ( ! content ) {
				return;
			}

			images = content.match( REGEXP_IMG ) || [];
		}

		// Let's loop through all the images in a post/page editor.
		images.forEach( function ( img ) {
			const current = deserialize( img );

			// Ignore images which weren't inserted via media modal
			if ( ! current.media.ID ) {
				return;
			}

			// Let's get the media object counterpart of an image in post/page editor.
			// This media object contains the latest changes to the media file.
			const media = MediaStore.get( selectedSite.ID, current.media.ID );

			let mediaHasCaption = false;
			let captionNode = null;

			// If image is deleted in image editor, we delete it in the post/page editor.
			if ( media && media.status === 'deleted' ) {
				captionNode = editor.dom.getParent( img, 'div.mceTemp' );
				editor.$( captionNode || img ).remove();
				editor.nodeChanged();
				return;
			}

			// If image is edited in image editor, we mark it as dirty and update it in post/page editor.
			if ( media && media.isDirty ) {
				if ( ! lastDirtyImage || lastDirtyImage.ID !== media.ID ) {
					lastDirtyImage = media;

					// We need to count how many instances of the same dirty image are there in a post/page editor
					// so we can update them all and then mark the image not dirty at the end of this fn.
					const dirtyImages = editor.dom.select( `img.wp-image-${ media.ID }` );

					// Let's keep the count of dirty images in a global counter.
					numOfImagesToUpdate = dirtyImages.length;
				}

				// If an image was edited in image editor, we need to manually set its counterpart in post/page editor
				// as transient so we can update it.
				current.media.transient = true;

				captionNode = editor.dom.getParent( img, '.mceTemp' );

				// If an edited image includes a caption shortcode, we get the caption text so we can render a new
				// caption with the same text.
				if ( captionNode ) {
					media.caption = editor.dom.$( '.wp-caption-dd', captionNode ).text();
					mediaHasCaption = true;
				}
			}

			if ( current.media.transient ) {
				transients++;
				isTransientDetected = true;

				// Mark the image as a transient in upload
				editor.dom.$( img ).toggleClass( 'is-transient', true );
			} else {
				// Remove the transient flag if present
				editor.dom.$( img ).toggleClass( 'is-transient', false );
			}

			if (
				// We only want to update post contents in cases where the media
				// transitions to being persisted...
				( current.media.transient && ( ! media || ! media.transient ) ) ||
				// ...or if an image was edited with image editor to show the edits immediately.
				( current.media.transient && media && media.isDirty && media.transient )
			) {
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

				let useMediaSize = false;

				if ( media.isDirty ) {
					// If an image is edited through image editor and its final size is smaller than the size of
					// the inserted image, let's update the size of inserted image to the size of edited image.
					useMediaSize = media.width < current.media.width || media.height < current.media.height;
				}

				// When merging, allow any updated field to be used if it doesn't
				// already exist in the current markup, but otherwise only force
				// update ID, URL, width and height attributes to their new values
				const merged = assign(
					{},
					media,
					current.media,
					pick( media, 'ID', 'URL', useMediaSize ? 'width' : '', useMediaSize ? 'height' : '' ),
					{
						transient: !! media.transient,
					}
				);
				const options = assign( {}, current.appearance, {
					forceResize:
						! media.transient && current.media.width && current.media.width !== media.width,
				} );

				if ( ! mediaHasCaption ) {
					// If a media doesn't include a caption shortcode, we're explicitly targetting the media.
					// Therefore, we don't allow the caption to be considered in the generated markup.
					delete merged.caption;
				}

				// Use markup utility to generate replacement element
				markup = MediaMarkup.get( selectedSite, merged, options );

				// If a media includes a caption shortcode, we can get the HTML markup of the shortcode with
				// the following method.
				if ( mediaHasCaption ) {
					markup = editor.wpSetImgCaption( markup );
				}
			} else {
				// If there's an unidentifiable blob image in the post content,
				// we assume that an error occurred, that the image should be
				// removed, and that the user should be notified.
				notices.error( 'An error occurred while uploading the file' );
				markup = '';
			}

			// Enable plugins to filter markup
			const event = {
				content: markup,
				mode: isVisualEditMode ? 'tinymce' : 'html',
			};
			editor.fire( 'BeforeSetWpcomMedia', event );

			// To avoid an undesirable flicker after the image uploads but
			// hasn't yet been loaded, we preload the image before rendering.
			const imageUrl = event.resizedImageUrl || media.URL;
			if ( ! loadedImages.isLoaded( imageUrl ) ) {
				const preloadImage = new Image();
				preloadImage.src = imageUrl;
				preloadImage.onload = loadedImages.onLoad.bind( null, imageUrl );
				preloadImage.onerror = preloadImage.onload;

				transients++;
				return;
			}

			let mediaString = '';

			// If media is wrapped in [caption] shortcode and we are in the Visual mode,
			// we want to replace the whole caption wrapper and media node.
			if ( mediaHasCaption && captionNode.outerHTML ) {
				mediaString = captionNode.outerHTML;

				captionNode.outerHTML = event.content;

				// The `img` object can be a string or a DOM node. We need a
				// normalized string to replace the post content markup
			} else if ( img.outerHTML ) {
				mediaString = img.outerHTML;

				// In visual editing mode, we apply the changes immediately by
				// mutating the DOM node directly
				img.outerHTML = event.content;
			} else {
				mediaString = img;
			}

			// Replace the instance in the original post content
			if ( content ) {
				content = content.replace( mediaString, event.content );
			}

			// Not only should the content be replaced here, but also for every
			// instance in the undo stack.
			//
			// See: https://github.com/tinymce/tinymce/blob/4.2.4/js/tinymce/classes/EditorUpload.js#L49-L53
			editor.undoManager.data = editor.undoManager.data.map( function ( level ) {
				level.content = level.content.replace( mediaString, event.content );
				return level;
			} );

			// If we got this far in code execution and the counter of edited images to update is > 0,
			// we decrease it as an image was just updated in a post/page.
			if ( numOfImagesToUpdate > 0 ) {
				numOfImagesToUpdate -= 1;
			}
		} );

		if ( ! transients && isEditorSaveBlocked( getState(), 'MEDIA_MODAL_TRANSIENT_INSERT' ) ) {
			// At this point, no temporary media should remain in the post
			// contents, so we can safely allow saving once more
			dispatch( unblockSave( 'MEDIA_MODAL_TRANSIENT_INSERT' ) );
		}

		if ( isTransientDetected && ! transients ) {
			// If the HTML tab is active, set content to replace the current
			// textarea value
			if ( ! isVisualEditMode ) {
				editor.fire( 'SetTextAreaContent', { content } );
			}

			// We have just replaced some image nodes, potentially losing selection/focus.
			// So if an image node was selected and one isn't now, re-select it.
			if ( 'IMG' === originalSelectedNode.nodeName ) {
				reselectImage();
			}

			// Trigger an editor change so that dirty detection and
			// autosave take effect
			editor.fire( 'change' );
		}

		// After editing an image, we need to update them in a post/page. If we updated all instances
		// of the edited image, we dispatch an action which marks the image media object not dirty.
		if ( lastDirtyImage && lastDirtyImage.isDirty && numOfImagesToUpdate === 0 ) {
			MediaActions.edit( selectedSite.ID, { ...lastDirtyImage, isDirty: false } );

			// We also need to reset the counter of post/page images to update so if another image is
			// edited and marked dirty, we can set the counter to correct number.
			numOfImagesToUpdate = null;
		}
	} );

	function reselectImage() {
		// Re-select image node
		let replacement = editor.selection.getStart();
		if ( 'IMG' !== replacement.nodeName ) {
			replacement = replacement.querySelector( 'img' );
		}

		if ( replacement ) {
			editor.selection.select( replacement );
			editor.selection.controlSelection.showResizeRect( replacement );
		}
	}

	function hideDropZoneOnDrag( event ) {
		renderDropZone( { visible: event.type === 'dragend' } );
	}

	function initMediaModal() {
		const selectedSite = getSelectedSiteFromState();
		if ( selectedSite ) {
			MediaActions.clearValidationErrors( selectedSite.ID );
		}
	}

	editor.addCommand( 'wpcomAddMedia', () => {
		initMediaModal();

		renderModal( {
			visible: true,
		} );
	} );

	editor.addCommand( 'googleAddMedia', () => {
		initMediaModal();

		renderModal( {
			visible: true,
			source: 'google_photos',
		} );
	} );

	editor.addCommand( 'pexelsAddMedia', () => {
		initMediaModal();

		renderModal( {
			visible: true,
			source: 'pexels',
		} );
	} );

	editor.addButton( 'wpcom_add_media', {
		classes: 'btn wpcom-icon-button media',
		cmd: 'wpcomAddMedia',
		title: i18n.translate( 'Add Media' ),
		onPostRender: function () {
			this.innerHtml(
				ReactDomServer.renderToStaticMarkup(
					// eslint-disable-next-line jsx-a11y/no-interactive-element-to-noninteractive-role
					<button type="button" role="presentation" tabIndex="-1">
						{ /* eslint-disable wpcalypso/jsx-gridicon-size */ }
						<Gridicon icon="image-multiple" size={ 20 } />
						{ /* eslint-enable wpcalypso/jsx-gridicon-size */ }
					</button>
				)
			);
		},
	} );

	editor.addButton( 'wp_img_edit', {
		tooltip: i18n.translate( 'Edit', { context: 'verb' } ),
		classes: 'toolbar-segment-start',
		icon: 'dashicon dashicons-edit',
		onclick: function () {
			const selectedSite = getSelectedSiteFromState();
			if ( ! selectedSite ) {
				return;
			}

			const siteId = selectedSite.ID;
			const node = editor.selection.getNode();
			const m = node.className.match( /wp-image-(\d+)/ );
			const imageId = m && parseInt( m[ 1 ], 10 );
			if ( ! imageId ) {
				return;
			}
			const image = MediaStore.get( siteId, imageId );

			MediaActions.clearValidationErrors( siteId );
			renderModal(
				{
					visible: true,
					labels: {
						confirm: i18n.translate( 'Update', { context: 'verb' } ),
					},
				},
				{
					view: ModalViews.DETAIL,
				}
			);
			MediaActions.setLibrarySelectedItems( siteId, [ image ] );
		},
	} );

	editor.addButton( 'wp_img_caption', {
		tooltip: i18n.translate( 'Caption', { context: 'verb' } ),
		icon: 'dashicon dashicons-admin-comments',
		classes: 'toolbar-segment-start toolbar-segment-end',
		stateSelector: '.wp-caption',
		onclick: function () {
			const node = editor.selection.getStart(),
				parsed = deserialize( node ),
				selectedSite = getSelectedSiteFromState();
			let content;

			if ( ! parsed || ! selectedSite ) {
				return;
			}

			const caption = closest( node, '.wp-caption' );
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
			const media = MediaStore.get( selectedSite.ID, parsed.media.ID );
			if ( media && media.caption ) {
				content = media.caption;
			} else {
				content = i18n.translate( 'Enter a caption' );
			}

			// Assign missing DOM dimensions to image node. The `wpeditimage`
			// plugin strips any caption where dimension attributes are missing
			[ 'width', 'height' ].forEach( function ( dimension ) {
				if ( null === node.getAttribute( dimension ) && parsed.media[ dimension ] ) {
					node.setAttribute( dimension, parsed.media[ dimension ] );
				}
			} );

			// Generate a caption to wrap the image
			const attrs = {
				width: parsed.media.width,
			};

			if ( parsed.media.ID ) {
				attrs.id = 'attachment_' + parsed.media.ID;
			}

			if ( parsed.appearance.align ) {
				attrs.align = 'align' + parsed.appearance.align;
			}

			const shortcode = stringify( {
				tag: 'caption',
				attrs: attrs,
				content: [ node.outerHTML, content ].join( ' ' ),
			} );

			editor.selection.setContent( shortcode );
			editor.selection.select(
				editor.selection.getStart().querySelector( '.wp-caption-dd' ),
				true
			);
			editor.selection.controlSelection.hideResizeRect();
			this.rootControl.hide();
		},
	} );

	// Compute the ratio of size compared to baseSize
	// This ratio is used to order image sizes
	const computeRatio = ( size, baseSize ) => {
		const { width, height } = { ...baseSize, ...size };
		return Math.min( width / baseSize.width || Infinity, height / baseSize.height || Infinity );
	};

	function resize( increment ) {
		const node = editor.selection.getStart(),
			parsed = deserialize( node ),
			selectedSite = getSelectedSiteFromState();
		if ( ! parsed || ! selectedSite ) {
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
		let media = assign( {}, MediaStore.get( selectedSite.ID, parsed.media.ID ) );
		delete media.caption;
		media = assign( {}, parsed.media, media );

		// Determine the next usable size
		// In order to get the next usable size, we compute the ratio of all the default sizes and compare them to the current ratio
		// If we are increasing the size, we select the default size that has the closest greater ratio
		// While decreasing we take the closest lower ratio
		const sizeRatios = SIZE_ORDER.map( ( size ) =>
			computeRatio( getThumbnailSizeDimensions( size, selectedSite ), media )
		);
		const sizeIndex = SIZE_ORDER.indexOf( parsed.appearance.size );
		const displayedRatio =
			sizeIndex !== -1 ? sizeRatios[ sizeIndex ] : computeRatio( parsed.media, media );
		const isMatchingSize = ( currentSize, index ) => {
			// Exclude all the sizes that are greater than the full size of the media
			if ( sizeRatios[ index ] > 1 ) {
				return false;
			}

			// If we are increasing the size, the ratio should be greater than the current ratio and lower instead
			if ( increment > 0 ) {
				return sizeRatios[ index ] > displayedRatio;
			}

			return sizeRatios[ index ] < displayedRatio;
		};

		const findFn = increment > 0 ? find : findLast;
		const size = findFn( SIZE_ORDER, isMatchingSize ) || SIZE_ORDER[ SIZE_ORDER.length - 1 ];

		// Generate updated markup
		const markup = MediaMarkup.get( selectedSite, media, assign( parsed.appearance, { size } ) );

		// Replace selected content
		editor.selection.setContent( markup );

		reselectImage();

		editor.nodeChanged();
	}

	function toggleSizingControls( increase, event ) {
		const selectedSite = getSelectedSiteFromState();
		if ( ! event.element || 'IMG' !== event.element.nodeName || ! selectedSite ) {
			return;
		}

		const parsed = deserialize( event.element );
		const media = assign(
			{ width: Infinity, height: Infinity },
			MediaStore.get( selectedSite.ID, parsed.media.ID )
		);
		const currentRatio = computeRatio( parsed.media, media );

		// Hide sizing toggles if the image is transient
		const isHidden = !! parsed.media.transient;
		this.classes.toggle( 'hidden', isHidden );

		if ( increase ) {
			// Disable increase button when the ratio is bigger or equal 1
			const isDisabled = currentRatio >= 1;
			this.disabled( isDisabled );
		} else {
			// Disable decrease button when it's ratio is smaller than the thumbnail's ratio
			// Or when the current selected size is the thumbnail size
			const thumbRatio = computeRatio(
				getThumbnailSizeDimensions( SIZE_ORDER[ 0 ], selectedSite ),
				media
			);
			const isDisabled = currentRatio <= thumbRatio || SIZE_ORDER[ 0 ] === parsed.appearance.size;
			this.disabled( isDisabled );
		}
	}

	editor.addButton( 'wpcom_img_size_decrease', {
		tooltip: i18n.translate( 'Decrease size' ),
		classes: 'toolbar-segment-start img-size-decrease',
		icon: 'dashicon dashicons-minus',
		onPostRender: function () {
			editor.on( 'wptoolbar', toggleSizingControls.bind( this, false ) );
		},
		onclick: function () {
			resize( -1 );
		},
	} );

	editor.addButton( 'wpcom_img_size_increase', {
		tooltip: i18n.translate( 'Increase size' ),
		classes: 'toolbar-segment-end img-size-increase',
		icon: 'dashicon dashicons-plus',
		onPostRender: function () {
			editor.on( 'wptoolbar', toggleSizingControls.bind( this, true ) );
		},
		onclick: function () {
			resize( 1 );
		},
	} );

	editor.addCommand( 'WP_Medialib', () => {
		renderModal( { visible: true } );
	} );

	editor.addCommand( 'wpcomEditGallery', function ( content ) {
		const selectedSite = getSelectedSiteFromState();
		if ( ! selectedSite ) {
			return;
		}

		let gallery = parse( content );
		if ( gallery.tag !== 'gallery' ) {
			return;
		}

		gallery = assign( {}, MediaConstants.GalleryDefaultAttrs, gallery.attrs.named );

		gallery.items = gallery.ids.split( ',' ).map( ( id ) => {
			id = parseInt( id, 10 );

			const media = MediaStore.get( selectedSite.ID, id );
			if ( ! media ) {
				MediaActions.fetch( selectedSite.ID, id );
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

		MediaActions.setLibrarySelectedItems( selectedSite.ID, gallery.items );

		renderModal(
			{
				visible: true,
				initialGallerySettings: gallery,
				labels: {
					confirm: i18n.translate( 'Update', { context: 'verb' } ),
				},
			},
			{
				preserveFocus: true,
				view: ModalViews.GALLERY,
			}
		);
	} );

	const resizeEditor = debounce(
		function () {
			// eslint-disable-line
			editor.execCommand( 'wpcomAutoResize', null, null, { skip_focus: true } );
		},
		400,
		{ leading: true }
	);

	function resizeOnImageLoad( event ) {
		if ( event.target.nodeName === 'IMG' ) {
			resizeEditor();
		}
	}

	function fetchUnknownImages( event ) {
		const selectedSite = getSelectedSiteFromState();
		if ( ! selectedSite ) {
			return;
		}

		( event.content.match( REGEXP_IMG ) || [] ).forEach( function ( img ) {
			const parsed = deserialize( img );

			if ( ! parsed.media.ID || MediaStore.get( selectedSite.ID, parsed.media.ID ) ) {
				return;
			}

			setTimeout( function () {
				MediaActions.fetch( selectedSite.ID, parsed.media.ID );
			}, 0 );
		} );
	}

	function preventCaptionTripleClick( event ) {
		if ( ! event.detail || event.detail < 2 ) {
			return;
		}

		const caption = closest( event.target, '.wp-caption-dd' );
		if ( caption ) {
			editor.selection.select( caption );
		}
	}

	function preventCaptionBackspaceRemove( event ) {
		if ( 8 !== event.keyCode && 46 !== event.keyCode ) {
			// Backspace
			return;
		}

		// `event.target` won't return the expected target on a keypress
		// within a `contenteditable`. Passing `true` to `getStart` will
		// return the parent of the collapsed node when no content exists.
		const target = editor.selection.getStart( true );
		if ( ! editor.dom.hasClass( target, 'wp-caption-dd' ) ) {
			return;
		}

		// Prevent the keypress default in one of two cases:
		//  - Backspace (8) and selection at start of line
		//  - Forward delete (46) and selection at end of line
		const range = editor.selection.getRng();
		if (
			( 8 === event.keyCode && 0 === range.startOffset ) ||
			( 46 === event.keyCode && target.textContent.length === range.endOffset )
		) {
			event.preventDefault();
		}
	}

	function removeEmptyCaptions( focussed ) {
		if ( focussed ) {
			return;
		}

		editor.dom.select( '.wp-caption-dd' ).forEach( function ( caption ) {
			if ( caption.textContent.trim().length ) {
				return;
			}

			const wrapper = closest( caption.parentNode, '.wp-caption' );
			const img = wrapper.querySelector( 'img' );
			editor.dom.replace( img, wrapper.parentNode );
		} );
	}

	function selectImageOnTap() {
		let isTouchDragging = false;

		return function ( event ) {
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
		editor.on( 'contextmenu', function () {
			ipc.send( 'mce-contextmenu', { sender: true } );
		} );
	}

	editor.on( 'touchstart touchmove touchend', selectImageOnTap() );

	editor.on( 'init', function () {
		MediaStore.on( 'change', updateMedia );
		editor.getDoc().addEventListener( 'load', resizeOnImageLoad, true );
		editor.dom.bind( editor.getDoc(), 'dragstart dragend', hideDropZoneOnDrag );
		editor.selection.selectorChanged( '.wp-caption', removeEmptyCaptions );
	} );

	editor.on( 'init show hide', function () {
		renderDropZone( { visible: ! editor.isHidden() } );
	} );

	editor.on( 'SetContent', fetchUnknownImages );

	editor.on( 'remove', function () {
		values( nodes ).forEach( function ( node ) {
			ReactDom.unmountComponentAtNode( node );
			node.parentNode.removeChild( node );
		} );
		nodes = {};

		MediaStore.off( 'change', updateMedia );
		editor.getDoc().removeEventListener( 'load', resizeOnImageLoad );
	} );

	restrictSize( editor );
}

export default function () {
	tinymce.PluginManager.add( 'wpcom/media', mediaButton );
}
