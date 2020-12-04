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
import PaymentMethod from './payment-method';
import PaymentMethodDelete from './payment-method-delete';
import {
	getStoredCards,
	getUniquePaymentAgreements,
	hasLoadedStoredCardsFromServer,
	isFetchingStoredCards,
} from 'calypso/state/stored-cards/selectors';
import QueryStoredCards from 'calypso/components/data/query-stored-cards';
import SectionHeader from 'calypso/components/section-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

/**
 * Style dependencies
 */
import './style.scss';

class PaymentMethodList extends Component {
	renderPaymentMethods( cards ) {
		if ( this.props.isFetching && ! this.props.hasLoadedFromServer ) {
			return (
				<Card className="payment-method-list__loader">
					<div className="payment-method-list__loading-placeholder-card loading-placeholder__content" />
					<div className="payment-method-list__loading-placeholder-details loading-placeholder__content" />
				</Card>
			);
		}

		if ( ! cards.length ) {
			return <Card>{ this.props.translate( 'You have no saved cards.' ) }</Card>;
		}

		return cards.map( ( card ) => {
			return (
				<PaymentMethod key={ card.stored_details_id }>
					<PaymentMethodDelete card={ card } />
				</PaymentMethod>
			);
		} );
	}

	goToAddPaymentMethod = () => {
		recordTracksEvent( 'calypso_purchases_click_add_new_payment_method' );
		page( this.props.addPaymentMethodUrl );
	};

	renderAddPaymentMethodButton() {
		if ( ! config.isEnabled( 'manage/payment-methods' ) ) {
			return null;
		}

		return (
			<Button primary compact onClick={ this.goToAddPaymentMethod }>
				{ this.props.translate( 'Add credit card' ) }
			</Button>
		);
	}

	render() {
		return (
			<div className="payment-method-list">
				<QueryStoredCards />
				<SectionHeader label={ this.props.translate( 'Manage Your Payment Agreements' ) }>
					{ this.renderAddPaymentMethodButton() }
				</SectionHeader>

				{ this.renderPaymentMethods( this.props.cards ) }

				{ this.props.hasLoadedFromServer && this.props.paymentAgreements.length > 0 && (
					<>{ this.renderPaymentMethods( this.props.paymentAgreements ) }</>
				) }
			</div>
		);
	}
}

PaymentMethodList.propTypes = {
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
} ) )( localize( PaymentMethodList ) );
