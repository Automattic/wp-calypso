/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ListTd from '../../../components/list/list-td';

class PaymentMethodRow extends Component {

	static propTypes = {
		method: PropTypes.shape( {
			name: PropTypes.string.isRequired,
			suggested: PropTypes.bool.isRequired,
			fee: PropTypes.string.isRequired,
			information: PropTypes.string.isRequired,
		} ),
	};

	render() {
		const { method } = this.props;

		return (
			<tr>
				<ListTd>
					{ method.suggested && ( <span>Suggested Method</span> ) }
					{ method.name }
				</ListTd>
				<ListTd>
					{ method.fee }
					<a href={ method.information }>More Information</a>
				</ListTd>
				<ListTd>
					<Button>Set Up</Button>
				</ListTd>
			</tr>
		);
	}

}

export default PaymentMethodRow;
