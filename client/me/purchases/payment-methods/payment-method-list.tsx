import page from '@automattic/calypso-router';
import { Button, CompactCard } from '@automattic/components';
import { CheckoutProvider } from '@automattic/composite-checkout';
import { localize, translate } from 'i18n-calypso';
import { Component } from 'react';
import SectionHeader from 'calypso/components/section-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import PaymentMethod from 'calypso/me/purchases/payment-methods/payment-method';
import { withStoredPaymentMethods } from 'calypso/my-sites/checkout/src/hooks/use-stored-payment-methods';
import type { StoredPaymentMethod } from 'calypso/lib/checkout/payment-methods';
import type { WithStoredPaymentMethodsProps } from 'calypso/my-sites/checkout/src/hooks/use-stored-payment-methods';

import 'calypso/me/purchases/payment-methods/style.scss';

interface PaymentMethodListProps {
	addPaymentMethodUrl: string;
	translate: typeof translate;
}

class PaymentMethodList extends Component<
	PaymentMethodListProps & WithStoredPaymentMethodsProps
> {
	renderPaymentMethods( paymentMethods: StoredPaymentMethod[] ) {
		if ( this.props.paymentMethodsState.isLoading ) {
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

		return (
			<div className="payment-method-list__payment-methods">
				<CheckoutProvider paymentMethods={ [] } paymentProcessors={ {} }>
					{ paymentMethods.map( ( paymentMethod ) => {
						return (
							<PaymentMethod
								paymentMethod={ paymentMethod }
								key={ paymentMethod.stored_details_id }
							/>
						);
					} ) }
				</CheckoutProvider>
			</div>
		);
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
		const paymentMethods = this.props.paymentMethodsState.paymentMethods;

		return (
			<div className="payment-method-list">
				<SectionHeader label={ this.props.translate( 'Manage Your Payment Methods' ) }>
					{ this.renderAddPaymentMethodButton() }
				</SectionHeader>

				{ this.renderPaymentMethods( paymentMethods ) }
			</div>
		);
	}
}

export default withStoredPaymentMethods( localize( PaymentMethodList ), {
	type: 'all',
	expired: true,
} );
