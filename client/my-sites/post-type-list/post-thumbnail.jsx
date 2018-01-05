/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { get, noop } from 'lodash';

/**
 * Internal dependencies
 */
import resizeImageUrl from 'lib/resize-image-url';
import safeImageUrl from 'lib/safe-image-url';
import { getNormalizedPost } from 'state/posts/selectors';

function PostTypeListPostThumbnail( { onClick, thumbnail, postUrl } ) {
	const classes = classnames( 'post-type-list__post-thumbnail-wrapper', {
		'has-image': !! thumbnail,
	} );

	return (
		<div className={ classes }>
			{ thumbnail && (
				<a href={ postUrl } className="post-type-list__post-thumbnail-link">
					<img
						src={ resizeImageUrl( safeImageUrl( thumbnail ), { h: 80 } ) }
						className="post-type-list__post-thumbnail"
						onClick={ onClick }
					/>
				</a>
			) }
		</div>
	);
}

PostTypeListPostThumbnail.propTypes = {
	globalId: PropTypes.string,
	onClick: PropTypes.func,
	thumbnail: PropTypes.string,
	postUrl: PropTypes.string,
};

PostTypeListPostThumbnail.defaultProps = {
	onClick: noop,
};

export default connect( ( state, ownProps ) => {
	const post = getNormalizedPost( state, ownProps.globalId );
	const postUrl = get( post, 'URL' );
	const thumbnail = get( post, 'canonical_image.uri' );

	return { thumbnail, postUrl };
} )( PostTypeListPostThumbnail );
