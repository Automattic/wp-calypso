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
import resizeImageUrl from 'calypso/lib/resize-image-url';
import safeImageUrl from 'calypso/lib/safe-image-url';
import { getNormalizedPost } from 'calypso/state/posts/selectors';
import { getEditorPath } from 'calypso/state/editor/selectors';
import { canCurrentUserEditPost } from 'calypso/state/posts/selectors/can-current-user-edit-post';

function PostTypeListPostThumbnail( { onClick, thumbnail, postLink } ) {
	const classes = classnames( 'post-type-list__post-thumbnail-wrapper', {
		'has-image': !! thumbnail,
	} );

	return (
		<div className={ classes }>
			{ thumbnail && (
				<a href={ postLink } className="post-type-list__post-thumbnail-link">
					<img //eslint-disable-line
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
	const thumbnail = get( post, 'canonical_image.uri' );

	const siteId = get( post, 'site_ID' );
	const postId = get( post, 'ID' );
	const postUrl = canCurrentUserEditPost( state, ownProps.globalId )
		? getEditorPath( state, siteId, postId )
		: get( post, 'URL' );
	const isTrashed = post && 'trash' === post.status;

	// Null if the item is a placeholder.
	const postLink = ! ownProps.globalId || isTrashed ? null : postUrl;

	return { thumbnail, postLink };
} )( PostTypeListPostThumbnail );
