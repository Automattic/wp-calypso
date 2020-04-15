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
import countPostLikes from 'state/selectors/count-post-likes';
import getPostLikes from 'state/selectors/get-post-likes';
import { recordGoogleEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

class PostLikes extends React.PureComponent {
	static defaultProps = {
		postType: 'post',
		showDisplayNames: false,
	};

	trackLikeClick = () => {
		this.props.recordGoogleEvent( 'Post Likes', 'Clicked on Gravatar' );
	};

	renderLike = ( like ) => {
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
			likes,
			postId,
			postType,
			siteId,
			translate,
			showDisplayNames,
			onMouseEnter,
			onMouseLeave,
		} = this.props;

		let noLikesLabel;

		if ( postType === 'page' ) {
			noLikesLabel = translate( 'There are no likes on this page yet.' );
		} else {
			noLikesLabel = translate( 'There are no likes on this post yet.' );
		}

		const isLoading = ! likes;

		const classes = classnames( 'post-likes', { 'has-display-names': showDisplayNames } );
		const extraProps = { onMouseEnter, onMouseLeave };

		return (
			<div className={ classes } { ...extraProps }>
				<QueryPostLikes siteId={ siteId } postId={ postId } needsLikers={ true } />
				{ isLoading && (
					<span key="placeholder" className="post-likes__count is-loading">
						…
					</span>
				) }
				{ likes && likes.map( this.renderLike ) }
				{ this.renderExtraCount() }
				{ likeCount === 0 && noLikesLabel }
			</div>
		);
	}
}

export default connect(
	( state, { siteId, postId } ) => {
		const likeCount = countPostLikes( state, siteId, postId );
		const likes = getPostLikes( state, siteId, postId );
		return {
			likeCount,
			likes,
		};
	},
	{ recordGoogleEvent }
)( localize( PostLikes ) );
