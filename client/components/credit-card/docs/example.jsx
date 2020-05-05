/**
 * External dependencies
 */

import React, { Component, Fragment } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CreditCard from '..';
import { Button } from '@automattic/components';

const CREDIT_CARD_EXAMPLES = [
	{
		lastDigits: '0005',
		cardType: 'amex',
		name: 'Jacob Freeman',
		expiry: '2021-05-31',
	},
	{
		lastDigits: '0004',
		cardType: 'diners',
		name: 'Katherine Russell',
		expiry: '2022-06-30',
	},
	{
		lastDigits: '1117',
		cardType: 'discover',
		name: 'Barbara Hanson',
		expiry: '2023-07-31',
	},
	{
		lastDigits: '0505',
		cardType: 'jcb',
		name: '加藤 亮',
		expiry: '2024-08-31',
	},
	{
		lastDigits: '4444',
		cardType: 'mastercard',
		name: 'Luigi Vitali',
		expiry: '2025-09-30',
	},
	{
		lastDigits: '0005',
		cardType: 'unionpay',
		name: '朱 芬',
		expiry: '2026-10-31',
	},
	{
		lastDigits: '4242',
		cardType: 'visa',
		name: 'Holly Baker',
		expiry: '2027-11-30',
	},
	{
		lastDigits: '',
		cardType: '',
		paymentPartner: 'paypal_express',
		name: 'Eduardo Aute',
		email: 'mail@example.org',
		expiry: '0000-00-00',
	},
];

class CreditCards extends Component {
	state = {
		selectedCardIndex: 0,
	};

	changeSelectedCard = () => {
		const index = ( this.state.selectedCardIndex + 1 ) % CREDIT_CARD_EXAMPLES.length;
		this.setState( { selectedCardIndex: index } );
	};

	render() {
		return (
			<Fragment>
				{ CREDIT_CARD_EXAMPLES.map( ( card, i ) => (
					<CreditCard
						key={ `${ card.lastDigits }_${ i }` }
						card={ card }
						selected={ i === this.state.selectedCardIndex }
					/>
				) ) }
				<CreditCard>
					<Button compact style={ { margin: 20 } } onClick={ this.changeSelectedCard }>
						{ this.props.translate( 'Add another credit card' ) }
					</Button>
				</CreditCard>
			</Fragment>
		);
	}
}

const LocalizedCreditCards = localize( CreditCards );
LocalizedCreditCards.displayName = 'CreditCard';

export default LocalizedCreditCards;
