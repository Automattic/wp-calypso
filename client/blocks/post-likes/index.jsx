/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Gravatar from 'components/gravatar';
import QueryPostLikes from 'components/data/query-post-likes';
import { isRequestingPostLikes, getPostLikes, countPostLikes } from 'state/selectors';
import { recordGoogleEvent } from 'state/analytics/actions';

class PostLikes extends React.PureComponent {
	static defaultProps = {
		postType: 'post',
	};

	getLikeUrl = like => {
		return like.URL ? like.URL : `https://gravatar.com/${ like.login }`;
	}

	trackLikeClick = () => {
		this.props.recordGoogleEvent( 'Post Likes', 'Clicked on Gravatar' );
	}

	renderLike = like => {
		return (
			<a
				key={ like.ID }
				href={ this.getLikeUrl( like ) }
				rel="noopener noreferrer"
				target="_blank"
				className="post-likes__item"
				title={ like.login }
				onClick={ this.trackLikeClick }
			>
				<Gravatar user={ like } size={ 24 } />
			</a>
		);
	}

	renderExtraCount() {
		const { likes, likeCount } = this.props;

		if ( ! likes || likeCount <= likes.length ) {
			return null;
		}

		return (
			<span key="placeholder" className="post-likes__count">
				{ `+ ${ likeCount - likes.length }` }
			</span>
		);
	}

	render() {
		const {
			likeCount,
			isRequesting,
			likes,
			postId,
			postType,
			siteId,
			translate,
		} = this.props;

		let noLikesLabel;

		if ( postType === 'page' ) {
			noLikesLabel = translate( 'There are no likes on this page yet.' );
		} else {
			noLikesLabel = translate( 'There are no likes on this post yet.' );
		}

		const isLoading = ! likes && isRequesting;

		return (
			<div className="post-likes">
				<QueryPostLikes siteId={ siteId } postId={ postId } />
				{ isLoading && (
					<span key="placeholder" className="post-likes__count is-loading">
						…
					</span>
				) }
				{ likes && likes.map( this.renderLike ) }
				{ this.renderExtraCount() }
				{ likeCount === 0 && ! isRequesting && noLikesLabel }
			</div>
		);
	}
}

export default connect(
	( state, { siteId, postId } ) => {
		const isRequesting = isRequestingPostLikes( state, siteId, postId );
		const likeCount = countPostLikes( state, siteId, postId );
		const likes = getPostLikes( state, siteId, postId );
		return {
			likeCount,
			isRequesting,
			likes,
		};
	},
	{ recordGoogleEvent }
)( localize( PostLikes ) );
