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
import { bumpStat } from 'lib/analytics/mc';
import getMediaErrors from 'state/selectors/get-media-errors';
import MediaDropZone from 'my-sites/media-library/drop-zone';
import MediaActions from 'lib/media/actions';
import { getMimePrefix } from 'lib/media/utils';
import MediaLibrarySelectedStore from 'lib/media/library-selected-store';
import markup from 'post-editor/media-modal/markup';
import { getSelectedSite } from 'state/ui/selectors';
import { blockSave } from 'state/ui/editor/save-blockers/actions';

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

	redirectEditorDragEvent = event => {
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

	fakeDragEnterIfNecessary = event => {
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
		const { site, onInsertMedia, onRenderModal, mediaValidationErrors } = this.props;

		if ( ! site ) {
			return;
		}

		// Find selected images. Non-images will still be uploaded, but not
		// inserted directly into the post contents.
		const selectedItems = MediaLibrarySelectedStore.getAll( site.ID );
		const isSingleImage =
			1 === selectedItems.length && 'image' === getMimePrefix( selectedItems[ 0 ] );

		if ( isSingleImage && isEmpty( mediaValidationErrors ) ) {
			// For single image upload, insert into post content, blocking save
			// until the image has finished upload
			if ( selectedItems[ 0 ].transient ) {
				this.props.blockSave( 'MEDIA_MODAL_TRANSIENT_INSERT' );
			}

			onInsertMedia( markup.get( site, selectedItems[ 0 ] ) );
			MediaActions.setLibrarySelectedItems( site.ID, [] );
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
	state => {
		const site = getSelectedSite( state );

		return {
			site,
			mediaValidationErrors: getMediaErrors( state, site?.ID ),
		};
	},
	{ blockSave }
)( TinyMCEDropZone );
