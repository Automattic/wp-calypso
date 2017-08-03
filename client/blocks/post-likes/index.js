/**
 * External dependencies
 **/
import React from 'react';
import { connect } from 'react-redux';
import { flowRight } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Gravatar from 'components/gravatar';
import QueryPostLikes from 'components/data/query-post-likes';
import { isRequestingPostLikes, getPostLikes, countPostLikes } from 'state/selectors';
import { recordGoogleEvent } from 'state/analytics/actions';

export const PostLikes = props => {
	const { countLikes, isRequesting, likes, postId, siteId, translate } = props;
	const trackLikeClick = () => props.recordGoogleEvent( 'Post Likes', 'Clicked on Gravatar' );
	const getLikeUrl = like => {
		return like.URL ? like.URL : `https://gravatar.com/${ like.login }`;
	};

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
			{ countLikes === 0 && ! isRequesting && translate( 'There are no likes on this post yet.' ) }
		</div>
	);
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
