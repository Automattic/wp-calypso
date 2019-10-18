/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import { getCreditCardType } from 'lib/checkout';
import Input from 'my-sites/domains/components/form/input';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Image assets
 */
import creditCardAmexImage from 'assets/images/upgrades/cc-amex.svg';
import creditCardDinersImage from 'assets/images/upgrades/cc-diners.svg';
import creditCardDiscoverImage from 'assets/images/upgrades/cc-discover.svg';
import creditCardJCBImage from 'assets/images/upgrades/cc-jcb.svg';
import creditCardMasterCardImage from 'assets/images/upgrades/cc-mastercard.svg';
import creditCardPlaceholderImage from 'assets/images/upgrades/cc-placeholder.svg';
import creditCardUnionPayImage from 'assets/images/upgrades/cc-unionpay.svg';
import creditCardVisaImage from 'assets/images/upgrades/cc-visa.svg';

const CREDIT_CARD_PATHS = {
	amex: creditCardAmexImage,
	diners: creditCardDinersImage,
	discover: creditCardDiscoverImage,
	jcb: creditCardJCBImage,
	mastercard: creditCardMasterCardImage,
	unionpay: creditCardUnionPayImage,
	visa: creditCardVisaImage,
};

const CREDIT_CARD_DEFAULT_PATH = creditCardPlaceholderImage;

class CreditCardNumberInput extends React.Component {
	static getTypeImageURL( value ) {
		const type = getCreditCardType( value );
		const imagePath = CREDIT_CARD_PATHS[ type ] || CREDIT_CARD_DEFAULT_PATH;
		return `url(${ imagePath })`;
	}

	render() {
		const inputStyle = this.props.disabled
			? {}
			: { backgroundImage: CreditCardNumberInput.getTypeImageURL( this.props.value ) };

		return (
			<div className="credit-card-number-input">
				<Input { ...this.props } inputStyle={ inputStyle } />
			</div>
		);
	}
}

export default CreditCardNumberInput;
