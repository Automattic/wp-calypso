/** @format */

/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import EmailForwardingItem from './email-forwarding-item';

class EmailForwardingList extends React.Component {
	static propTypes = {
		emailForwarding: PropTypes.object.isRequired,
		translate: PropTypes.func.isRequired,
	};

	render() {
		const { emailForwarding, translate } = this.props,
			{ list, hasLoadedFromServer } = emailForwarding;

		if ( ! list && ! hasLoadedFromServer ) {
			return <span>{ translate( 'Loading…' ) }</span>;
		}

		if ( ! list ) {
			return null;
		}

		const emailForwardingItems = list.map( emailForwardingItem => {
			return (
				<EmailForwardingItem key={ emailForwardingItem.email } emailData={ emailForwardingItem } />
			);
		} );

		return <ul className="email-forwarding__list">{ emailForwardingItems }</ul>;
	}
}

export default localize( EmailForwardingList );
