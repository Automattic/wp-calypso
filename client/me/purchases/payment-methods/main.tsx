/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getAddNewPaymentMethodPath } from 'calypso/me/purchases/utils';
import MeSidebarNavigation from 'calypso/me/sidebar-navigation';
import PaymentMethodList from 'calypso/me/purchases/payment-methods/payment-method-list';
import PurchasesNavigation from 'calypso/me/purchases/purchases-navigation';
import Main from 'calypso/components/main';
import DocumentHead from 'calypso/components/data/document-head';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import titles from 'calypso/me/purchases/titles';
import FormattedHeader from 'calypso/components/formatted-header';

/**
 * Style dependencies
 */
import './style.scss';

export default function PaymentMethods(): JSX.Element {
	const translate = useTranslate();

	return (
		<Main className="payment-methods__main is-wide-layout">
			<DocumentHead title={ translate( 'Payment Methods' ) } />
			<PageViewTracker path="/me/purchases/payment-methods" title="Me > Payment Methods" />
			<MeSidebarNavigation />
			<FormattedHeader brandFont headerText={ titles.sectionTitle } align="left" />
			<PurchasesNavigation section={ 'payment-methods' } />
			<PaymentMethodList addPaymentMethodUrl={ getAddNewPaymentMethodPath() } />
		</Main>
	);
}
