/**
 * External dependencies
 */
import page from 'page';
import PropTypes from 'prop-types';
import React, { Fragment, useState } from 'react';
import { connect } from 'react-redux';
import { StripeHookProvider, useStripe } from '@automattic/calypso-stripe';
import {
	CheckoutProvider,
	CheckoutPaymentMethods,
	usePaymentMethodId,
} from '@automattic/composite-checkout';
import { Card, Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import wp from 'calypso/lib/wp';
import PaymentMethodForm from 'calypso/me/purchases/components/payment-method-form';
import HeaderCake from 'calypso/components/header-cake';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import QueryStoredCards from 'calypso/components/data/query-stored-cards';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import QueryPaymentCountries from 'calypso/components/data/query-countries/payments';
import titles from 'calypso/me/purchases/titles';
import TrackPurchasePageView from 'calypso/me/purchases/track-purchase-page-view';
import { clearPurchases } from 'calypso/state/purchases/actions';
import { getStripeConfiguration } from 'calypso/lib/store-transactions';
import {
	getByPurchaseId,
	hasLoadedUserPurchasesFromServer,
} from 'calypso/state/purchases/selectors';
import { getCurrentUserId, getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import {
	getStoredCardById,
	hasLoadedStoredCardsFromServer,
} from 'calypso/state/stored-cards/selectors';
import { isRequestingSites } from 'calypso/state/sites/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import Layout from 'calypso/components/layout';
import Column from 'calypso/components/layout/column';
import PaymentMethodSidebar from 'calypso/me/purchases/components/payment-method-sidebar';
import PaymentMethodLoader from 'calypso/me/purchases/components/payment-method-loader';
import { isEnabled } from 'calypso/config';
import { concatTitle } from 'calypso/lib/react-helpers';
import useStoredCards from 'calypso/my-sites/checkout/composite-checkout/hooks/use-stored-cards';
import {
	useCreatePayPal,
	useCreateCreditCard,
	useCreateExistingCards,
} from 'calypso/my-sites/checkout/composite-checkout/use-create-payment-methods';
import Gridicon from 'calypso/components/gridicon';
import { localizeUrl } from 'calypso/lib/i18n-utils';
import { AUTO_RENEWAL, MANAGE_PURCHASES } from 'calypso/lib/url/support';

function ChangePaymentMethod( props ) {
	const isDataLoading = ! props.hasLoadedSites || ! props.hasLoadedUserPurchasesFromServer;
	const isDataValid = ( { purchase, selectedSite } ) => purchase && selectedSite;
	const changePaymentMethodTitle = isEnabled( 'purchases/new-payment-methods' )
		? titles.changePaymentMethod
		: titles.editCardDetails;

	if ( ! isDataLoading && ! isDataValid( props ) ) {
		// Redirect if invalid data
		page( props.purchaseListUrl );
	}

	if ( isDataLoading || ! props.hasLoadedStoredCardsFromServer ) {
		return (
			<Fragment>
				<QueryStoredCards />

				<QueryUserPurchases userId={ props.userId } />

				<PaymentMethodLoader title={ titles.changePaymentMethod } />
			</Fragment>
		);
	}

	const recordFormSubmitEvent = () =>
		void props.recordTracksEvent( 'calypso_purchases_credit_card_form_submit', {
			product_slug: props.purchase.productSlug,
		} );

	const successCallback = () => {
		const { id } = props.purchase;
		props.clearPurchases();
		page( props.getManagePurchaseUrlFor( props.siteSlug, id ) );
	};

	return (
		<Fragment>
			<TrackPurchasePageView
				eventName="calypso_change_payment_method_view"
				purchaseId={ props.purchaseId }
			/>
			<PageViewTracker
				path={
					isEnabled( 'purchases/new-payment-methods' )
						? '/me/purchases/:site/:purchaseId/payment-method/change/:cardId'
						: '/me/purchases/:site/:purchaseId/payment/change/:cardId'
				}
				title={ concatTitle( titles.purchases, changePaymentMethodTitle ) }
			/>

			<HeaderCake backHref={ props.getManagePurchaseUrlFor( props.siteSlug, props.purchaseId ) }>
				{ changePaymentMethodTitle }
			</HeaderCake>

			<Layout>
				<Column type="main">
					<StripeHookProvider
						locale={ props.locale }
						configurationArgs={ { needs_intent: true } }
						fetchStripeConfiguration={ getStripeConfiguration }
					>
						{ isEnabled( 'purchases/new-payment-methods' ) ? (
							<ChangePaymentMethodList />
						) : (
							<PaymentMethodForm
								apiParams={ { purchaseId: props.purchase.id } }
								initialValues={ props.card }
								purchase={ props.purchase }
								recordFormSubmitEvent={ recordFormSubmitEvent }
								siteSlug={ props.siteSlug }
								successCallback={ successCallback }
							/>
						) }
					</StripeHookProvider>
				</Column>
				<Column type="sidebar">
					<PaymentMethodSidebar purchase={ props.purchase } />
				</Column>
			</Layout>
		</Fragment>
	);
}

ChangePaymentMethod.propTypes = {
	card: PropTypes.object,
	clearPurchases: PropTypes.func.isRequired,
	hasLoadedSites: PropTypes.bool.isRequired,
	hasLoadedStoredCardsFromServer: PropTypes.bool.isRequired,
	hasLoadedUserPurchasesFromServer: PropTypes.bool.isRequired,
	purchaseId: PropTypes.number.isRequired,
	purchase: PropTypes.object,
	selectedSite: PropTypes.object,
	siteSlug: PropTypes.string.isRequired,
	userId: PropTypes.number,
	locale: PropTypes.string,
	purchaseListUrl: PropTypes.string.isRequired,
	getManagePurchaseUrlFor: PropTypes.func.isRequired,
	isFullWidth: PropTypes.bool.isRequired,
};

const wpcom = wp.undocumented();
const wpcomGetStoredCards = () => wpcom.getStoredCards();

function ChangePaymentMethodList() {
	const [ formSubmitting ] = useState( false );
	const translate = useTranslate();

	const { storedCards } = useStoredCards( wpcomGetStoredCards, false );
	const { isStripeLoading, stripeLoadingError, stripeConfiguration, stripe } = useStripe();

	const paypalMethod = useCreatePayPal();

	const stripeMethod = useCreateCreditCard( {
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
		shouldUseEbanx: false,
	} );

	const existingCardMethods = useCreateExistingCards( {
		storedCards,
		stripeConfiguration,
	} );

	const paymentMethods = [ paypalMethod, stripeMethod, ...existingCardMethods ].filter( Boolean );
	const disabled = isStripeLoading || stripeLoadingError;

	return (
		<CheckoutProvider
			items={ [] }
			total={ {
				amount: { value: 0, currency: 'USD', displayValue: '$0' },
				id: 'xyzzy',
				type: 'FAAAKE',
				label: 'fake thing',
			} }
			onPaymentComplete={ () => {} }
			showErrorMessage={ () => {} }
			showInfoMessage={ () => {} }
			showSuccessMessage={ () => {} }
			paymentMethods={ paymentMethods }
			paymentProcessors={ {} }
			isLoading={ false }
		>
			<Card className="change-payment-method__content">
				<QueryPaymentCountries />

				<CheckoutPaymentMethods className="change-payment-method__list" />
				<div className="change-payment-method__terms">
					<Gridicon icon="info-outline" size={ 18 } />
					<p>
						<TosText translate={ translate } />
					</p>
				</div>

				<SaveButton
					translate={ translate }
					disabled={ disabled }
					formSubmitting={ formSubmitting }
				/>
			</Card>
		</CheckoutProvider>
	);
}

function SaveButton( { translate, disabled, formSubmitting } ) {
	const [ paymentMethodId ] = usePaymentMethodId();

	// TODO: make sure the button busy state works correctly
	const isSubmitting = disabled || formSubmitting;

	const onClick = () => {
		// TODO: do the actual submission here
		window.alert( 'YOU CLICKED SUBMIT ' + paymentMethodId );
	};

	return (
		// TODO: change button text based on payment method
		<Button disabled={ isSubmitting } busy={ isSubmitting } onClick={ onClick } primary>
			{ formSubmitting
				? translate( 'Saving card…', {
						context: 'Button label',
						comment: 'Credit card',
				  } )
				: translate( 'Save card', {
						context: 'Button label',
						comment: 'Credit card',
				  } ) }
		</Button>
	);
}

function TosText( { translate } ) {
	// TODO: Make sure we use the correct ToS text for paypal
	return translate(
		'By saving a credit card, you agree to our {{tosLink}}Terms of Service{{/tosLink}}, and if ' +
			'you use it to pay for a subscription or plan, you authorize your credit card to be charged ' +
			'on a recurring basis until you cancel, which you can do at any time. ' +
			'You understand {{autoRenewalSupportPage}}how your subscription works{{/autoRenewalSupportPage}} ' +
			'and {{managePurchasesSupportPage}}how to cancel{{/managePurchasesSupportPage}}.',
		{
			components: {
				tosLink: (
					<a
						href={ localizeUrl( 'https://wordpress.com/tos/' ) }
						target="_blank"
						rel="noopener noreferrer"
					/>
				),
				autoRenewalSupportPage: (
					<a href={ AUTO_RENEWAL } target="_blank" rel="noopener noreferrer" />
				),
				managePurchasesSupportPage: (
					<a href={ MANAGE_PURCHASES } target="_blank" rel="noopener noreferrer" />
				),
			},
		}
	);
}

const mapStateToProps = ( state, { cardId, purchaseId } ) => ( {
	card: getStoredCardById( state, cardId ),
	hasLoadedSites: ! isRequestingSites( state ),
	hasLoadedStoredCardsFromServer: hasLoadedStoredCardsFromServer( state ),
	hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
	purchase: getByPurchaseId( state, purchaseId ),
	selectedSite: getSelectedSite( state ),
	userId: getCurrentUserId( state ),
	locale: getCurrentUserLocale( state ),
} );

export default connect( mapStateToProps, { clearPurchases, recordTracksEvent } )(
	ChangePaymentMethod
);
