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
import { getEditorPath } from 'state/ui/editor/selectors';
import canCurrentUserEditPost from 'state/selectors/can-current-user-edit-post';
import { isMultiSelectEnabled } from 'state/ui/post-type-list/selectors';

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

	// Null if the item is a placeholder or bulk edit mode is active.
	const postLink =
		! ownProps.globalId || isMultiSelectEnabled( state ) || isTrashed ? null : postUrl;

	return { thumbnail, postLink };
} )( PostTypeListPostThumbnail );
