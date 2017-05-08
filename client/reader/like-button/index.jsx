/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import postStore from 'lib/feed-post-store';
import LikeButtonContainer from 'blocks/like-button';
import { markSeen } from 'lib/feed-post-store/actions';
import { recordAction, recordGaEvent, recordTrackForPost } from 'reader/stats';

const ReaderLikeButton = React.createClass( {

	recordLikeToggle: function( liked ) {
		const post = this.props.post || postStore.get( {
			blogId: this.props.siteId,
			postId: this.props.postId
		} );

		recordAction( liked ? 'liked_post' : 'unliked_post' );
		recordGaEvent( liked ? 'Clicked Like Post' : 'Clicked Unlike Post' );
		recordTrackForPost( liked ? 'calypso_reader_article_liked' : 'calypso_reader_article_unliked', post,
				{ context: this.props.fullPost ? 'full-post' : 'card' } );
		if ( liked && ! this.props.fullPost && ! post._seen ) {
			markSeen( post, this.props.site );
		}
	},

	render: function() {
		return (
			<LikeButtonContainer { ...this.props } onLikeToggle={ this.recordLikeToggle } />
		);
	}

} );

export default ReaderLikeButton;
