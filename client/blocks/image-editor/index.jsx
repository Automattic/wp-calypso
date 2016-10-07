/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { noop } from 'lodash';
import path from 'path';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import ImageEditorCanvas from './image-editor-canvas';
import ImageEditorToolbar from './image-editor-toolbar';
import ImageEditorButtons from './image-editor-buttons';
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

const ImageEditor = React.createClass( {
	mixins: [ closeOnEsc( 'onCancel' ) ],

	propTypes: {
		site: PropTypes.object,
		items: PropTypes.array,
		selectedIndex: PropTypes.number,
		src: PropTypes.string,
		fileName: PropTypes.string,
		mimeType: PropTypes.string,
		setImageEditorFileInfo: PropTypes.func,
		title: PropTypes.string,
		translate: PropTypes.func,
		onImageEditorClose: PropTypes.func,
		onImageEditorCancel: PropTypes.func,
		additionalClasses: PropTypes.string
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
		const {
			items,
			selectedIndex,
			site
		} = this.props;

		let src,
			fileName = 'default',
			mimeType = 'image/png',
			title = 'default';

		const media = items ? items[ selectedIndex ] : null;

		if ( media ) {
			src = MediaUtils.url( media, {
				photon: site && ! site.is_private
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
		const {
			additionalClasses
		} = this.props;

		const classes = classNames(
			'image-editor',
			additionalClasses
		);

		return (
			<div className={ classes }>
				{ this.state.canvasError && this.renderError() }

				<figure>
					<div className="image-editor__content">
						<ImageEditorCanvas
							ref="editCanvas"
							onLoadError={ this.onLoadCanvasError }
						/>
						<ImageEditorToolbar />
						<ImageEditorButtons
							onCancel={ this.onCancel }
							onDone={ this.onDone }
						/>
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
)( localize( ImageEditor ) );
