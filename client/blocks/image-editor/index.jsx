/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import noop from 'lodash/noop';
import path from 'path';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import EditCanvas from './image-editor-canvas';
import EditToolbar from './image-editor-toolbar';
import EditButtons from './image-editor-buttons';
import MediaActions from 'lib/media/actions';
import MediaUtils from 'lib/media/utils';
import closeOnEsc from 'lib/mixins/close-on-esc';
import {
	resetImageEditorState,
	resetAllImageEditorState,
	setImageEditorFileInfo
} from 'state/ui/editor/image-editor/actions';
import {
	getImageEditorFileInfo
} from 'state/ui/editor/image-editor/selectors';

const MediaModalImageEditor = React.createClass( {
	mixins: [ closeOnEsc( 'onCancel' ) ],

	displayName: 'MediaModalImageEditor',

	propTypes: {
		site: React.PropTypes.object,
		items: React.PropTypes.array,
		selectedIndex: React.PropTypes.number,
		src: React.PropTypes.string,
		fileName: React.PropTypes.string,
		mimeType: React.PropTypes.string,
		setImageEditorFileInfo: React.PropTypes.func,
		title: React.PropTypes.string,
		translate: React.PropTypes.func,
		onImageEditorClose: React.PropTypes.func,
		onImageEditorCancel: React.PropTypes.func
	},

	getDefaultProps() {
		return {
			selectedIndex: 0,
			onImageEditorClose: noop,
			onImageEditorCancel: noop
		};
	},

	getInitialState() {
		return {
			canvasError: null
		};
	},

	componentDidMount() {
		let src,
			fileName = 'default',
			mimeType = 'image/png',
			title = 'default';

		const media = this.props.items ? this.props.items[ this.props.selectedIndex ] : null;

		if ( media ) {
			src = MediaUtils.url( media, {
				photon: this.props.site && ! this.props.site.is_private
			} );
			fileName = media.file || path.basename( src );
			mimeType = MediaUtils.getMimeType( media );
			title = media.title;
		}

		this.props.resetImageEditorState();
		this.props.setImageEditorFileInfo( src, fileName, mimeType, title );
	},

	onDone() {
		const canvasComponent = this.refs.editCanvas.getWrappedInstance();
		canvasComponent.toBlob( this.onImageExtracted );

		if ( this.props.onImageEditorClose ) {
			this.props.onImageEditorClose();
		}
	},

	onCancel() {
		this.props.resetAllImageEditorState();

		if ( this.props.onImageEditorCancel ) {
			this.props.onImageEditorCancel();
		}
	},

	onImageExtracted( blob ) {
		const {
			fileName,
			site,
			translate
		} = this.props;

		const mimeType = MediaUtils.getMimeType( fileName );

		// check if a title is already post-fixed with '(edited copy)'
		const editedCopyText = translate(
			'%(title)s (edited copy)', {
				args: {
					title: ''
				}
			} );

		let { title } = this.props;

		if ( title.indexOf( editedCopyText ) === -1 ) {
			title = translate(
				'%(title)s (edited copy)', {
					args: {
						title: title
					}
				} );
		}

		this.props.resetAllImageEditorState();

		MediaActions.add( site.ID, {
			fileName: fileName,
			fileContents: blob,
			title: title,
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

	onLoadCanvasError() {
		this.setState( { canvasError: this.translate( 'We are unable to edit this image.' ) } );
	},

	renderError() {
		return (
			<Notice
				status="is-error"
				showDismiss={ true }
				text={ this.state.canvasError }
				isCompact={ false }
				onDismissClick={ this.props.onImageEditorCancel } 	/>
		);
	},

	render() {
		return (
			<div className="image-editor">
				{ this.state.canvasError && this.renderError() }

				<figure>
					<div className="editor-media-modal-image-editor__content editor-media-modal__content" >
						<EditCanvas
							ref="editCanvas"
							onLoadError={ this.onLoadCanvasError }
							/>
						<EditToolbar />
						<EditButtons
							onCancel={ this.onCancel }
							onDone={ this.onDone } />
					</div>
				</figure>
			</div>
		);
	}
} );

export default connect(
	( state ) => ( getImageEditorFileInfo( state ) ),
	{
		resetImageEditorState,
		resetAllImageEditorState,
		setImageEditorFileInfo
	}
)( localize( MediaModalImageEditor ) );
