/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { partial } from 'lodash';

/**
 * Internal dependencies
 */
import UploadImage from '../';

function UploadImageExample() {
	return (
		<div className="docs__design-assets-group">
			<h3>Default Upload Image</h3>
			<UploadImage isUploading={ false } onImageEditorDone={ ( imageBlob ) => console.log( imageBlob ) } />

			<h3>Image is uploading</h3>
			<UploadImage isUploading={ true } />
		</div>
	);
}

const ConnectedUploadImageExample = connect(
	null,
	null
)( UploadImageExample );

ConnectedUploadImageExample.displayName = 'UploadImage';

export default ConnectedUploadImageExample;
