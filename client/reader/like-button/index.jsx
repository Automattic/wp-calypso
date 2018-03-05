/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { reduxGetState } from 'lib/redux-bridge';
import LikeButtonContainer from 'blocks/like-button';
import { markPostSeen } from 'state/reader/posts/actions';
import { recordAction, recordGaEvent, recordTrackForPost } from 'reader/stats';
import { getPostByKey } from 'state/reader/posts/selectors';

class ReaderLikeButton extends React.Component {
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

	render() {
		return <LikeButtonContainer { ...this.props } onLikeToggle={ this.recordLikeToggle } />;
	}
}

export default connect( null, { markPostSeen } )( ReaderLikeButton );
