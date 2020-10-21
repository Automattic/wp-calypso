/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { isEmpty, noop } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { bumpStat } from 'calypso/lib/analytics/mc';
import getMediaErrors from 'calypso/state/selectors/get-media-errors';
import getMediaLibrarySelectedItems from 'calypso/state/selectors/get-media-library-selected-items';
import MediaDropZone from 'calypso/my-sites/media-library/drop-zone';
import { getMimePrefix } from 'calypso/lib/media/utils';
import markup from 'calypso/post-editor/media-modal/markup';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { blockSave } from 'calypso/state/editor/save-blockers/actions';
import { setMediaLibrarySelectedItems } from 'calypso/state/media/actions';

class TinyMCEDropZone extends React.Component {
	static propTypes = {
		editor: PropTypes.object,
		onInsertMedia: PropTypes.func,
		onRenderModal: PropTypes.func,
	};

	static defaultProps = {
		onInsertMedia: noop,
		onRenderModal: noop,
	};

	state = {
		isDragging: false,
	};

	componentDidMount() {
		const { editor } = this.props;
		editor.dom.bind( editor.getWin(), 'dragenter', this.redirectEditorDragEvent );
		window.addEventListener( 'dragleave', this.stopDragging );
		editor.dom.bind( editor.getWin(), 'dragleave', this.stopDragging );
		editor.dom.bind( editor.getWin(), 'dragover', this.fakeDragEnterIfNecessary );
	}

	componentWillUnmount() {
		const { editor } = this.props;
		window.removeEventListener( 'dragleave', this.stopDragging );
		if ( editor.getWin() ) {
			editor.dom.unbind( editor.getWin(), 'dragenter', this.redirectEditorDragEvent );
			editor.dom.unbind( editor.getWin(), 'dragleave', this.stopDragging );
			editor.dom.unbind( editor.getWin(), 'dragover', this.fakeDragEnterIfNecessary );
		}
	}

	redirectEditorDragEvent = ( event ) => {
		// When an item is dragged over the iframe container, we need to copy
		// and dispatch the event to the parent window. We use the CustomEvent
		// constructor rather than MouseEvent because MouseEvent may lose some
		// vital properties that were part of the original event.
		//
		// See: https://core.trac.wordpress.org/ticket/19845#comment:36
		window.dispatchEvent( new window.CustomEvent( event.type, { detail: event } ) );
		this.setState( {
			isDragging: true,
		} );
	};

	fakeDragEnterIfNecessary = ( event ) => {
		// It was found that Chrome only triggered the `dragenter` event on
		// every odd drag over the iframe element. The logic here ensures that
		// if the more frequent `dragover` event occurs while not aware of a
		// drag, that we trigger a faked `dragenter` event.
		if ( this.state.isDragging ) {
			return;
		}

		this.redirectEditorDragEvent(
			Object.assign( {}, event, {
				type: 'dragenter',
			} )
		);
	};

	stopDragging = () => {
		this.setState( {
			isDragging: false,
		} );
	};

	insertMedia = () => {
		const { site, onInsertMedia, onRenderModal, mediaValidationErrors, selectedItems } = this.props;

		if ( ! site ) {
			return;
		}

		// Non-images will still be uploaded, but not inserted directly into the post contents.
		const isSingleImage =
			1 === selectedItems.length && 'image' === getMimePrefix( selectedItems[ 0 ] );

		if ( isSingleImage && isEmpty( mediaValidationErrors ) ) {
			// For single image upload, insert into post content, blocking save
			// until the image has finished upload
			if ( selectedItems[ 0 ].transient ) {
				this.props.blockSave( 'MEDIA_MODAL_TRANSIENT_INSERT' );
			}

			onInsertMedia( markup.get( site, selectedItems[ 0 ] ) );
			this.props.setMediaLibrarySelectedItems( site.ID, [] );
		} else {
			// In all other cases, show the media modal list view
			onRenderModal( { visible: true } );
		}

		bumpStat( 'editor_upload_via', 'editor_drop' );
	};

	render() {
		const { site } = this.props;

		if ( ! site ) {
			return null;
		}

		return (
			<MediaDropZone
				site={ site }
				fullScreen={ false }
				trackStats={ false }
				onAddMedia={ this.insertMedia }
			/>
		);
	}
}

export default connect(
	( state ) => {
		const site = getSelectedSite( state );

		return {
			site,
			mediaValidationErrors: getMediaErrors( state, site?.ID ),
			selectedItems: getMediaLibrarySelectedItems( state, site?.ID ),
		};
	},
	{ blockSave, setMediaLibrarySelectedItems }
)( TinyMCEDropZone );
