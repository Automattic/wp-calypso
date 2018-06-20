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
import Button from 'components/button';

class CreditCards extends Component {
	state = {
		cards: [
			{
				lastDigits: '4242',
				cardType: 'visa',
				name: 'James Smith',
				expiry: '2023-05-31',
			},
			{
				lastDigits: '4444',
				cardType: 'mastercard',
				name: 'Jean Davis',
				expiry: '2021-01-31',
			},
		],
	};

	render() {
		return (
			<Fragment>
				{ this.state.cards.map( ( card, i ) => (
					<CreditCard key={ `${ card.lastDigits }_${ i }` } card={ card } selected={ 0 === i } />
				) ) }
				<CreditCard>
					<Button compact style={ { margin: 20 } }>
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
