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
import {
	ALLOWED_FILE_EXTENSIONS,
	ERROR_UNSUPPORTED_FILE,
	ERROR_IMAGE_EDITOR_DONE,
	ERROR_UPLOADING_IMAGE,
} from './constants';
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
import MediaValidationStore from 'lib/media/validation-store';
import { ValidationErrors } from 'lib/media/constants';
import Button from 'components/button';

class UploadImage extends Component {
	state = {
		isUploading: false,
		isEditingImage: false,
		selectedImage: null,
		selectedImageName: '',
		editedImage: null,
		uploadedImage: null,
		errors: [],
	};

	static propTypes = {
		// If not supplied, currently selected site will be used.
		siteId: PropTypes.number,

		// Additional props passed to ImageEditor component. See blocks/image-editor.
		imageEditorProps: PropTypes.object,

		additionalImageEditorClasses: PropTypes.string,
		additionalClasses: PropTypes.string,
		imagePickerContent: PropTypes.element,
		uploadingContent: PropTypes.element,
		uploadingDoneContent: PropTypes.element,
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

	static uploadingImageTransientId = null;

	receiveFiles = files => {
		const { translate } = this.props;

		const fileName = files[ 0 ].name;
		const extension = path.extname( fileName ).toLowerCase().substring( 1 );

		if ( ALLOWED_FILE_EXTENSIONS.indexOf( extension ) === -1 ) {
			this.handleError(
				ERROR_UNSUPPORTED_FILE,
				translate(
					'File you are trying to upload is not supported. Please select a valid image file.',
				),
			);

			return;
		}

		const imageObjectUrl = URL.createObjectURL( files[ 0 ] );

		this.setState( {
			isEditingImage: true,
			selectedImage: imageObjectUrl,
			selectedImageName: fileName,
		} );
	};

	handleError = ( errorCode, error = '' ) => {
		const { onError, translate } = this.props;

		let message = error;

		if ( errorCode === ERROR_UPLOADING_IMAGE ) {
			if ( error.length && error[ 0 ] === ValidationErrors.SERVER_ERROR ) {
				message = translate(
					'File could not be uploaded because an error occurred while uploading.',
				);
			}
		}

		onError( errorCode, message );
	};

	onImageEditorDone = ( error, imageBlob, imageEditorProps ) => {
		if ( error ) {
			this.handleError( ERROR_IMAGE_EDITOR_DONE, error );
		}

		this.setState( {
			editedImage: URL.createObjectURL( imageBlob ),
			isUploading: true,
		} );

		MediaStore.off( 'change', this.handleMediaStoreChange );
		MediaValidationStore.off( 'change', this.storeValidationErrors );

		this.props.onImageEditorDone( imageBlob, imageEditorProps );

		this.uploadImage( imageBlob, imageEditorProps );

		this.hideImageEditor();
	};

	uploadImage( imageBlob, imageEditorProps ) {
		const { siteId } = this.props;

		const { fileName, mimeType } = imageEditorProps;

		const transientImageId = uniqueId( 'upload-image-' );

		this.uploadingImageTransientId = transientImageId;

		const item = {
			ID: transientImageId,
			fileName: fileName,
			fileContents: imageBlob,
			mimeType: mimeType,
		};

		MediaValidationStore.on( 'change', this.storeValidationErrors );

		MediaStore.on( 'change', this.handleMediaStoreChange );

		// Upload the image.
		MediaActions.add( siteId, item );

		this.setState( { isUploading: true } );
	}

	// Handle the uploading process.
	handleMediaStoreChange = () => {
		const { siteId, onUploadImageDone } = this.props;

		const { errors } = this.state;

		const uploadedImage = MediaStore.get( siteId, this.uploadingImageTransientId );
		const isUploadInProgress = uploadedImage && MediaUtils.isItemBeingUploaded( uploadedImage );

		if ( isUploadInProgress ) {
			return;
		}

		// File has finished uploading or failed.
		this.setState( {
			isUploading: false,
		} );

		if ( uploadedImage && uploadedImage.URL ) {
			this.uploadingImageTransientId = null;

			this.setState( { uploadedImage } );

			MediaStore.off( 'change', this.handleMediaStoreChange );

			onUploadImageDone( uploadedImage );

			return;
		}

		const validationErrors = errors[ this.uploadingImageTransientId ] || [];
		this.handleError( ERROR_UPLOADING_IMAGE, validationErrors );
	};

	storeValidationErrors = () => {
		this.setState( {
			errors: MediaValidationStore.getAllErrors( this.props.siteId ),
		} );
	};

	hideImageEditor = () => {
		this.props.resetAllImageEditorState();

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

	removeUploadedImage = () => {
		this.setState( { uploadedImage: null } );
	};

	componentWillUnmount() {
		const { selectedImage, editedImage } = this.state;

		URL.revokeObjectURL( selectedImage );
		URL.revokeObjectURL( editedImage );

		MediaStore.off( 'change', this.handleMediaStoreChange );
		MediaValidationStore.off( 'change', this.storeValidationErrors );

		this.uploadingImageTransientId = null;
	}

	renderImagePickerContent() {
		const { imagePickerContent, addAnImageText, translate } = this.props;

		if ( imagePickerContent ) {
			return imagePickerContent;
		}

		return (
			<FilePicker accept="image/*" onPick={ this.receiveFiles }>
				<div className="upload-image__image-picker">
					<Gridicon icon="add-image" size={ 36 } />
					<span>
						{ addAnImageText || translate( 'Add an Image' ) }
					</span>
				</div>
			</FilePicker>
		);
	}

	renderUploadingContent() {
		const { uploadingContent } = this.props;

		const { editedImage } = this.state;

		if ( uploadingContent ) {
			return uploadingContent;
		}

		return (
			<div className="upload-image__uploading-container">
				<img src={ editedImage } className="upload-image__uploading-image" />
				<Spinner className="upload-image__spinner" size={ 20 } />
			</div>
		);
	}

	renderUploadingDoneContent() {
		const { uploadingDoneContent } = this.props;

		const { uploadedImage } = this.state;

		if ( uploadingDoneContent ) {
			return uploadingDoneContent;
		}

		if ( uploadedImage && uploadedImage.URL ) {
			return (
				<div className="upload-image__uploading-done-container">
					<Button
						onClick={ this.removeUploadedImage }
						compact
						className="upload-image__uploaded-image-remove"
					>
						<Gridicon
							icon="cross"
							size={ 24 }
							className="upload-image__uploaded-image-remove-icon"
						/>
					</Button>
					<div className="upload-image__uploaded-image-wrapper">
						<img src={ uploadedImage.URL } className="upload-image__uploaded-image" />
						<Gridicon
							icon="pencil"
							size={ 18 }
							className="upload-image__uploaded-image-edit-icon"
						/>
					</div>
				</div>
			);
		}

		return null;
	}

	render() {
		const { translate, additionalClasses, dragUploadText } = this.props;

		const { isUploading, uploadedImage } = this.state;

		return (
			<div className={ classnames( 'upload-image', additionalClasses ) }>
				{ this.renderImageEditor() }
				<div
					className={ classnames( 'upload-image__image-container', {
						'is-uploading': isUploading,
						'is-uploaded': ! isUploading && uploadedImage,
					} ) }
				>
					<DropZone
						textLabel={ dragUploadText ? dragUploadText : translate( 'Drop to upload image' ) }
						onFilesDrop={ this.receiveFiles }
					/>

					{ ! isUploading && ! uploadedImage && this.renderImagePickerContent() }
					{ isUploading && this.renderUploadingContent() }
					{ ! isUploading && uploadedImage && this.renderUploadingDoneContent() }
				</div>
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
