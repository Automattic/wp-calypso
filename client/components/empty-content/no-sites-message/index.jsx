/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import config from 'config';
import EmptyContent from 'components/empty-content';

const NoSitesMessage = React.createClass( {
	render() {
		return (
			<EmptyContent
				title={ this.translate( "You don't have any WordPress sites yet." ) }
				line={ this.translate( 'Would you like to start one?' ) }
				action={ this.translate( 'Create Site' ) }
				actionURL={ config( 'signup_url' ) + '?ref=calypso-nosites' }
				illustration={ '/calypso/images/drake/drake-nosites.svg' } />
		);
	}
} );

export default NoSitesMessage;
