/**
 * External dependencies
 */
import classnames from 'classnames';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

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
