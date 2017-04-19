/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import GoDaddyMail from '../dns/godaddy-email';

class DnsTemplates extends Component {
	render() {
		const { translate } = this.props;

		return (
			<Card>
				{ translate( 'If you have already bought an e-mail service for the domain, ' +
					'you can set it up with a single click:' ) }
				<div>
					<GoDaddyMail domain={ this.props.selectedDomainName } />
				</div>
			</Card>
		);
	}
}

export default localize( DnsTemplates );
