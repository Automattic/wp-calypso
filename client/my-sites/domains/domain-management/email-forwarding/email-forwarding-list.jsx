/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import EmailForwardingItem from './email-forwarding-item';

const EmailForwardingList = React.createClass( {
	render: function() {
		let emailForwardingItems,
			{ list, hasLoadedFromServer } = this.props.emailForwarding;

		if ( ! list && ! hasLoadedFromServer ) {
			return <span>{ this.props.translate( 'Loading…' ) }</span>;
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

export default localize( EmailForwardingList );
