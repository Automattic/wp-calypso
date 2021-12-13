import { Button, CompactCard } from '@automattic/components';
import { localize, translate } from 'i18n-calypso';
import page from 'page';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryStoredCards from 'calypso/components/data/query-stored-cards';
import SectionHeader from 'calypso/components/section-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { isCreditCard } from 'calypso/lib/checkout/payment-methods';
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
import type { PaymentMethod as PaymentMethodType } from 'calypso/lib/checkout/payment-methods';
import type { StoredCard } from 'calypso/my-sites/checkout/composite-checkout/types/stored-cards';

import 'calypso/me/purchases/payment-methods/style.scss';

interface PaymentMethodListProps {
	addPaymentMethodUrl: string;
	cards: StoredCard[];
	paymentAgreements: PaymentMethodType[];
	hasLoadedFromServer?: boolean;
	isFetching?: boolean;
	translate: typeof translate;
}

class PaymentMethodList extends Component< PaymentMethodListProps > {
	renderPaymentMethods( paymentMethods: PaymentMethodType[] ) {
		if ( this.props.isFetching && ! this.props.hasLoadedFromServer ) {
			return (
				<CompactCard className="payment-method-list__loader">
					<div className="payment-method-list__loading-placeholder-card loading-placeholder__content" />
					<div className="payment-method-list__loading-placeholder-details loading-placeholder__content" />
				</CompactCard>
			);
		}

		if ( ! paymentMethods.length ) {
			return (
				<CompactCard>{ this.props.translate( 'You have no saved payment methods.' ) }</CompactCard>
			);
		}

		return paymentMethods.map( ( paymentMethod ) => {
			return (
				<PaymentMethod key={ paymentMethod.stored_details_id }>
					<PaymentMethodDetails
						lastDigits={ paymentMethod.card }
						email={ paymentMethod.email }
						cardType={ paymentMethod.card_type || '' }
						paymentPartner={ paymentMethod.payment_partner }
						name={ paymentMethod.name }
						expiry={ paymentMethod.expiry }
						isExpired={ paymentMethod.is_expired }
					/>
					{ isCreditCard( paymentMethod ) && <PaymentMethodBackupToggle card={ paymentMethod } /> }
					<PaymentMethodDelete card={ paymentMethod } />
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

export default connect( ( state ) => ( {
	cards: getAllStoredCards( state ),
	paymentAgreements: getUniquePaymentAgreements( state ),
	hasLoadedFromServer: hasLoadedStoredCardsFromServer( state ),
	isFetching: isFetchingStoredCards( state ),
} ) )( localize( PaymentMethodList ) );
