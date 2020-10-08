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
import { Button, Card } from '@automattic/components';
import config from 'calypso/config';
import CreditCard from 'calypso/components/credit-card';
import CreditCardDelete from './credit-card-delete';
import {
	getStoredCards,
	getUniquePaymentAgreements,
	hasLoadedStoredCardsFromServer,
	isFetchingStoredCards,
} from 'calypso/state/stored-cards/selectors';
import QueryStoredCards from 'calypso/components/data/query-stored-cards';
import { addCreditCard } from 'calypso/me/purchases/paths';
import SectionHeader from 'calypso/components/section-header';

/**
 * Style dependencies
 */
import './credit-cards.scss';

class CreditCards extends Component {
	renderCards( cards ) {
		if ( this.props.isFetching && ! this.props.hasLoadedFromServer ) {
			return <div className="credit-cards__no-results">{ this.props.translate( 'Loading…' ) }</div>;
		}

		if ( ! cards.length ) {
			return (
				<div className="credit-cards__no-results">
					{ this.props.translate( 'You have no saved cards.' ) }
				</div>
			);
		}

		return cards.map( ( card ) => {
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
				{ this.props.translate( 'Add credit card' ) }
			</Button>
		);
	}

	render() {
		return (
			<div className="credit-cards">
				<QueryStoredCards />
				<SectionHeader label={ this.props.translate( 'Manage your credit cards' ) }>
					{ this.renderAddCreditCardButton() }
				</SectionHeader>
				<Card>
					<div>{ this.renderCards( this.props.cards ) }</div>
				</Card>

				{ this.props.hasLoadedFromServer && this.props.paymentAgreements.length > 0 && (
					<>
						<SectionHeader label={ this.props.translate( 'Manage Your Payment Agreements' ) } />
						<Card>
							<div>{ this.renderCards( this.props.paymentAgreements ) }</div>
						</Card>
					</>
				) }
			</div>
		);
	}
}

export default connect( ( state ) => ( {
	cards: getStoredCards( state ),
	paymentAgreements: getUniquePaymentAgreements( state ),
	hasLoadedFromServer: hasLoadedStoredCardsFromServer( state ),
	isFetching: isFetchingStoredCards( state ),
} ) )( localize( CreditCards ) );
