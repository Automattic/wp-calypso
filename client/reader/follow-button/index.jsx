/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

/**
 * Internal dependencies
 */
var FollowButtonContainer = require( 'components/follow-button' ),
	FollowButton = require( 'components/follow-button/button' ),
	stats = require( 'reader/stats' );

var ReaderFollowButton = React.createClass( {

	mixins: [ PureRenderMixin ],

	recordFollowToggle: function( isFollowing ) {
		stats[ isFollowing ? 'recordFollow' : 'recordUnfollow' ]( this.props.siteUrl );

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
