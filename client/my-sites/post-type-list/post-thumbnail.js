/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import get from 'lodash/get';

/**
 * Internal dependencies
 */
import resizeImageUrl from 'lib/resize-image-url';
import { getNormalizedPost } from 'state/posts/selectors';

function PostTypeListPostThumbnail( { thumbnail } ) {
	const classes = classnames( 'post-type-list__post-thumbnail-wrapper', {
		'has-image': !! thumbnail
	} );

	return (
		<div className={ classes }>
			{ thumbnail && (
				<img
					src={ resizeImageUrl( thumbnail, { h: 80 } ) }
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
