/** @format */

/**
 * External dependencies
 */

import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import config from 'config';
import CreditCardDelete from './credit-card-delete';
import CreditCard from 'components/credit-card';
import {
	getStoredCards,
	hasLoadedStoredCardsFromServer,
	isFetchingStoredCards,
} from 'state/stored-cards/selectors';
import QueryStoredCards from 'components/data/query-stored-cards';
import { addCreditCard } from 'me/purchases/paths';
import SectionHeader from 'components/section-header';

class CreditCards extends Component {
	renderCards() {
		if ( this.props.isFetching && ! this.props.hasLoadedFromServer ) {
			return <div className="credit-cards__no-results">{ this.props.translate( 'Loading…' ) }</div>;
		}

		if ( ! this.props.cards.length ) {
			return (
				<div className="credit-cards__no-results">
					{ this.props.translate( 'You have no saved cards.' ) }
				</div>
			);
		}

		return this.props.cards.map( card => {
			return (
				<CreditCard key={ card.stored_details_id }>
					<CreditCardDelete card={ card } />
				</CreditCard>
			);
		} );
	}

	goToAddCreditCard() {
		page( addCreditCard );
	}

	renderAddCreditCardButton() {
		if ( ! config.isEnabled( 'manage/payment-methods' ) ) {
			return null;
		}

		return (
			<Button primary compact className="credit-cards__add" onClick={ this.goToAddCreditCard }>
				{ this.props.translate( 'Add Credit Card' ) }
			</Button>
		);
	}

	render() {
		return (
			<div className="credit-cards">
				<QueryStoredCards />

				<SectionHeader label={ this.props.translate( 'Manage Your Credit Cards' ) }>
					{ this.renderAddCreditCardButton() }
				</SectionHeader>

				<Card>
					<div>{ this.renderCards() }</div>
				</Card>
			</div>
		);
	}
}

export default connect( state => ( {
	cards: getStoredCards( state ),
	hasLoadedFromServer: hasLoadedStoredCardsFromServer( state ),
	isFetching: isFetchingStoredCards( state ),
} ) )( localize( CreditCards ) );
