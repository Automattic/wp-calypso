/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import MediaLibraryScale from './scale';
import Card from 'components/card';

const MediaLibraryScaleHeader = props => {
	return (
		<Card className="media-library__header">
			<MediaLibraryScale onChange={ props.onMediaScaleChange } />
		</Card>
	);
};

export default MediaLibraryScaleHeader;
