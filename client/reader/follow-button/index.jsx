var React = require( 'react' );

var FollowButtonContainer = require( 'components/follow-button' ),
	FollowButton = require( 'components/follow-button/button' ),
	stats = require( 'reader/stats' );

var ReaderFollowButton = React.createClass( {

	mixins: [ React.addons.PureRenderMixin ],

	recordFollowToggle: function( isFollowing ) {
		stats.recordAction( isFollowing ? 'followed_blog' : 'unfollowed_blog' );
		stats.recordGaEvent( isFollowing ? 'Clicked Follow Blog' : 'Clicked Unfollow Blog', this.props.location );

		stats[ isFollowing ? 'recordFollow' : 'recordUnfollow' ]();

		if ( this.props.onFollowToggle ) {
			this.props.onFollowToggle();
		}
	},

	render: function() {
		if ( this.props.isButtonOnly ) {
			return (
				<FollowButton { ...this.props } onFollowToggle={ this.recordFollowToggle } />
			);
		}

		return (
			<FollowButtonContainer { ...this.props } onFollowToggle={ this.recordFollowToggle } />
		);
	}

} );

module.exports = ReaderFollowButton;
