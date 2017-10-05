/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import EmailForwardingItem from './email-forwarding-item';

var EmailForwardingList = React.createClass( {
	render: function() {
		var emailForwardingItems,
			{ list, hasLoadedFromServer } = this.props.emailForwarding;

		if ( ! list && ! hasLoadedFromServer ) {
			return <span>{ this.translate( 'Loading…' ) }</span>;
		}

		if ( ! list ) {
			return null;
		}

		emailForwardingItems = list.map( ( emailForwarding ) => {
			return (
				<EmailForwardingItem
					key={ emailForwarding.email }
					emailData={ emailForwarding }
					selectedSite={ this.props.selectedSite }
					/>
			);
		} );

		return <ul className="email-forwarding__list">{ emailForwardingItems }</ul>;
	}
} );

module.exports = EmailForwardingList;
