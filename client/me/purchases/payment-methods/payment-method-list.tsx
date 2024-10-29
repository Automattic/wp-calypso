import page from '@automattic/calypso-router';
import { Button, CompactCard } from '@automattic/components';
import { CheckoutProvider } from '@automattic/composite-checkout';
import { localize, translate } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import Notice from 'calypso/components/notice';
import SectionHeader from 'calypso/components/section-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import PaymentMethod from 'calypso/me/purchases/payment-methods/payment-method';
import { withStoredPaymentMethods } from 'calypso/my-sites/checkout/src/hooks/use-stored-payment-methods';
import { isAgencyUser } from 'calypso/state/partner-portal/partner/selectors';
import {
	hasLoadedSitePurchasesFromServer,
	hasLoadedUserPurchasesFromServer,
} from 'calypso/state/purchases/selectors';
import type { StoredPaymentMethod } from 'calypso/lib/checkout/payment-methods';
import type { WithStoredPaymentMethodsProps } from 'calypso/my-sites/checkout/src/hooks/use-stored-payment-methods';
import type { IAppState } from 'calypso/state/types';

import 'calypso/me/purchases/payment-methods/style.scss';

interface PaymentMethodListProps {
	addPaymentMethodUrl: string;
	translate: typeof translate;
	isAgencyUser: boolean;
	hasLoadedSitePurchasesFromServer: boolean;
	hasLoadedUserPurchasesFromServer: boolean;
}

class PaymentMethodList extends Component<
	PaymentMethodListProps & WithStoredPaymentMethodsProps
> {
	renderPaymentMethods( paymentMethods: StoredPaymentMethod[] ) {
		const hasLoadedPurchases =
			this.props.hasLoadedUserPurchasesFromServer || this.props.hasLoadedSitePurchasesFromServer;

		if ( this.props.paymentMethodsState.isLoading || ! hasLoadedPurchases ) {
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
			<>
				{ isJetpackCloud() && this.props.isAgencyUser && (
					<Notice status="is-info" showDismiss={ false }>
						{ this.props.translate(
							'The cards stored here are used for purchases made via Jetpack.com. ' +
								'If you intend to update your card to make purchases in Jetpack Manage, then do so {{a}}here{{/a}}.',
							{
								components: {
									a: <a href="/partner-portal/payment-methods" />,
								},
							}
						) }
					</Notice>
				) }
				<div className="payment-method-list">
					<SectionHeader label={ this.props.translate( 'Manage Your Payment Methods' ) }>
						{ this.renderAddPaymentMethodButton() }
					</SectionHeader>

					{ this.renderPaymentMethods( paymentMethods ) }
				</div>
			</>
		);
	}
}

export default connect( ( state: IAppState ) => ( {
	isAgencyUser: isAgencyUser( state ),
	hasLoadedSitePurchasesFromServer: hasLoadedSitePurchasesFromServer( state ),
	hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
} ) )( withStoredPaymentMethods( localize( PaymentMethodList ), { type: 'all', expired: true } ) );
