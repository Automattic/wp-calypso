/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import path from 'path';
import Gridicon from 'gridicons';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { ALLOWED_FILE_EXTENSIONS, ERROR_STRINGS, ERROR_UNSUPPORTED_FILE } from './constants';
import { AspectRatios } from 'state/ui/editor/image-editor/constants';
import Dialog from 'components/dialog';
import FilePicker from 'components/file-picker';
import { resetAllImageEditorState } from 'state/ui/editor/image-editor/actions';
import Spinner from 'components/spinner';
import ImageEditor from 'blocks/image-editor';
import DropZone from 'components/drop-zone';

class UploadImage extends Component {
	state = {
		isEditingImage: false,
		uploadedImage: null,
		editedImage: null,
		uploadedImageName: '',
	};

	static propTypes = {
		isUploading: PropTypes.bool,
		// Additional props passed to ImageEditor component. See blocks/image-editor.
		imageEditorProps: PropTypes.object,
		onImageEditorDone: PropTypes.func,
		additionalImageEditorClasses: PropTypes.string,
		additionalClasses: PropTypes.string,
		placeholderContent: PropTypes.element,
		uploadingContent: PropTypes.element,
		doneButtonText: PropTypes.string,
		addAnImage: PropTypes.string,
		dragUploadText: PropTypes.string,
		onError: PropTypes.func,
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
			uploadedImage: imageObjectUrl,
			uploadedImageName: fileName,
		} );
	};

	onImageEditorDone = ( error, imageBlob, imageEditorProps ) => {
		this.setState( { editedImage: URL.createObjectURL( imageBlob ) } );

		this.props.onImageEditorDone( error, imageBlob, imageEditorProps );

		this.hideImageEditor();
	};

	hideImageEditor = () => {
		const { resetAllImageEditorState: resetAllImageEditorStateAction } = this.props;

		resetAllImageEditorStateAction();

		URL.revokeObjectURL( this.state.uploadedImage );

		this.setState( {
			isEditingImage: false,
			uploadedImage: false,
			uploadedImageName: '',
		} );
	};

	renderImageEditor() {
		const { isEditingImage, uploadedImage, uploadedImageName } = this.state;

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
						src: uploadedImage,
						file: uploadedImageName,
					} }
					onDone={ this.onImageEditorDone }
					onCancel={ this.hideImageEditor }
					doneButtonText={ doneButtonText ? doneButtonText : 'Done' }
				/>
			</Dialog>
		);
	}

	componentWillUnmount() {
		URL.revokeObjectURL( this.state.editedImage );

		this.setState( {
			editedImage: null,
		} );
	}

	render() {
		const {
			children,
			isUploading,
			translate,
			additionalClasses,
			addAnImage,
			dragUploadText,
		} = this.props;

		let { placeholderContent, uploadingContent } = this.props;

		if ( typeof placeholderContent === 'undefined' ) {
			placeholderContent = (
				<div className="upload-image__placeholder">
					<Gridicon icon="add-image" size={ 36 } />
					<span>
						{ addAnImage ? addAnImage : translate( 'Add an Image' ) }
					</span>
				</div>
			);
		}

		if ( typeof uploadingContent === 'undefined' ) {
			const { editedImage } = this.state;

			uploadingContent = (
				<div className="upload-image__uploading-container">
					<img src={ editedImage } />
					<Spinner className="upload-image__spinner" size={ 20 } />
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

						{ children }

						{ ! isUploading && placeholderContent }
						{ isUploading && uploadingContent }
					</div>
				</FilePicker>
			</div>
		);
	}
}

export default connect( null, {
	resetAllImageEditorState,
} )( localize( UploadImage ) );
