/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import noop from 'lodash/noop';
import path from 'path';

/**
 * Internal dependencies
 */
import EditCanvas from './image-editor-canvas';
import EditToolbar from './image-editor-toolbar';
import EditButtons from './image-editor-buttons';
import MediaActions from 'lib/media/actions';
import MediaUtils from 'lib/media/utils';
import {
	resetImageEditorState,
	setImageEditorFileInfo
} from 'state/ui/editor/image-editor/actions';
import {
	getImageEditorFileInfo
} from 'state/ui/editor/image-editor/selectors';

const MediaModalImageEditor = React.createClass( {
	displayName: 'MediaModalImageEditor',

	propTypes: {
		site: React.PropTypes.object,
		items: React.PropTypes.array,
		selectedIndex: React.PropTypes.number,
		src: React.PropTypes.string,
		fileName: React.PropTypes.string,
		mimeType: React.PropTypes.string,
		setImageEditorFileInfo: React.PropTypes.func,
		onImageEditorClose: React.PropTypes.func
	},

	getDefaultProps() {
		return {
			selectedIndex: 0,
			onImageEditorClose: noop
		};
	},

	componentDidMount() {
		let src,
			fileName = 'default',
			mimeType = 'image/png';

		const media = this.props.items ? this.props.items[ this.props.selectedIndex ] : null;

		if ( media ) {
			src = MediaUtils.url( media, {
				photon: this.props.site && ! this.props.site.is_private
			} );
			fileName = media.file || path.basename( src );
			mimeType = MediaUtils.getMimeType( media );
		}

		this.props.resetImageEditorState();
		this.props.setImageEditorFileInfo( src, fileName, mimeType );
	},

	onDone() {
		const canvasComponent = this.refs.editCanvas.getWrappedInstance();
		canvasComponent.toBlob( this.onImageExtracted );
		this.props.onImageEditorClose( null, { hasEditedImage: true } );
	},

	onImageExtracted( blob ) {
		const mimeType = MediaUtils.getMimeType( this.props.fileName );

		MediaActions.add( this.props.site.ID, {
			fileName: this.props.fileName,
			fileContents: blob,
			mimeType: mimeType
		} );
	},

	isValidTransfer: function( transfer ) {
		if ( ! transfer ) {
			return false;
		}

		// Firefox will claim that images dragged from within the same page are
		// files, but will also identify them with a `mozSourceNode` attribute.
		// This value will be `null` for files dragged from outside the page.
		//
		// See: https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/mozSourceNode
		if ( transfer.mozSourceNode ) {
			return false;
		}

		// `types` is a DOMStringList, which is treated as an array in Chrome,
		// but as an array-like object in Firefox. Therefore, we call `indexOf`
		// using the Array prototype. Safari may pass types as `null` which
		// makes detection impossible, so we err on allowing the transfer.
		//
		// See: http://www.w3.org/html/wg/drafts/html/master/editing.html#the-datatransfer-interface
		return ! transfer.types || -1 !== Array.prototype.indexOf.call( transfer.types, 'Files' );
	},

	render() {
		return (
			<div className="editor-media-modal-image-editor">
				<figure>
					<div className="editor-media-modal-image-editor__content editor-media-modal__content" >
						<EditCanvas ref="editCanvas" />
						<EditToolbar />
						<EditButtons
							onCancel={ this.props.onImageEditorClose }
							onDone={ this.onDone } />
					</div>
				</figure>
			</div>
		);
	}
} );

export default connect(
	( state ) => ( getImageEditorFileInfo( state ) ),
	{ resetImageEditorState, setImageEditorFileInfo }
)( MediaModalImageEditor );
