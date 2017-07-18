/**
 * External dependencies
 */
import React, { Component } from 'react';
import { partial } from 'lodash';

/**
 * Internal dependencies
 */
import UploadImage from '../';

export default class UploadImageExample extends Component {
	state = {
		isUploading: false,
		uploadedImageDataUrl: null
	};

	render() {
		const { isUploading, uploadedImageDataUrl } = this.state;

		return (
			<div className="docs__design-assets-group">
				<h3>Default Upload Image</h3>
				<UploadImage
					isUploading={ isUploading }
					onImageEditorDone={
						(imageBlob) => {
							this.setState( {
								uploadedImageDataUrl: URL.createObjectURL( imageBlob ),
								isUploading: true,
							} );
						}
					}
				>
					{ uploadedImageDataUrl &&
						<img src={ uploadedImageDataUrl }/>
					}
				</UploadImage>

				<h3>Image is uploaded</h3>
				<UploadImage
					placeholderContent={ null }
					uploadingContent={ null }
				>
					<img src="https://cldup.com/mA_hqNVj0w.jpg"/>
				</UploadImage>
			</div>
		);
	}
}
