/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import UploadImage from '../';
import { ERROR_UPLOADING_IMAGE } from '../constants';
import { AspectRatios } from 'state/ui/editor/image-editor/constants';
import { getCurrentUser } from 'state/current-user/selectors';

class UploadImageExample extends Component {
	state = {
		editedImageDataUrl: null,
	};

	onImageEditorDone = ( imageBlob, imageEditorProps ) => {
		// You can do whatever you want with the edited image here. However, it will be uploaded
		// to site's Media library automatically on clicking the "Done" button in Image Editor.
		this.setState( {
			editedImageDataUrl: URL.createObjectURL( imageBlob ),
		} );

		console.log( 'Image Editor props:', imageEditorProps );
	};

	onImageUploadDone = uploadedImage => {
		console.log( 'Uploaded image:', uploadedImage );
	};

	onError = ( errorCode, errorMessage ) => {
		if ( errorCode === ERROR_UPLOADING_IMAGE ) {
			console.log( 'There was an error uploading your image' );
		} else {
			console.log( 'UploadImage error:', errorMessage );
		}
	};

	onImageRemove = uploadedImage => {
		console.log(
			'The following uploaded image is going to be removed from screen:',
			uploadedImage
		);
	};

	render() {
		const { primarySiteId } = this.props;

		return (
			<div className="docs__design-assets-group">
				Note: image will be uploaded to your primary site's Media library.
				<UploadImage
					siteId={ primarySiteId }
					onImageEditorDone={ this.onImageEditorDone }
					onImageUploadDone={ this.onImageUploadDone }
					onImageRemove={ this.onImageRemove }
					onError={ this.onError }
				/>
			</div>
		);
	}
}

const ConnectedUploadImageExample = connect( state => {
	const user = getCurrentUser( state );

	if ( ! user ) {
		return {};
	}

	return {
		primarySiteId: user.primary_blog,
	};
} )( UploadImageExample );

ConnectedUploadImageExample.displayName = 'UploadImage';

export default ConnectedUploadImageExample;
