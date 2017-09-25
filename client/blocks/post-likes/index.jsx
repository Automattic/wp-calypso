/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import QueryPostLikes from 'components/data/query-post-likes';
import Gravatar from 'components/gravatar';
import { recordGoogleEvent } from 'state/analytics/actions';
import { isRequestingPostLikes, getPostLikes, countPostLikes } from 'state/selectors';

export const PostLikes = props => {
	const { countLikes, isRequesting, likes, postId, postType, siteId, translate } = props;
	const trackLikeClick = () => props.recordGoogleEvent( 'Post Likes', 'Clicked on Gravatar' );
	const getLikeUrl = like => {
		return like.URL ? like.URL : `https://gravatar.com/${ like.login }`;
	};

	let noLikesLabel;

	if ( postType === 'page' ) {
		noLikesLabel = translate( 'There are no likes on this page yet.' );
	} else {
		noLikesLabel = translate( 'There are no likes on this post yet.' );
	}

	return (
		<div className="post-likes">
			<QueryPostLikes siteId={ siteId } postId={ postId } />
			{ likes && !! likes.length && likes
				.map( like =>
					<a
						key={ like.ID }
						href={ getLikeUrl( like ) }
						rel="noopener noreferrer"
						target="_blank"
						className="post-likes__item"
						onClick={ trackLikeClick }
					>
						<Gravatar user={ like } size={ 24 } />
					</a>
				).concat(
					countLikes > likes.length && <span key="placeholder" className="post-likes__placeholder">
						{ `+ ${ countLikes - likes.length }` }
					</span>
				)
			}
			{ countLikes === 0 && ! isRequesting && noLikesLabel }
		</div>
	);
};

PostLikes.defaultProps = {
	postType: 'post'
};

const connectComponent = connect(
	( state, { siteId, postId } ) => {
		const isRequesting = isRequestingPostLikes( state, siteId, postId );
		const countLikes = countPostLikes( state, siteId, postId );
		const likes = getPostLikes( state, siteId, postId );
		return {
			countLikes,
			isRequesting,
			likes,
		};
	},
	{ recordGoogleEvent }
);

export default flowRight(
	connectComponent,
	localize
)( PostLikes );
