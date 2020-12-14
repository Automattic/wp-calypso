/**
 * External dependencies
 */
import page from 'page';
import PropTypes from 'prop-types';
import React, { Fragment, useState, useMemo, useCallback } from 'react';
import { connect, useSelector } from 'react-redux';
import { StripeHookProvider, useStripe } from '@automattic/calypso-stripe';
import {
	CheckoutProvider,
	CheckoutPaymentMethods,
	usePaymentMethodId,
	useMessages,
} from '@automattic/composite-checkout';
import { Card, Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import wp from 'calypso/lib/wp';
import notices from 'calypso/notices';
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
	getStoredCards,
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
import {
	useCreatePayPal,
	useCreateCreditCard,
	useCreateExistingCards,
} from 'calypso/my-sites/checkout/composite-checkout/use-create-payment-methods';
import Gridicon from 'calypso/components/gridicon';
import { localizeUrl } from 'calypso/lib/i18n-utils';
import { AUTO_RENEWAL, MANAGE_PURCHASES } from 'calypso/lib/url/support';

function ChangePaymentMethod( props ) {
	const { isStripeLoading } = useStripe();

	const isDataLoading =
		! props.hasLoadedSites ||
		! props.hasLoadedUserPurchasesFromServer ||
		! props.hasLoadedStoredCardsFromServer ||
		isStripeLoading;
	const isDataValid = ( { purchase, selectedSite } ) => purchase && selectedSite;
	const changePaymentMethodTitle = isEnabled( 'purchases/new-payment-methods' )
		? titles.changePaymentMethod
		: titles.editCardDetails;

	if ( ! isDataLoading && ! isDataValid( props ) ) {
		// Redirect if invalid data
		page( props.purchaseListUrl );
	}

	if ( isDataLoading ) {
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
					{ isEnabled( 'purchases/new-payment-methods' ) ? (
						<ChangePaymentMethodList
							currentPaymentMethod={ props.card }
							purchase={ props.purchase }
							isDataLoading={ isDataLoading }
							successCallback={ successCallback }
						/>
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
const wpcomAssignPaymentMethod = ( subscriptionId, stored_details_id, fn ) =>
	wpcom.assignPaymentMethod( subscriptionId, stored_details_id, fn );

function ChangePaymentMethodList( {
	currentPaymentMethod,
	purchase,
	isDataLoading,
	successCallback,
} ) {
	const currentlyAssignedPaymentMethodId = 'existingCard-' + currentPaymentMethod.stored_details_id; // TODO: make this work for paypal.

	const [ formSubmitting, setFormSubmitting ] = useState( false );
	const translate = useTranslate();
	const { isStripeLoading, stripeLoadingError } = useStripe();
	const [ paymentMethods ] = useAssignablePaymentMethods();

	const disabled = isStripeLoading || formSubmitting || stripeLoadingError || ! paymentMethods;

	const showErrorMessage = useCallback(
		( error ) => {
			const message = error && error.toString ? error.toString() : error;
			notices.error(
				message || translate( 'An error occurred while reassigning your payment method.' )
			);
		},
		[ translate ]
	);

	const showInfoMessage = useCallback( ( message ) => {
		notices.info( message );
	}, [] );

	const showSuccessMessage = useCallback( ( message ) => {
		notices.success( message, { persistent: true, duration: 5000 } );
	}, [] );

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
			showErrorMessage={ showErrorMessage }
			showInfoMessage={ showInfoMessage }
			showSuccessMessage={ showSuccessMessage }
			paymentMethods={ paymentMethods }
			paymentProcessors={ {} }
			isLoading={ isDataLoading || isStripeLoading }
			initiallySelectedPaymentMethodId={ currentlyAssignedPaymentMethodId }
		>
			<Card className="change-payment-method__content">
				<QueryPaymentCountries />

				<CheckoutPaymentMethods className="change-payment-method__list" isComplete={ false } />
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
					purchase={ purchase }
					setFormSubmitting={ setFormSubmitting }
					successCallback={ successCallback }
				/>
			</Card>
		</CheckoutProvider>
	);
}

function SaveButton( {
	translate,
	disabled,
	formSubmitting,
	purchase,
	setFormSubmitting,
	successCallback,
} ) {
	const [ selectedPaymentMethodId ] = usePaymentMethodId();
	const { showErrorMessage, showSuccessMessage } = useMessages();

	const isSubmitting = disabled || formSubmitting;

	const onClick = () => {
		setFormSubmitting( true );
		wpcomAssignPaymentMethod( purchase.id, selectedPaymentMethodId.replace( /^existingCard-/, '' ) )
			.then( () => {
				showSuccessMessage( translate( 'Your payment method has been set.' ) );
				setFormSubmitting( false );
				successCallback();
			} )
			.catch( ( error ) => {
				showErrorMessage( error );
				setFormSubmitting( false );
			} );
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

function useAssignablePaymentMethods() {
	const { isStripeLoading, stripeLoadingError, stripeConfiguration, stripe } = useStripe();

	const paypalMethod = useCreatePayPal();

	const stripeMethod = useCreateCreditCard( {
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
		shouldUseEbanx: false,
	} );

	// getStoredCards always returns a new array, but we need a memoized version
	// to pass to useCreateExistingCards, which has storedCards as a data dependency.
	const rawStoredCards = useSelector( getStoredCards );
	const storedCards = useMemo( () => rawStoredCards, [] ); // eslint-disable-line
	const existingCardMethods = useCreateExistingCards( {
		storedCards,
		stripeConfiguration,
	} );

	const paymentMethods = useMemo(
		() => [ paypalMethod, stripeMethod, ...existingCardMethods ].filter( Boolean ),
		[ paypalMethod, stripeMethod, existingCardMethods ]
	);

	return [ paymentMethods ];
}

function ChangePaymentMethodWrapper( props ) {
	return (
		<StripeHookProvider
			locale={ props.locale }
			configurationArgs={ { needs_intent: true } }
			fetchStripeConfiguration={ getStripeConfiguration }
		>
			<ChangePaymentMethod { ...props } />
		</StripeHookProvider>
	);
}

export default connect( mapStateToProps, { clearPurchases, recordTracksEvent } )(
	ChangePaymentMethodWrapper
);
