/** @format */

/**
 * External dependencies
 */

import React, { Component, Fragment } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CreditCard from '..';

class CreditCards extends Component {
	state = {
		cards: [
			{
				card: '4242',
				cardType: 'visa',
				name: 'James Smith',
				expiry: '05/23',
			},
			{
				card: '4444',
				cardType: 'mastercard',
				name: 'Jean Davis',
				expiry: '01/21',
			},
		],
	};

	render() {
		return (
			<Fragment>
				{ this.state.cards.map( ( card, i ) => <CreditCard key={ i } card={ card } /> ) }
				<CreditCard>{ this.props.translate( 'Add another credit card...' ) }</CreditCard>
			</Fragment>
		);
	}
}

const LocalizedCreditCards = localize( CreditCards );
LocalizedCreditCards.displayName = 'CreditCard';

export default LocalizedCreditCards;
