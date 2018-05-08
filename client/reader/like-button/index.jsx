/** @format */
/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { reduxGetState } from 'lib/redux-bridge';
import LikeButtonContainer from 'blocks/like-button';
import PostLikesPopover from 'blocks/post-likes/popover';
import { markPostSeen } from 'state/reader/posts/actions';
import { recordAction, recordGaEvent, recordTrackForPost } from 'reader/stats';
import { getPostByKey } from 'state/reader/posts/selectors';
import { isEnabled } from 'config';

class ReaderLikeButton extends React.Component {
	constructor( props ) {
		super( props );

		this.hidePopoverTimeout = null;
		this.state = {
			showLikesPopover: false,
			likesPopoverContext: null,
		};
	}

	componentWillUnmount() {
		clearTimeout( this.hidePopoverTimeout );
	}

	recordLikeToggle = liked => {
		const post =
			this.props.post ||
			getPostByKey( reduxGetState(), {
				blogId: this.props.siteId,
				postId: this.props.postId,
			} );

		recordAction( liked ? 'liked_post' : 'unliked_post' );
		recordGaEvent( liked ? 'Clicked Like Post' : 'Clicked Unlike Post' );
		recordTrackForPost(
			liked ? 'calypso_reader_article_liked' : 'calypso_reader_article_unliked',
			post,
			{ context: this.props.fullPost ? 'full-post' : 'card' }
		);
		if ( liked && ! this.props.fullPost && ! post._seen ) {
			this.props.markPostSeen( post, this.props.site );
		}
	};

	setLikesPopoverContext = element => {
		this.setState( { likesPopoverContext: element } );
	};

	maybeShowLikesPopover = () => {
		if ( ! isEnabled( 'reader/likes-hover' ) ) {
			return;
		}
		clearTimeout( this.hidePopoverTimeout );
		this.setState( { showLikesPopover: true } );
	};

	maybeHideLikesPopover = () => {
		if ( ! isEnabled( 'reader/likes-hover' ) ) {
			return;
		}
		this.hidePopoverTimeout = setTimeout( () => {
			this.setState( { showLikesPopover: false } );
		}, 500 );
	};

	render() {
		const { siteId, postId } = this.props;
		const { showLikesPopover, likesPopoverContext } = this.state;

		return (
			<Fragment>
				<LikeButtonContainer
					{ ...this.props }
					ref={ this.setLikesPopoverContext }
					onMouseEnter={ this.maybeShowLikesPopover }
					onMouseLeave={ this.maybeHideLikesPopover }
					onLikeToggle={ this.recordLikeToggle }
					likeSource="reader"
				/>
				{ showLikesPopover &&
					siteId &&
					postId && (
						<PostLikesPopover
							className="reader-likes-popover" // eslint-disable-line
							onMouseEnter={ this.maybeShowLikesPopover }
							onMouseLeave={ this.maybeHideLikesPopover }
							siteId={ siteId }
							postId={ postId }
							showDisplayNames={ true }
							context={ likesPopoverContext }
						/>
					) }
			</Fragment>
		);
	}
}

export default connect( null, { markPostSeen } )( ReaderLikeButton );
