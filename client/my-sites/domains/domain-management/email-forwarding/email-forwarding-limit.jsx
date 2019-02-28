/** @format */

/**
 * External dependencies
 */

import React from 'react';

import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { emailForwardingPlanLimit } from 'lib/domains/email-forwarding';

class EmailForwardingLimit extends React.Component {
	render() {
		const used = this.props.emailForwarding.list.length;

		if ( used < 1 ) {
			return null;
		}

		return (
			<div className="email-forwarding__limit">
				{ this.props.translate( 'You are using %(used)s out of %(available)s email forwards.', {
					args: {
						used,
						available: emailForwardingPlanLimit( this.props.selectedSite.plan ),
					},
				} ) }
			</div>
		);
	}
}

export default localize( EmailForwardingLimit );
