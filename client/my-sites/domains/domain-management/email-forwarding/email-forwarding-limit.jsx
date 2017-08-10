/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { emailForwardingPlanLimit } from 'lib/domains/email-forwarding';

const EmailForwardingLimit = React.createClass( {
	render() {
		const used = this.props.emailForwarding.list.length;

		if ( used < 1 ) {
			return null;
		}

		return (
			<div className="email-forwarding__limit">
				{ this.translate( 'You are using %(used)s out of %(available)s email forwards.', {
					args: {
						used,
						available: emailForwardingPlanLimit( this.props.selectedSite.plan ),
					},
				} ) }
			</div>
		);
	},
} );

export default EmailForwardingLimit;
