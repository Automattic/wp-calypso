/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import path from 'path';
import Gridicon from 'gridicons';
import { noop, uniqueId } from 'lodash';

/**
 * Internal dependencies
 */
import { ALLOWED_FILE_EXTENSIONS, ERROR_STRINGS, ERROR_UNSUPPORTED_FILE } from './constants';
import { AspectRatios } from 'state/ui/editor/image-editor/constants';
import { getSelectedSiteId } from 'state/ui/selectors';
import Dialog from 'components/dialog';
import FilePicker from 'components/file-picker';
import { resetAllImageEditorState } from 'state/ui/editor/image-editor/actions';
import Spinner from 'components/spinner';
import ImageEditor from 'blocks/image-editor';
import DropZone from 'components/drop-zone';
import MediaActions from 'lib/media/actions';
import MediaStore from 'lib/media/store';
import MediaUtils from 'lib/media/utils';

class UploadImage extends Component {
	state = {
		isUploading: false,
		isEditingImage: false,
		selectedImage: null,
		selectedImageName: '',
		editedImage: null,
		uploadedImage: null,
		uploadingImageTransientId: null,
	};

	static propTypes = {
		siteId: PropTypes.number,
		// Additional props passed to ImageEditor component. See blocks/image-editor.
		imageEditorProps: PropTypes.object,
		additionalImageEditorClasses: PropTypes.string,
		additionalClasses: PropTypes.string,
		placeholderContent: PropTypes.element,
		uploadingContent: PropTypes.element,
		doneButtonText: PropTypes.string,
		addAnImageText: PropTypes.string,
		dragUploadText: PropTypes.string,
		onError: PropTypes.func,
		onImageEditorDone: PropTypes.func,
		onUploadImageDone: PropTypes.func,
	};

	static defaultProps = {
		imageEditorProps: {
			defaultAspectRatio: AspectRatios.ORIGINAL,
		},
		backgroundContent: null,
		onImageEditorDone: noop,
		onError: noop,
		isUploading: false,
	};

	receiveFiles = files => {
		const fileName = files[ 0 ].name;
		const extension = path.extname( fileName ).toLowerCase().substring( 1 );

		const { onError } = this.props;

		if ( ALLOWED_FILE_EXTENSIONS.indexOf( extension ) === -1 ) {
			onError( ERROR_UNSUPPORTED_FILE, ERROR_STRINGS[ ERROR_UNSUPPORTED_FILE ]() );

			return;
		}

		const imageObjectUrl = URL.createObjectURL( files[ 0 ] );

		this.setState( {
			isEditingImage: true,
			selectedImage: imageObjectUrl,
			selectedImageName: fileName,
		} );
	};

	onImageEditorDone = ( error, imageBlob, imageEditorProps ) => {
		this.setState( {
			editedImage: URL.createObjectURL( imageBlob ),
			isUploading: true,
		} );

		MediaStore.off( 'change', this.handleMediaStoreChange );

		this.props.onImageEditorDone( error, imageBlob, imageEditorProps );

		this.uploadImage( imageBlob, imageEditorProps );

		this.hideImageEditor();
	};

	uploadImage( imageBlob, imageEditorProps ) {
		const { siteId } = this.props;

		const { fileName, mimeType } = imageEditorProps;

		const transientImageId = uniqueId( 'upload-image-' );

		const item = {
			ID: transientImageId,
			fileName: fileName,
			fileContents: imageBlob,
			mimeType: mimeType,
		};

		MediaStore.on( 'change', this.handleMediaStoreChange );

		// Upload the image.
		MediaActions.add( siteId, item );

		this.setState( { uploadingImageTransientId: transientImageId, isUploading: true } );
	}

