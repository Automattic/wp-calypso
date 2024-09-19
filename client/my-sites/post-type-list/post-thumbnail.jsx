import { safeImageUrl } from '@automattic/calypso-url';
import clsx from 'clsx';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import resizeImageUrl from 'calypso/lib/resize-image-url';
import { getEditorPath } from 'calypso/state/editor/selectors';
import { getNormalizedPost } from 'calypso/state/posts/selectors';
import { canCurrentUserEditPost } from 'calypso/state/posts/selectors/can-current-user-edit-post';

const noop = () => {};

function PostTypeListPostThumbnail( { onClick, thumbnail, postLink } ) {
	const classes = clsx( 'post-type-list__post-thumbnail-wrapper', {
		'has-image': !! thumbnail,
	} );

	return (
		<div className={ classes }>
			{ thumbnail && (
				<a href={ postLink } className="post-type-list__post-thumbnail-link">
					<img // eslint-disable-line
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
