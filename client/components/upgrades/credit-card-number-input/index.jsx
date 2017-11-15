/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import { getCreditCardType } from 'lib/credit-card-details';
import Input from 'my-sites/domains/components/form/input';

class CreditCardNumberInput extends React.Component {
	render() {
		return (
			<div className="credit-card-number-input">
				<Input { ...this.props } classes={ getCreditCardType( this.props.value ) } />
			</div>
		);
	}
}

export default CreditCardNumberInput;
