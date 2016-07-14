/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import FollowButtonContainer from 'components/follow-button';
import FollowButton from 'components/follow-button/button';
import * as stats from 'reader/stats';

const ReaderFollowButton = React.createClass( {

	mixins: [ PureRenderMixin ],

	propTypes: {
		following: React.PropTypes.bool.isRequired,
		onFollowToggle: React.PropTypes.func,
		railcar: React.PropTypes.string
	},

	recordFollowToggle( isFollowing ) {
		stats[ isFollowing ? 'recordFollow' : 'recordUnfollow' ]( this.props.siteUrl, this.props.railcar );

		if ( this.props.onFollowToggle ) {
			this.props.onFollowToggle();
		}
	},

	render() {
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

export default ReaderFollowButton;
