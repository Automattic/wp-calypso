/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import SimpleNotice from 'notices/simple-notice';
import { getSelectedDomain } from 'lib/domains';

const TransferProhibitedNotice = React.createClass( {
	propTypes: {
		domains: React.PropTypes.object.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired
	},

	render() {
		const { transferProhibited } = getSelectedDomain( this.props );

		if ( ! transferProhibited ) {
			return null;
		}

		return (
			<SimpleNotice showDismiss={ false } status="is-error">
				<p>
					{ this.translate(
						'Please note that due to the Internet Corporation for Assigned ' +
						'Names and Numbers (ICANN) you may not transfer your domain ' +
						'name to a new registrar within the first 60 days after ' +
						'initial registration, or the first 60 days after a transfer.'
					) }
				</p>
			</SimpleNotice>
		);
	}
} );

export default TransferProhibitedNotice;
