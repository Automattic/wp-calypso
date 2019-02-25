/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

import { localize } from 'i18n-calypso';

class EmailForwardingLimit extends React.Component {
	static propTypes = {
		emailForwarding: PropTypes.object.isRequired,
		emailForwardingLimit: PropTypes.number.isRequired,
	};

	render() {
		const { emailForwarding, emailForwardingLimit } = this.props;

		const used = emailForwarding.list.length;

		if ( used < 1 ) {
			return null;
		}

		return (
			<div className="email-forwarding__limit">
				{ this.props.translate( 'You are using %(used)s out of %(available)s email forwards.', {
					args: {
						used,
						available: emailForwardingLimit,
					},
				} ) }
			</div>
		);
	}
}

export default localize( EmailForwardingLimit );
