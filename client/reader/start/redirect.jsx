/**
 * External dependencies
 */
 import React from 'react';
 import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import page from 'page';
import config from 'config';
import FeedSubscriptionStore from 'lib/reader-feed-subscriptions';
import { getCurrentUser } from 'state/current-user/selectors';

var debug = require( 'debug' )( 'calypso:reader:start' );

const StartRedirect = React.createClass( {
	componentWillMount() {
		this.redirectColdStarters();
	},

	redirectColdStarters() {
		if ( this.props.currentUser.is_new_reader ) {
			debug( 'is_new_reader: true' );
		}

		//page.redirect( '/read/start' );
	},

	render() {
		return null;
	}
} );

export default connect( state => {
	return {
		currentUser: getCurrentUser( state )
	};
} )( StartRedirect );
