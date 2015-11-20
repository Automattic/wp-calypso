// External dependencies
var React = require( 'react' ),
	omit = require( 'lodash/object/omit' );
	//debug = require( 'debug' )( 'calypso:comment-likes' );

// Internal dependencies
var CommentLikeActions = require( 'lib/comment-like-store/actions' ),
	LikeButton = require( 'components/like-button/button' ),
	CommentLikeStore = require( 'lib/comment-like-store/comment-like-store' ),
	stats = require( 'reader/stats' );

var CommentLikeButtonContainer = React.createClass( {
	propTypes: {
		siteId: React.PropTypes.number.isRequired,
		commentId: React.PropTypes.number.isRequired,
		showCount: React.PropTypes.bool,
		tagName: React.PropTypes.string
	},

	getInitialState: function() {
		return this.getStateFromStores();
	},

	getStateFromStores: function() {
		return {
			likeCount: CommentLikeStore.getLikeCountForComment( this.props.siteId, this.props.commentId ),
			iLike: CommentLikeStore.isCommentLikedByCurrentUser( this.props.siteId, this.props.commentId )
		};
	},

	componentDidMount: function() {
		CommentLikeStore.on( 'change', this.onStoreChange );
	},

	componentWillUnmount: function() {
		CommentLikeStore.off( 'change', this.onStoreChange );
	},

	onStoreChange: function() {
		var newState = this.getStateFromStores();
		if ( newState.likeCount !== this.state.likeCount ||
				newState.iLike !== this.state.iLike ) {
			this.setState( newState );
		}
	},

	handleLikeToggle: function( liked ) {
		CommentLikeActions[ liked ? 'likeComment' : 'unlikeComment' ]( this.props.siteId, this.props.commentId );
		stats.recordAction( liked ? 'liked_comment' : 'unliked_comment' );
		stats.recordGaEvent( liked ? 'Clicked Comment Like' : 'Clicked Comment Unlike' );
	},

	render: function() {
		var props = omit( this.props, [ 'siteId', 'commentId' ] ),
			likeCount = this.state.likeCount,
			likedLabel = this.translate( 'Liked' );

		return <LikeButton { ...props }
				likeCount={ likeCount }
				liked={ this.state.iLike }
				onLikeToggle={ this.handleLikeToggle }
				likedLabel={ likedLabel }
				isMini={ true } />;
	}
} );

module.exports = CommentLikeButtonContainer;
