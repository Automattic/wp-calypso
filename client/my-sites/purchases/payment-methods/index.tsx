/**
 * External dependencies
 */
import React, { useCallback } from 'react';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';
import page from 'page';
import { StripeHookProvider } from '@automattic/calypso-stripe';

/**
 * Internal dependencies
 */
import MySitesSidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import Main from 'calypso/components/main';
import DocumentHead from 'calypso/components/data/document-head';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import FormattedHeader from 'calypso/components/formatted-header';
import PurchasesNavigation from 'calypso/my-sites/purchases/navigation';
import PaymentMethodList from 'calypso/me/payment-methods/payment-method-list';
import HeaderCake from 'calypso/components/header-cake';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getAddNewPaymentMethod, getPaymentMethodsUrlFor } from '../paths';
import CreditCardForm from 'calypso/blocks/credit-card-form';
import { createCardToken, getStripeConfiguration } from 'calypso/lib/store-transactions';
import titles from 'calypso/me/purchases/titles';
import { addStoredCard } from 'calypso/state/stored-cards/actions';
import SiteLevelPurchasesErrorBoundary from 'calypso/my-sites/purchases/site-level-purchases-error-boundary';
import { logToLogstash } from 'calypso/state/logstash/actions';
import config from 'calypso/config';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import Layout from 'calypso/components/layout';
import Column from 'calypso/components/layout/column';
import PaymentMethodSidebar from 'calypso/me/purchases/components/payment-method-sidebar';

function useLogPaymentMethodsError( message: string ) {
	const reduxDispatch = useDispatch();

	return useCallback(
		( error ) => {
			reduxDispatch(
				logToLogstash( {
					feature: 'calypso_client',
					message,
					severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
					extra: {
						env: config( 'env_id' ),
						type: 'site_level_payment_methods',
						message: String( error ),
					},
				} )
			);
		},
		[ reduxDispatch, message ]
	);
}

/* eslint-disable wpcalypso/jsx-classname-namespace */
export function PaymentMethods( { siteSlug }: { siteSlug: string } ): JSX.Element {
	const translate = useTranslate();
	const logPaymentMethodsError = useLogPaymentMethodsError(
		'site level payment methods load error'
	);

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

			<SiteLevelPurchasesErrorBoundary
				errorMessage={ translate( 'Sorry, there was an error loading this page.' ) }
				onError={ logPaymentMethodsError }
			>
				<PaymentMethodList addPaymentMethodUrl={ getAddNewPaymentMethod( siteSlug ) } />
			</SiteLevelPurchasesErrorBoundary>
		</Main>
	);
}

export function AddNewPaymentMethod( { siteSlug }: { siteSlug: string } ): JSX.Element {
	const translate = useTranslate();
	const createAddCardToken = ( ...args: unknown[] ) => createCardToken( 'card_add', ...args );
	const goToBillingHistory = () => page( getPaymentMethodsUrlFor( siteSlug ) );
	const recordFormSubmitEvent = () => recordTracksEvent( 'calypso_add_credit_card_form_submit' );
	const reduxDispatch = useDispatch();
	const saveStoredCard = ( ...args: unknown[] ) => reduxDispatch( addStoredCard( ...args ) );
	const locale = useSelector( getCurrentUserLocale );
	const logPaymentMethodsError = useLogPaymentMethodsError(
		'site level add new payment method load error'
	);

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

			<SiteLevelPurchasesErrorBoundary
				errorMessage={ translate( 'Sorry, there was an error loading this page.' ) }
				onError={ logPaymentMethodsError }
			>
				<HeaderCake onClick={ goToBillingHistory }>{ titles.addCreditCard }</HeaderCake>
				<Layout>
					<Column type="main">
						<StripeHookProvider
							locale={ locale }
							configurationArgs={ { needs_intent: true } }
							fetchStripeConfiguration={ getStripeConfiguration }
						>
							<CreditCardForm
								createCardToken={ createAddCardToken }
								recordFormSubmitEvent={ recordFormSubmitEvent }
								saveStoredCard={ saveStoredCard }
								successCallback={ goToBillingHistory }
								showUsedForExistingPurchasesInfo={ true }
							/>
						</StripeHookProvider>
					</Column>
					<Column type="sidebar">
						<PaymentMethodSidebar />
					</Column>
				</Layout>
			</SiteLevelPurchasesErrorBoundary>
		</Main>
	);
}
/* eslint-enable wpcalypso/jsx-classname-namespace */
