/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import MySitesSidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import Main from 'calypso/components/main';
import DocumentHead from 'calypso/components/data/document-head';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import FormattedHeader from 'calypso/components/formatted-header';
import PurchasesNavigation from 'calypso/my-sites/purchases/navigation';
import CreditCards from 'calypso/me/purchases/credit-cards';
import HeaderCake from 'calypso/components/header-cake';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getAddNewPaymentMethod, getPaymentMethodsUrlFor } from '../paths';
import { StripeHookProvider } from 'calypso/lib/stripe';
import CreditCardForm from 'calypso/blocks/credit-card-form';
import { createCardToken } from 'calypso/lib/store-transactions';
import titles from 'calypso/me/purchases/titles';
import { addStoredCard } from 'calypso/state/stored-cards/actions';

/* eslint-disable wpcalypso/jsx-classname-namespace */
export function PaymentMethods( { siteSlug }: { siteSlug: string } ) {
	const translate = useTranslate();

	return (
		<Main className="purchases is-wide-layout">
			<MySitesSidebarNavigation />
			<DocumentHead title={ translate( 'Payment Methods' ) } />
			<PageViewTracker path="/purchases/payment-methods" title="Payment Methods" />
			<FormattedHeader
				brandFont
				className="payment-methods__page-heading"
				headerText={ translate( 'Billing' ) }
				align="left"
			/>
			<PurchasesNavigation sectionTitle={ 'Payment Methods' } siteSlug={ siteSlug } />

			<CreditCards addPaymentMethodUrl={ getAddNewPaymentMethod( siteSlug ) } />
		</Main>
	);
}

export function AddNewPaymentMethod( { siteSlug }: { siteSlug: string } ) {
	const translate = useTranslate();
	const createAddCardToken = ( ...args: unknown[] ) => createCardToken( 'card_add', ...args );
	const goToBillingHistory = () => page( getPaymentMethodsUrlFor( siteSlug ) );
	const recordFormSubmitEvent = () => recordTracksEvent( 'calypso_add_credit_card_form_submit' );
	const reduxDispatch = useDispatch();
	const saveStoredCard = ( ...args: unknown[] ) => reduxDispatch( addStoredCard( ...args ) );

	return (
		<Main className="purchases is-wide-layout">
			<MySitesSidebarNavigation />
			<PageViewTracker path="/purchases/add-credit-card" title="Add Credit Card" />
			<DocumentHead title={ translate( 'Add Credit Card' ) } />
			<FormattedHeader
				brandFont
				className="payment-methods__page-heading"
				headerText={ translate( 'Billing' ) }
				align="left"
			/>

			<HeaderCake onClick={ goToBillingHistory }>{ titles.addCreditCard }</HeaderCake>
			<StripeHookProvider configurationArgs={ { needs_intent: true } }>
				<CreditCardForm
					createCardToken={ createAddCardToken }
					recordFormSubmitEvent={ recordFormSubmitEvent }
					saveStoredCard={ saveStoredCard }
					successCallback={ goToBillingHistory }
					showUsedForExistingPurchasesInfo={ true }
				/>
			</StripeHookProvider>
		</Main>
	);
}
/* eslint-enable wpcalypso/jsx-classname-namespace */
