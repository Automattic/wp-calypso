var React = require( 'react' );
var postStore = require( 'lib/feed-post-store' );

var LikeButtonContainer = require( 'components/like-button' ),
	stats = require( 'reader/stats' );

var ReaderLikeButton = React.createClass( {

	recordLikeToggle: function( liked ) {
		var post = postStore.get( {
			blogId: this.props.siteId,
			postId: this.props.postId
		} );
		stats.recordAction( liked ? 'liked_post' : 'unliked_post' );
		stats.recordGaEvent( liked ? 'Clicked Like Post' : 'Clicked Unlike Post' );
		stats.recordTrackForPost( liked ? 'calypso_reader_article_liked' : 'calypso_reader_article_unliked', post );
	},

	render: function() {
		return (
			<LikeButtonContainer { ...this.props } onLikeToggle={ this.recordLikeToggle } />
		);
	}

} );

module.exports = ReaderLikeButton;
