/**
 * External dependencies
 */
import React from 'react';

const EmailForwardingLimit = React.createClass( {
	maxForwards() {
		if ( this.props.maxForwards === 500 ) {
			return 'unlimited';
		}

		return this.props.maxForwards;
	},

	render() {
		const used = this.props.emailForwarding.list.length;

		if ( used < 1 ) {
			return null;
		}

		return (
			<div className="email-forwarding__limit">{ this.translate(
				'You are using %(used)s out of %(available)s email forwards.', {
					args: {
						used,
						available: this.maxForwards()
					}
				} ) }</div>
		);
	}
} );

export default EmailForwardingLimit;
