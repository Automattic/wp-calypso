var React = require( 'react' );
var postStream = require( 'lib/feed-post-store' );

var LikeButtonContainer = require( 'components/like-button' ),
	stats = require( 'reader/stats' );

var ReaderLikeButton = React.createClass( {

	recordLikeToggle: function( liked ) {
		var post = postStream.get( {
			blogId: this.props.siteId,
			postId: this.props.postId
		} );
		stats.recordAction( liked ? 'liked_post' : 'unliked_post' );
		stats.recordGaEvent( liked ? 'Clicked Like Post' : 'Clicked Unlike Post' );
		stats.recordTrack( liked ? 'calypso_reader_article_liked' : 'calypso_reader_article_unliked', {
			blog_id: this.props.siteId,
			post_id: this.props.postId
		} );
		stats.recordTrainTrackInteract( 'article_liked', post );
		if ( this.props.onLikeToggle ) {
			this.props.onLikeToggle( liked );
		}
	},

	render: function() {
		return (
			<LikeButtonContainer { ...this.props } onLikeToggle={ this.recordLikeToggle } />
		);
	}

} );

module.exports = ReaderLikeButton;
