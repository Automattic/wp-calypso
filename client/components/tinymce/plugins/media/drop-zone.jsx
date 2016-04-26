/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import noop from 'lodash/noop';
import loadImage from 'blueimp-load-image';
import debugModule from 'debug';
import config from 'config';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import observe from 'lib/mixins/data-observe';
import PostActions from 'lib/posts/actions';
import PostEditStore from 'lib/posts/post-edit-store';
import MediaDropZone from 'my-sites/media-library/drop-zone';
import MediaActions from 'lib/media/actions';
import MediaUtils from 'lib/media/utils';
import MediaLibrarySelectedStore from 'lib/media/library-selected-store';
import MediaValidationStore from 'lib/media/validation-store';
import markup from 'post-editor/media-modal/markup';
import MediaStore from 'lib/media/store';

const debug = debugModule( 'calypso:media' );

export default React.createClass( {
	displayName: 'TinyMCEDropZone',

	mixins: [ observe( 'sites' ) ],

	propTypes: {
		editor: PropTypes.object,
		sites: PropTypes.object,
		onInsertMedia: PropTypes.func,
		onRenderModal: PropTypes.func
	},

	getInitialState() {
		return {
			isDragging: false
		};
	},

	getDefaultProps() {
		return {
			onInsertMedia: noop,
			onRenderModal: noop
		};
	},

	componentDidMount() {
		const { editor } = this.props;
		editor.dom.bind( editor.getWin(), 'dragenter', this.redirectEditorDragEvent );
		window.addEventListener( 'dragleave', this.stopDragging );
		editor.dom.bind( editor.getWin(), 'dragleave', this.stopDragging );
		editor.dom.bind( editor.getWin(), 'dragover', this.fakeDragEnterIfNecessary );
	},

	componentWillUnmount() {
		const { editor } = this.props;
		editor.dom.unbind( editor.getWin(), 'dragenter', this.redirectEditorDragEvent );
		window.removeEventListener( 'dragleave', this.stopDragging );
		editor.dom.unbind( editor.getWin(), 'dragleave', this.stopDragging );
		editor.dom.unbind( editor.getWin(), 'dragover', this.fakeDragEnterIfNecessary );
	},

	redirectEditorDragEvent( event ) {
		// When an item is dragged over the iframe container, we need to copy
		// and dispatch the event to the parent window. We use the CustomEvent
		// constructor rather than MouseEvent because MouseEvent may lose some
		// vital properties that were part of the original event.
		//
		// See: https://core.trac.wordpress.org/ticket/19845#comment:36
		window.dispatchEvent( new CustomEvent( event.type, { detail: event } ) );
		this.setState( {
			isDragging: true
		} );
	},

	fakeDragEnterIfNecessary( event ) {
		// It was found that Chrome only triggered the `dragenter` event on
		// every odd drag over the iframe element. The logic here ensures that
		// if the more frequent `dragover` event occurs while not aware of a
		// drag, that we trigger a faked `dragenter` event.
		if ( this.state.isDragging ) {
			return;
		}

		this.redirectEditorDragEvent( Object.assign( {}, event, {
			type: 'dragenter'
		} ) );
	},

	stopDragging() {
		this.setState( {
			isDragging: false
		} );
	},

	beforeInsertMedia( files ) {
		if ( ! config.isEnabled( 'post-editor/image-reorientation' ) ) {
			return Promise.resolve();
		}

		const isSingleImage = 1 === files.length && 'image' === MediaUtils.getMimePrefix( files[ 0 ] );

		// This is a little tricky. If there's a single image that requires
		// re-orientation (due to exif data), then we need to block *all* saving
		// AND the updating of transient images within TinyMCE's editor.
		// This is because when an image is dragged in the drop-zone, if it needs
		// re-orientation then it is NOT inserted into the DOM until re-orientation
		// finishes.
		// Once re-orientation completes, we can unblock saving (handled in `afterInsertMedia`)
		if ( isSingleImage ) {
			return this._getImageOrientation( files[0] )
				.then( orientation => {
					if ( orientation > 1 ) {
						PostActions.blockSave( 'MEDIA_MODAL_IMAGE_TRANSFORMATION' );
					}
					return Promise.resolve();
				} );
		}

		return Promise.resolve();
	},

	insertMedia() {
		const { sites, onInsertMedia, onRenderModal } = this.props;
		const site = sites.getSelectedSite();

		if ( ! site ) {
			return Promise.resolve();
		}

		// Find selected images. Non-images will still be uploaded, but not
		// inserted directly into the post contents.
		const selectedItems = MediaLibrarySelectedStore.getAll( site.ID );
		const isSingleImage = 1 === selectedItems.length && 'image' === MediaUtils.getMimePrefix( selectedItems[ 0 ] );

		if ( isSingleImage && ! MediaValidationStore.hasErrors( site.ID ) ) {
			// For single image upload, insert into post content, blocking save
			// until the image has finished upload
			let selectedItem = selectedItems[ 0 ]
			if ( selectedItem.transient ) {
				PostActions.blockSave( 'MEDIA_MODAL_TRANSIENT_INSERT' );
			}

			analytics.mc.bumpStat( 'editor_upload_via', 'editor_drop' );

			if ( config.isEnabled( 'post-editor/image-reorientation' ) ) {
				let handleImageOrientation = ( orientation ) => {
					// If the orientation is `1` (i.e., "top"), then no further orientation
					// changes are necessary.
					if ( orientation > 1 ) {
						debug( 'Image orientation: %d', orientation );
						return this._modifyImageOrientation( selectedItem, orientation );
					}
					return Promise.resolve( selectedItem );
				}

				// Read Exif data first to determine orientation.
				return this._getImageOrientation( selectedItem.original )
					.then( handleImageOrientation )
					.then( result => onInsertMedia( markup.get( result ) ) )
					.then( () => MediaActions.setLibrarySelectedItems( site.ID, [] ) )
			}

			onInsertMedia( markup.get( selectedItem ) );
			MediaActions.setLibrarySelectedItems( site.ID, [] )
			return Promise.resolve()
		}

		// In all other cases, show the media modal list view
		onRenderModal( { visible: true } );
		return Promise.resolve()
	},

	afterInsertMedia() {
		if ( ! config.isEnabled( 'post-editor/image-reorientation' ) ) {
			return Promise.resolve();
		}
		// If saving was blocked due to images being transformed (such as re-orientation,
		// we can unblock it) and trigger a change to the `MediaStore`, thereby
		// forcing the media in the DOM to be updated with the uploaded values.
		if ( PostEditStore.isSaveBlocked( 'MEDIA_MODAL_IMAGE_TRANSFORMATION' ) ) {
			PostActions.unblockSave( 'MEDIA_MODAL_IMAGE_TRANSFORMATION' );
			MediaStore.emit( 'change' );
		}
	},

	render() {
		const { sites } = this.props;
		const site = sites.getSelectedSite();

		if ( ! site ) {
			return null;
		}

		return (
			<MediaDropZone
				site={ site }
				fullScreen={ false }
				trackStats={ false }
				onBeforeAddMedia= { this.beforeInsertMedia }
				onAddMedia={ this.insertMedia }
				onAfterAddMedia={ this.afterInsertMedia } />
		);
	},

	_getImageOrientation( file ) {
		// Attempt to retrieve orientation from cache
		this._orientationCache = this._orientationCache || {};
		const name = file.name;
		const orientation = this._orientationCache[ name ];
		if ( orientation ) {
		  return Promise.resolve( orientation );
		}

		return new Promise ( resolve => {
			loadImage.parseMetaData( file, data => {
				let orientation = data.exif ? data.exif.get( 'Orientation' ) : -1;
				this._orientationCache[ name ] = orientation;
				resolve( orientation );
			}, {
				// Save on computation by disabling the following Exif properties
				// (Although technically all Exif data is stored in the first 256 KiB,
				// so it's really not that *big* of a deal)
				disableExifThumbnail: true,
				disableExifSub: true,
				disableExifGps: true
			} );
		} );
	},

	_modifyImageOrientation( media, orientation ) {
		// Use `loadImage` do create a new image with the specified orientation.
		// Behind the scenes, `loadImage` does the following:
		// 		1. Create a canvas
		// 		2. Change the orientation
		//  	3. Assign the resulting data URI to the image
		const { editor } = this.props;
		return new Promise( resolve => {
			loadImage(
					media.URL,
					res => {
						if ( 'error' === res.type ) {
							// If an error occured, while unfortunate, we can still
							// proceed and simply use the unaltered image. Of course,
							// this will mean that the image orientation will not be
							// fixed when previewing.
							debug( 'Failed to orient image. Defaulting to unaltered state' );
						} else {
							media.URL = res.toDataURL()
						}
						resolve( media )
					}, {
						orientation: orientation,
						// Limit the width of the resulting image to the width of
						// TinyMCE's body. This will result in the constructed image
						// to be of a *reasonable* file size, otherwise large images
						// will have debilitatingly large data URIs, which will
						// adversely affect UX.
						maxWidth: editor.getBody().clientWidth
					}
			);
		} );
	}

} );
