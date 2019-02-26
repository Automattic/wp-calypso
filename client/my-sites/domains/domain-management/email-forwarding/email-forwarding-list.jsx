/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import EmailForwardingItem from './email-forwarding-item';

class EmailForwardingList extends React.Component {
	static propTypes = {
		emailForwardingList: PropTypes.array,
	};

	render() {
		const { emailForwardingList } = this.props;
		return (
			<ul className="email-forwarding__list">
				{ emailForwardingList.map( emailForwardingItem => {
					return (
						<EmailForwardingItem
							key={ emailForwardingItem.email }
							emailData={ emailForwardingItem }
						/>
					);
				} ) }
			</ul>
		);
	}
}

export default EmailForwardingList;
