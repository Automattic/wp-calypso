import PropTypes from 'prop-types';
import { Component } from 'react';
import EmailForwardingItem from './email-forwarding-item';

class EmailForwardingList extends Component {
	static propTypes = {
		emailForwards: PropTypes.array,
	};

	render() {
		const { emailForwards } = this.props;
		return (
			<ul className="email-forwarding__list">
				{ emailForwards.map( ( emailForwardingItem ) => {
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
