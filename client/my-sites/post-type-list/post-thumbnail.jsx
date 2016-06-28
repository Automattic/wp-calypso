/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';

/**
 * Internal dependencies
 */
import resizeImageUrl from 'lib/resize-image-url';
import { getNormalizedPost } from 'state/posts/selectors';

function PostTypeListPostThumbnail( { thumbnail } ) {
	return (
		<div className="post-type-list__post-thumbnail-wrapper">
			{ thumbnail && (
				<img
					src={ resizeImageUrl( thumbnail, { w: 80 } ) }
					className="post-type-list__post-thumbnail" />
			) }
		</div>
	);
}

PostTypeListPostThumbnail.propTypes = {
	globalId: PropTypes.string,
	thumbnail: PropTypes.string
};

export default connect( ( state, ownProps ) => {
	const post = getNormalizedPost( state, ownProps.globalId );
	const thumbnail = get( post, 'canonical_image.uri' );

	return { thumbnail };
} )( PostTypeListPostThumbnail );
