import { Button, CompactCard } from '@automattic/components';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryStoredCards from 'calypso/components/data/query-stored-cards';
import SectionHeader from 'calypso/components/section-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import PaymentMethod from 'calypso/me/purchases/payment-methods/payment-method';
import PaymentMethodBackupToggle from 'calypso/me/purchases/payment-methods/payment-method-backup-toggle';
import PaymentMethodDelete from 'calypso/me/purchases/payment-methods/payment-method-delete';
import {
	getAllStoredCards,
	getUniquePaymentAgreements,
	hasLoadedStoredCardsFromServer,
	isFetchingStoredCards,
} from 'calypso/state/stored-cards/selectors';
import PaymentMethodDetails from './payment-method-details';

import 'calypso/me/purchases/payment-methods/style.scss';

class PaymentMethodList extends Component {
	renderPaymentMethods( cards ) {
		if ( this.props.isFetching && ! this.props.hasLoadedFromServer ) {
			return (
				<CompactCard className="payment-method-list__loader">
					<div className="payment-method-list__loading-placeholder-card loading-placeholder__content" />
					<div className="payment-method-list__loading-placeholder-details loading-placeholder__content" />
				</CompactCard>
			);
		}

		if ( ! cards.length ) {
			return (
				<CompactCard>{ this.props.translate( 'You have no saved payment methods.' ) }</CompactCard>
			);
		}

		return cards.map( ( card ) => {
			return (
				<PaymentMethod key={ card.stored_details_id }>
					<PaymentMethodDetails
						lastDigits={ card.card }
						email={ card.email }
						cardType={ card.card_type || '' }
						paymentPartner={ card.payment_partner }
						name={ card.name }
						expiry={ card.expiry }
						isExpired={ card.is_expired }
					/>
					<PaymentMethodBackupToggle card={ card } />
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
		return (
			<Button primary compact onClick={ this.goToAddPaymentMethod }>
				{ this.props.translate( 'Add payment method' ) }
			</Button>
		);
	}

	render() {
		let paymentMethods = this.props.cards;
		if ( this.props.hasLoadedFromServer && this.props.paymentAgreements.length > 0 ) {
			paymentMethods = paymentMethods.concat( this.props.paymentAgreements );
		}

		return (
			<div className="payment-method-list">
				<QueryStoredCards />
				<SectionHeader label={ this.props.translate( 'Manage Your Payment Methods' ) }>
					{ this.renderAddPaymentMethodButton() }
				</SectionHeader>

				{ this.renderPaymentMethods( paymentMethods ) }
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
	cards: getAllStoredCards( state ),
	paymentAgreements: getUniquePaymentAgreements( state ),
	hasLoadedFromServer: hasLoadedStoredCardsFromServer( state ),
	isFetching: isFetchingStoredCards( state ),
} ) )( localize( PaymentMethodList ) );
