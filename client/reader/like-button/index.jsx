const React = require( 'react' );

const postStore = require( 'lib/feed-post-store' );

const LikeButtonContainer = require( 'components/like-button' ),
	stats = require( 'reader/stats' );

const ReaderLikeButton = React.createClass( {

	recordLikeToggle: function( liked ) {
		const post = postStore.get( {
			blogId: this.props.siteId,
			postId: this.props.postId
		} );
		stats.recordAction( liked ? 'liked_post' : 'unliked_post' );
		stats.recordGaEvent( liked ? 'Clicked Like Post' : 'Clicked Unlike Post' );
		stats.recordTrackForPost( liked ? 'calypso_reader_article_liked' : 'calypso_reader_article_unliked', post, { context: this.props.fullPost ? 'full-post' : 'card' } );
	},

	render: function() {
		return (
			<LikeButtonContainer { ...this.props } onLikeToggle={ this.recordLikeToggle } />
		);
	}

} );

module.exports = ReaderLikeButton;
