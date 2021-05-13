/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

import { localize } from 'i18n-calypso';

class EmailForwardingLimit extends React.Component {
	static propTypes = {
		emailForwardingCount: PropTypes.number.isRequired,
		emailForwardingLimit: PropTypes.number.isRequired,
	};

	render() {
		const { emailForwardingCount, emailForwardingLimit } = this.props;

		return (
			<div className="email-forwarding__limit">
				{ this.props.translate( 'You are using %(used)s out of %(available)s email forwards.', {
					args: {
						used: emailForwardingCount,
						available: emailForwardingLimit,
					},
				} ) }
			</div>
		);
	}
}

export default localize( EmailForwardingLimit );