	// Handle the uploading process.
	handleMediaStoreChange = () => {
		const { siteId, onUploadImageDone } = this.props;

		const { uploadingImageTransientId } = this.state;

		const uploadedImage = MediaStore.get( siteId, uploadingImageTransientId );
		const isUploadInProgress = uploadedImage && MediaUtils.isItemBeingUploaded( uploadedImage );

		// File has finished uploading or failed.
		if ( ! isUploadInProgress ) {
			this.setState( {
				isUploading: false,
			} );

			if ( uploadedImage && uploadedImage.URL ) {
				this.setState( { uploadedImage: uploadedImage, uploadingImageTransientId: null } );

				MediaStore.off( 'change', this.handleMediaStoreChange );

				onUploadImageDone( uploadedImage );
			}
		}
	};

	hideImageEditor = () => {
		const { resetAllImageEditorState: resetAllImageEditorStateAction } = this.props;

		resetAllImageEditorStateAction();

		URL.revokeObjectURL( this.state.selectedImage );

		this.setState( {
			isEditingImage: false,
			selectedImage: null,
			selectedImageName: '',
		} );
	};

	renderImageEditor() {
		const { isEditingImage, selectedImage, selectedImageName } = this.state;

		if ( ! isEditingImage ) {
			return null;
		}

		const { additionalImageEditorClasses, imageEditorProps, doneButtonText } = this.props;

		const classes = classnames( 'upload-image-modal', additionalImageEditorClasses );

		return (
			<Dialog additionalClassNames={ classes } isVisible={ true }>
				<ImageEditor
					{ ...imageEditorProps }
					media={ {
						src: selectedImage,
						file: selectedImageName,
					} }
					onDone={ this.onImageEditorDone }
					onCancel={ this.hideImageEditor }
					doneButtonText={ doneButtonText ? doneButtonText : 'Done' }
				/>
			</Dialog>
		);
	}

	componentWillUnmount() {
		const { selectedImage, editedImage } = this.state;

		URL.revokeObjectURL( selectedImage );
		URL.revokeObjectURL( editedImage );

		MediaStore.off( 'change', this.handleMediaStoreChange );
	}

	render() {
		const { translate, additionalClasses, addAnImageText, dragUploadText } = this.props;

		const { editedImage, isUploading, uploadedImage } = this.state;

		let { placeholderContent, uploadingContent, uploadingDoneContent } = this.props;

		if ( typeof placeholderContent === 'undefined' ) {
			placeholderContent = (
				<div className="upload-image__placeholder">
					<Gridicon icon="add-image" size={ 36 } />
					<span>
						{ addAnImageText ? addAnImageText : translate( 'Add an Image' ) }
					</span>
				</div>
			);
		}

		if ( typeof uploadingContent === 'undefined' ) {
			uploadingContent = (
				<div className="upload-image__uploading-container">
					<img src={ editedImage } />
					<Spinner className="upload-image__spinner" size={ 20 } />
				</div>
			);
		}

		if ( typeof uploadingDoneContent === 'undefined' && uploadedImage && uploadedImage.URL ) {
			uploadingDoneContent = (
				<div className="upload-image__uploading-done-container">
					<img src={ uploadedImage.URL } />
					Image is uploaded
				</div>
			);
		}

		return (
			<div className={ classnames( 'upload-image', additionalClasses ) }>
				{ this.renderImageEditor() }

				<FilePicker accept="image/*" onPick={ this.receiveFiles }>
					<div
						className={ classnames( 'upload-image__image-container', {
							'is-uploading': isUploading,
						} ) }
					>
						<DropZone
							textLabel={ dragUploadText ? dragUploadText : translate( 'Drop to upload image' ) }
							onFilesDrop={ this.receiveFiles }
						/>

						{ ! isUploading && ! uploadedImage && placeholderContent }
						{ isUploading && uploadingContent }
						{ ! isUploading && uploadedImage && uploadingDoneContent }
					</div>
				</FilePicker>
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		let { siteId } = ownProps;

		if ( ! siteId ) {
			siteId = getSelectedSiteId( state );
		}

		return {
			siteId,
		};
	},
	{
		resetAllImageEditorState,
	},
)( localize( UploadImage ) );
