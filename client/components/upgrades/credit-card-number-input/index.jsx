import { Component } from 'react';
import { getCreditCardType } from 'calypso/lib/checkout';
import Input from 'calypso/my-sites/domains/components/form/input';

class CreditCardNumberInput extends Component {
	render() {
		return (
			<div className="credit-card-number-input">
				<Input { ...this.props } classes={ getCreditCardType( this.props.value ) } />
			</div>
		);
	}
}

export default CreditCardNumberInput;
