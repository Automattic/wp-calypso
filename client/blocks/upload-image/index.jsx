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
import { ALLOWED_FILE_EXTENSIONS } from './constants';
import {
	AspectRatios,
	AspectRatiosValues,
} from 'state/ui/editor/image-editor/constants';
import Dialog from 'components/dialog';
import FilePicker from 'components/file-picker';
import {
	resetAllImageEditorState
} from 'state/ui/editor/image-editor/actions';
import Spinner from 'components/spinner';
import ImageEditor from 'blocks/image-editor';
import DropZone from 'components/drop-zone';

class UploadImage extends Component {
	state = {
		isEditingImage: false,
		image: false,
	};

	static propTypes = {
		isUploading: PropTypes.bool,
		allowedAspectRatios: PropTypes.arrayOf( PropTypes.oneOf( AspectRatiosValues ) ),
		texts: PropTypes.object,
		onImageEditorDone: PropTypes.func,
		additionalImageEditorClasses: PropTypes.string,
		additionalClasses: PropTypes.string,
	};

	static defaultProps = {
		allowedAspectRatios: [ AspectRatios.ASPECT_1X1 ],
		texts: {},
		backgroundContent: null,
		onImageEditorDone: noop,
		isUploading: false,
	};

	onReceiveFile = ( files ) => {
		const extension = path.extname( files[ 0 ].name )
			.toLowerCase()
			.substring( 1 );

		if ( ALLOWED_FILE_EXTENSIONS.indexOf( extension ) === -1 ) {
			return;
		}

		const imageObjectUrl = URL.createObjectURL( files[ 0 ] );

		this.setState( {
			isEditingImage: true,
			image: imageObjectUrl
		} );
	};

	onImageEditorDone = ( error, imageBlob ) => {
		this.hideImageEditor();

		if ( error ) {
			return;
		}

		this.props.onImageEditorDone( imageBlob );
	};

	hideImageEditor = () => {
		const {
			resetAllImageEditorState: resetAllImageEditorStateAction
		} = this.props;

		resetAllImageEditorStateAction();

		URL.revokeObjectURL( this.state.image );

		this.setState( {
			isEditingImage: false,
			image: false
		} );
	};

	renderImageEditor() {
		const {
			additionalImageEditorClasses,
			allowedAspectRatios,
			texts,
		} = this.props;

		const classes = classnames( 'upload-image-modal', additionalImageEditorClasses );

		if ( this.state.isEditingImage ) {
			return (
				<Dialog
					additionalClassNames={ classes }
					isVisible={ true }
				>
					<ImageEditor
						allowedAspectRatios={ allowedAspectRatios }
						media={ { src: this.state.image } }
						onDone={ this.onImageEditorDone }
						onCancel={ this.hideImageEditor }
						doneButtonText={ texts.doneButtonText ? texts.doneButtonText : 'Done' }
					/>
				</Dialog>
			);
		}
	}

	render() {
		const {
			children,
			isUploading,
			translate,
			texts,
			additionalClasses
		} = this.props;

		let {
			placeholderContent,
			uploadingContent,
		} = this.props;

		if ( typeof placeholderContent === 'undefined' ) {
			placeholderContent = (
				<div className="upload-image__placeholder">
						<Gridicon icon="add-image" size={ 36 } />
					<span>Add an image</span>
				</div>
			);
		}

		if ( typeof uploadingContent === 'undefined' ) {
			uploadingContent = ( <Spinner className="upload-image__spinner" /> );
		}

		return (
			<div className={ classnames( 'upload-image', additionalClasses ) } >
				{ this.renderImageEditor() }

				<FilePicker accept="image/*" onPick={ this.onReceiveFile }>
					<div
						className={
							classnames( 'upload-image__image-container',
								{ 'is-uploading': isUploading }
							)
						}
					>
						<DropZone
							textLabel={ texts.dragUploadText
								? texts.dragUploadText
								: translate( 'Drop to upload image' )
							}
							onFilesDrop={ this.onReceiveFile }
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

export default connect(
	null,
	{
		resetAllImageEditorState,
	}
)( localize( UploadImage ) );
