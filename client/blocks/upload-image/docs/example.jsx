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
			<UploadImage isUploading={ false } onImageEditorDone={ () => console.log( 'hello' ) } />
		</div>
	);
}

const ConnectedUploadImageExample = connect(
	null,
	null
)( UploadImageExample );

ConnectedUploadImageExample.displayName = 'UploadImage';

export default ConnectedUploadImageExample;
