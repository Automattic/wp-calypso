/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import FollowButtonContainer from 'blocks/follow-button';
import FollowButton from 'blocks/follow-button/button';
import * as stats from 'reader/stats';
import {
	recordFollow,
	recordUnfollow
} from 'state/reader/follows/actions';

const ReaderFollowButton = React.createClass( {

	mixins: [ PureRenderMixin ],

	propTypes: {
		onFollowToggle: React.PropTypes.func,
		railcar: React.PropTypes.object
	},

	recordFollowToggle( isFollowing ) {
		stats[ isFollowing ? 'recordFollow' : 'recordUnfollow' ]( this.props.siteUrl, this.props.railcar );

		// Record the follow/unfollow in Redux state (reader/follows)
		isFollowing
			? this.props.recordFollow( this.props.siteUrl )
			: this.props.recordUnfollow( this.props.siteUrl );

		if ( this.props.onFollowToggle ) {
			this.props.onFollowToggle( isFollowing );
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

export default connect(
	( state ) => ( {} ), // eslint-disable-line no-unused-vars
	( dispatch ) => bindActionCreators( {
		recordFollow,
		recordUnfollow
	}, dispatch ),
	null,
	{ pure: false } // we are not pure from the standpoint of the redux state tree
)( ReaderFollowButton );
