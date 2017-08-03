/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import observe from 'lib/mixins/data-observe';
import PostActions from 'lib/posts/actions';
import MediaDropZone from 'my-sites/media-library/drop-zone';
import MediaActions from 'lib/media/actions';
import MediaUtils from 'lib/media/utils';
import MediaLibrarySelectedStore from 'lib/media/library-selected-store';
import MediaValidationStore from 'lib/media/validation-store';
import markup from 'post-editor/media-modal/markup';

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

	insertMedia() {
		const { sites, onInsertMedia, onRenderModal } = this.props;
		const site = sites.getSelectedSite();

		if ( ! site ) {
			return;
		}

		// Find selected images. Non-images will still be uploaded, but not
		// inserted directly into the post contents.
		const selectedItems = MediaLibrarySelectedStore.getAll( site.ID );
		const isSingleImage = 1 === selectedItems.length && 'image' === MediaUtils.getMimePrefix( selectedItems[ 0 ] );

		if ( isSingleImage && ! MediaValidationStore.hasErrors( site.ID ) ) {
			// For single image upload, insert into post content, blocking save
			// until the image has finished upload
			if ( selectedItems[ 0 ].transient ) {
				PostActions.blockSave( 'MEDIA_MODAL_TRANSIENT_INSERT' );
			}

			onInsertMedia( markup.get( site, selectedItems[ 0 ] ) );
			MediaActions.setLibrarySelectedItems( site.ID, [] );
		} else {
			// In all other cases, show the media modal list view
			onRenderModal( { visible: true } );
		}

		analytics.mc.bumpStat( 'editor_upload_via', 'editor_drop' );
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
				onAddMedia={ this.insertMedia } />
		);
	}
} );
