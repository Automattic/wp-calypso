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
			<tr className="payments__method-row">
				<ListTd>
					{
						method.suggested &&
						( <p className="payments__method-suggested">Suggested Method</p> )
					}
					<p>{ method.name }</p>
				</ListTd>
				<ListTd>
					<p>{ method.fee }</p>
					<p><a href={ method.information }>More Information</a></p>
				</ListTd>
				<ListTd>
					<Button>Set Up</Button>
				</ListTd>
			</tr>
		);
	}

}

export default PaymentMethodRow;
