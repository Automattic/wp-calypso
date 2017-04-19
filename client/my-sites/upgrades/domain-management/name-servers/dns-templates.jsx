/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import GoDaddyMail from '../dns/godaddy-email';

class DnsTemplates extends Component {
	render() {
		const { translate } = this.props;

		return (
			<div className="name-servers__dns_templates is-compact card">
				<span className="name-servers__title">
					{ translate( 'If you have already bought an e-mail service for the domain, ' +
						'you can set it up with a single click:' ) }
				</span>
				<div className="name-servers__toggle">
					<GoDaddyMail domain={ this.props.selectedDomainName } />
				</div>
			</div>
		);
	}
}

export default localize( DnsTemplates );
