/** @format */

/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
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
		showDisplayNames: false,
	};

	trackLikeClick = () => {
		this.props.recordGoogleEvent( 'Post Likes', 'Clicked on Gravatar' );
	};

	renderLike = like => {
		const { showDisplayNames } = this.props;

		const likeUrl = like.site_ID && like.site_visible ? '/read/blogs/' + like.site_ID : null;
		const LikeWrapper = likeUrl ? 'a' : 'span';

		return (
			<LikeWrapper
				key={ like.ID }
				href={ likeUrl }
				className="post-likes__item"
				onClick={ likeUrl ? this.trackLikeClick : null }
			>
				<Gravatar user={ like } alt={ like.login } title={ like.login } size={ 24 } />
				{ showDisplayNames && <span className="post-likes__display-name">{ like.name }</span> }
			</LikeWrapper>
		);
	};

	renderExtraCount() {
		const { likes, likeCount, showDisplayNames, translate, numberFormat } = this.props;

		if ( ! likes || likeCount <= likes.length ) {
			return null;
		}

		const extraCount = likeCount - likes.length;

		let message;
		if ( showDisplayNames ) {
			message = translate( '+ %(extraCount)s more', '+ %(extraCount)s more', {
				count: extraCount,
				args: { extraCount: numberFormat( extraCount ) },
			} );
		} else {
			message = '+ ' + numberFormat( extraCount );
		}

		return (
			<span key="placeholder" className="post-likes__count">
				{ message }
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
			showDisplayNames,
		} = this.props;

		let noLikesLabel;

		if ( postType === 'page' ) {
			noLikesLabel = translate( 'There are no likes on this page yet.' );
		} else {
			noLikesLabel = translate( 'There are no likes on this post yet.' );
		}

		const isLoading = ! likes;

		const classes = classnames( 'post-likes', { 'has-display-names': showDisplayNames } );

		return (
			<div className={ classes }>
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
