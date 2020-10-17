/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { addCreditCard } from 'calypso/me/purchases/paths';
import MeSidebarNavigation from 'calypso/me/sidebar-navigation';
import CreditCards from 'calypso/me/purchases/credit-cards';
import PurchasesHeader from '../purchases/purchases-list/header';
import Main from 'calypso/components/main';
import DocumentHead from 'calypso/components/data/document-head';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';

export function PaymentMethods(): JSX.Element {
	const translate = useTranslate();

	return (
		<Main className="payment-methods">
			<DocumentHead title={ translate( 'Payment Methods' ) } />
			<PageViewTracker path="/me/purchases/payment-methods" title="Me > Payment Methods" />
			<MeSidebarNavigation />
			<PurchasesHeader section={ 'payment-methods' } />

			<CreditCards addPaymentMethodUrl={ addCreditCard } />
		</Main>
	);
}
