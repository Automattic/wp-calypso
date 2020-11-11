/**
 * External dependencies
 */

import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import config from 'calypso/config';
import CreditCard from './credit-card';
import CreditCardDelete from './credit-card-delete';
import {
	getStoredCards,
	getUniquePaymentAgreements,
	hasLoadedStoredCardsFromServer,
	isFetchingStoredCards,
} from 'calypso/state/stored-cards/selectors';
import QueryStoredCards from 'calypso/components/data/query-stored-cards';
import SectionHeader from 'calypso/components/section-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

class CreditCards extends Component {
	renderCards( cards ) {
		if ( this.props.isFetching && ! this.props.hasLoadedFromServer ) {
			return <Card>{ this.props.translate( 'Loading…' ) }</Card>;
		}

		if ( ! cards.length ) {
			return <Card>{ this.props.translate( 'You have no saved cards.' ) }</Card>;
		}

		return cards.map( ( card ) => {
			return (
				<CreditCard key={ card.stored_details_id }>
					<CreditCardDelete card={ card } />
				</CreditCard>
			);
		} );
	}

	goToAddCreditCard = () => {
		recordTracksEvent( 'calypso_purchases_click_add_new_payment_method' );
		page( this.props.addPaymentMethodUrl );
	};

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

				{ this.renderCards( this.props.cards ) }

				{ this.props.hasLoadedFromServer && this.props.paymentAgreements.length > 0 && (
					<>
						<SectionHeader label={ this.props.translate( 'Manage Your Payment Agreements' ) } />
						{ this.renderCards( this.props.paymentAgreements ) }
					</>
				) }
			</div>
		);
	}
}

CreditCards.propTypes = {
	addPaymentMethodUrl: PropTypes.string.isRequired,
	// From connect:
	cards: PropTypes.array.isRequired,
	paymentAgreements: PropTypes.array.isRequired,
	hasLoadedFromServer: PropTypes.bool,
	isFetching: PropTypes.bool,
};

export default connect( ( state ) => ( {
	cards: getStoredCards( state ),
	paymentAgreements: getUniquePaymentAgreements( state ),
	hasLoadedFromServer: hasLoadedStoredCardsFromServer( state ),
	isFetching: isFetchingStoredCards( state ),
} ) )( localize( CreditCards ) );
