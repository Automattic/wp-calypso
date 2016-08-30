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
import FollowButtonContainer from 'components/follow-button';
import FollowButton from 'components/follow-button/button';
import * as stats from 'reader/stats';
import {
	recordRecommendationFollow,
	recordRecommendationUnfollow
} from 'state/reader/start/actions';

var debug = require( 'debug' )( 'calypso:reader:follow-button' );

const ReaderFollowButton = React.createClass( {

	mixins: [ PureRenderMixin ],

	propTypes: {
		onFollowToggle: React.PropTypes.func,
		railcar: React.PropTypes.object,
		recommendationId: React.PropTypes.number
	},

	recordFollowToggle( isFollowing ) {
		stats[ isFollowing ? 'recordFollow' : 'recordUnfollow' ]( this.props.siteUrl, this.props.railcar );

		// If we're following a recommendation, record the follow/unfollow in the Redux store
		if ( this.props.recommendationId ) {
			isFollowing ?
				this.props.recordRecommendationFollow( this.props.recommendationId ) :
				this.props.recordRecommendationUnfollow( this.props.recommendationId );
		}

		if ( this.props.onFollowToggle ) {
			this.props.onFollowToggle( isFollowing );
		}
	},

	render() {
		debug( 'recommendationId is ' + this.props.recommendationId );
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
		recordRecommendationFollow,
		recordRecommendationUnfollow
	}, dispatch )
)( ReaderFollowButton );
