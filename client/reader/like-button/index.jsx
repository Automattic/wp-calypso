import config from '@automattic/calypso-config';
import { getUrlParts } from '@automattic/calypso-url';
import { isMobile } from '@automattic/viewport';
import { flowRight } from 'lodash';
import { createRef, Component, Fragment } from 'react';
import { connect } from 'react-redux';
import LikeButtonContainer from 'calypso/blocks/like-button';
import PostLikesPopover from 'calypso/blocks/post-likes/popover';
import { withPostLikes } from 'calypso/components/data/post-likes';
import { navigate } from 'calypso/lib/navigate';
import { createAccountUrl } from 'calypso/lib/paths';
import isReaderTagEmbedPage from 'calypso/lib/reader/is-reader-tag-embed-page';
import ReaderLikeIcon from 'calypso/reader/components/icons/like-icon';
import { withCachedPost } from 'calypso/reader/data/post-cache';
import { withPostLikeActions } from 'calypso/reader/data/post-likes';
import { markPostSeen } from 'calypso/reader/mark-post-seen';
import { recordAction, recordGaEvent, recordTrackForPost } from 'calypso/reader/stats';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import getPreviousPath from 'calypso/state/selectors/get-previous-path';

import './style.scss';

class ReaderLikeButton extends Component {
	state = {
		showLikesPopover: false,
	};

	hidePopoverTimeout = null;
	likeButtonRef = createRef();

	componentWillUnmount() {
		clearTimeout( this.hidePopoverTimeout );
	}

	onLikeToggle = ( liked ) => {
		if ( this.props.isLoggedIn ) {
			return this.recordLikeToggle( liked );
		}
		// Redirect to create account page
		const { pathname } = getUrlParts( window.location.href );
		if ( isReaderTagEmbedPage( window.location ) ) {
			return window.open(
				createAccountUrl( { redirectTo: pathname, ref: 'reader-lp' } ),
				'_blank'
			);
		}
		// Do not redirect to create account page when not logged in and the login window component is enabled
		if ( ! config.isEnabled( 'reader/login-window' ) ) {
			return navigate( createAccountUrl( { redirectTo: pathname, ref: 'reader-lp' } ) );
		}
	};

	recordLikeToggle = ( liked ) => {
		const post = this.props.post;
		if ( ! post ) {
			return;
		}

		recordAction( liked ? 'liked_post' : 'unliked_post' );
		recordGaEvent( liked ? 'Clicked Like Post' : 'Clicked Unlike Post' );
		recordTrackForPost(
			liked ? 'calypso_reader_article_liked' : 'calypso_reader_article_unliked',
			post,
			{ context: this.props.fullPost ? 'full-post' : 'card' },
			{
				...( this.props.fullPost ? { pathnameOverride: this.props.previousPath } : {} ),
			}
		);
		if ( liked && ! this.props.fullPost && ! post._seen ) {
			markPostSeen( post, this.props.site );
		}
	};

	showLikesPopover = () => {
		if ( isMobile() ) {
			return;
		}
		clearTimeout( this.hidePopoverTimeout );
		this.setState( { showLikesPopover: true } );
	};

	hideLikesPopover = () => {
		if ( isMobile() ) {
			return;
		}
		this.hidePopoverTimeout = setTimeout( () => {
			this.setState( { showLikesPopover: false } );
		}, 200 );
	};

	render() {
		const { siteId, postId, likeCount, iLike, iconSize } = this.props;
		const { showLikesPopover } = this.state;
		const hasEnoughLikes = ( likeCount > 0 && ! iLike ) || ( likeCount > 1 && iLike );

		const likeIcon = ReaderLikeIcon( {
			liked: iLike,
			iconSize: iconSize,
		} );

		return (
			<Fragment>
				<LikeButtonContainer
					{ ...this.props }
					ref={ this.likeButtonRef }
					onLikeToggle={ this.onLikeToggle }
					likeSource="reader"
					icon={ likeIcon }
					onMouseEnter={ this.showLikesPopover }
					onMouseLeave={ this.hideLikesPopover }
					showTooltip={ likeCount === 0 }
				/>
				{ showLikesPopover && siteId && postId && hasEnoughLikes && (
					<PostLikesPopover
						className="reader-likes-popover ignore-click" // eslint-disable-line wpcalypso/jsx-classname-namespace
						onMouseEnter={ this.showLikesPopover }
						onMouseLeave={ this.hideLikesPopover }
						siteId={ siteId }
						postId={ postId }
						showDisplayNames
						context={ this.likeButtonRef.current }
					/>
				) }
			</Fragment>
		);
	}
}

export default flowRight(
	connect( ( state ) => {
		return {
			isLoggedIn: isUserLoggedIn( state ),
			previousPath: getPreviousPath( state ),
		};
	} ),
	withPostLikes,
	withPostLikeActions,
	withCachedPost( ( { siteId, postId } ) => ( {
		blogId: siteId,
		postId,
	} ) )
)( ReaderLikeButton );
