import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import QueryPostLikers from 'calypso/components/data/query-post-likers';
import Gravatar from 'calypso/components/gravatar';
import { getUserProfileUrl } from 'calypso/reader/user-profile/user-profile.utils';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { countPostLikes } from 'calypso/state/posts/selectors/count-post-likes';
import { getPostLikes } from 'calypso/state/posts/selectors/get-post-likes';

import './style.scss';

class PostLikes extends PureComponent {
	static defaultProps = {
		postType: 'post',
		showDisplayNames: false,
	};

	trackLikeClick = () => {
		this.props.recordGoogleEvent( 'Post Likes', 'Clicked on Gravatar' );
	};

	renderLike = ( like ) => {
		const { showDisplayNames } = this.props;

		const likeUrl = like.login ? getUserProfileUrl( like.login ) : null;
		const LikeWrapper = likeUrl ? 'a' : 'span';

		return (
			<LikeWrapper
				key={ like.ID }
				href={ likeUrl }
				className="post-likes__item"
				onClick={ likeUrl ? this.trackLikeClick : null }
			>
				<Gravatar user={ like } alt={ like.login } title={ like.login } size={ 32 } />
				{ showDisplayNames && <span className="post-likes__display-name">{ like.name }</span> }
			</LikeWrapper>
		);
	};

	renderExtraCount() {
		const { likes, likeCount, translate, numberFormat } = this.props;

		if ( ! likes || likeCount <= likes.length ) {
			return null;
		}

		const extraCount = likeCount - likes.length;

		const message = translate( '%(extraCount)s more', {
			args: { extraCount: numberFormat( extraCount ) },
		} );

		return (
			<span key="placeholder" className="post-likes__count">
				{ message }
			</span>
		);
	}

	render() {
		const {
			likeCount,
			likes,
			postId,
			postType,
			siteId,
			translate,
			showDisplayNames,
			onMouseEnter,
			onMouseLeave,
			currentUserId,
		} = this.props;

		// Sort likes so that the current user's like is always first
		const sortedLikes = likes
			? [ ...likes ].sort( ( a, b ) => {
					if ( a.ID === currentUserId ) {
						return -1;
					}
					if ( b.ID === currentUserId ) {
						return 1;
					}
					return 0;
			  } )
			: [];

		let noLikesLabel;

		if ( postType === 'page' ) {
			noLikesLabel = translate( 'There are no likes on this page yet.' );
		} else {
			noLikesLabel = translate( 'There are no likes on this post yet.' );
		}

		// Prevent loading for postId `0`
		const isLoading = !! postId && ! sortedLikes;

		const classes = clsx( 'post-likes', {
			'has-display-names': showDisplayNames,
			'no-likes': ! likeCount,
		} );
		const extraProps = { onMouseEnter, onMouseLeave };

		return (
			<div className={ classes } { ...extraProps }>
				{ !! postId && <QueryPostLikers siteId={ siteId } postId={ postId } /> }
				{ isLoading && (
					<span key="placeholder" className="post-likes__count is-loading">
						…
					</span>
				) }
				{ sortedLikes && sortedLikes.map( this.renderLike ) }
				{ this.renderExtraCount() }
				{ ! isLoading && ! likeCount && noLikesLabel }
			</div>
		);
	}
}

export default connect(
	( state, { siteId, postId } ) => {
		const likeCount = countPostLikes( state, siteId, postId );
		const likes = getPostLikes( state, siteId, postId );
		const currentUserId = getCurrentUserId( state );
		return {
			likeCount,
			likes,
			currentUserId,
		};
	},
	{ recordGoogleEvent }
)( localize( PostLikes ) );
