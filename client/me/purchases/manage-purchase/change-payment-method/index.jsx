/**
 * External dependencies
 */
import page from 'page';
import PropTypes from 'prop-types';
import React, { Fragment, useCallback } from 'react';
import { connect, useSelector, useDispatch } from 'react-redux';
import { StripeHookProvider, useStripe } from '@automattic/calypso-stripe';
import {
	CheckoutProvider,
	CheckoutPaymentMethods,
	CheckoutSubmitButton,
} from '@automattic/composite-checkout';
import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import PaymentMethodForm from 'calypso/me/purchases/components/payment-method-form';
import HeaderCake from 'calypso/components/header-cake';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import QueryStoredCards from 'calypso/components/data/query-stored-cards';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import QueryPaymentCountries from 'calypso/components/data/query-countries/payments';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import Notice from 'calypso/components/notice';
import titles from 'calypso/me/purchases/titles';
import TrackPurchasePageView from 'calypso/me/purchases/track-purchase-page-view';
import { clearPurchases } from 'calypso/state/purchases/actions';
import { errorNotice, infoNotice, successNotice } from 'calypso/state/notices/actions';
import { getStripeConfiguration } from 'calypso/lib/store-transactions';
import { creditCardHasAlreadyExpired } from 'calypso/lib/purchases';
import {
	getByPurchaseId,
	hasLoadedUserPurchasesFromServer,
} from 'calypso/state/purchases/selectors';
import { getCurrentUserId, getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import {
	getStoredCardById,
	getStoredPaymentAgreements,
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
import Gridicon from 'calypso/components/gridicon';
import {
	useHandleRedirectChangeError,
	useHandleRedirectChangeComplete,
} from './url-event-handlers';
import useCreateAssignablePaymentMethods from './use-create-assignable-payment-methods';
import {
	assignPayPalProcessor,
	assignNewCardProcessor,
	assignExistingCardProcessor,
} from './assignment-processor-functions';
import TosText from './tos-text';

import 'calypso/me/purchases/components/payment-method-form/style.scss';

function ChangePaymentMethod( props ) {
	const { isStripeLoading } = useStripe();

	const isDataLoading =
		! props.hasLoadedSites ||
		! props.hasLoadedUserPurchasesFromServer ||
		! props.hasLoadedStoredCardsFromServer ||
		isStripeLoading;
	const isDataValid = ( { purchase, selectedSite } ) => purchase && selectedSite;

	if ( ! isDataLoading && ! isDataValid( props ) ) {
		// Redirect if invalid data
		page( props.purchaseListUrl );
	}

	const currentPaymentMethodId = getCurrentPaymentMethodId( props.payment );
	const changePaymentMethodTitle = getChangePaymentMethodTitleCopy( currentPaymentMethodId );

	if ( isDataLoading ) {
		return (
			<Fragment>
				<QueryStoredCards />
				<QueryUserPurchases userId={ props.userId } />
				<PaymentMethodLoader title={ changePaymentMethodTitle } />
			</Fragment>
		);
	}

	const recordFormSubmitEvent = () =>
		void props.recordTracksEvent( 'calypso_purchases_credit_card_form_submit', {
			product_slug: props.purchase.productSlug,
		} );

	const successCallback = () => {
		props.clearPurchases();
		page( props.getManagePurchaseUrlFor( props.siteSlug, props.purchase.id ) );
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
				title={ concatTitle( titles.activeUpgrades, changePaymentMethodTitle ) }
			/>

			<HeaderCake backHref={ props.getManagePurchaseUrlFor( props.siteSlug, props.purchaseId ) }>
				{ changePaymentMethodTitle }
			</HeaderCake>

			<Layout>
				<Column type="main">
					{ isEnabled( 'purchases/new-payment-methods' ) ? (
						<ChangePaymentMethodList
							currentlyAssignedPaymentMethodId={ currentPaymentMethodId }
							purchase={ props.purchase }
							successCallback={ successCallback }
							siteSlug={ props.siteSlug }
							apiParams={ { purchaseId: props.purchase.id } }
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
	payment: PropTypes.object,
	selectedSite: PropTypes.object,
	siteSlug: PropTypes.string.isRequired,
	userId: PropTypes.number,
	locale: PropTypes.string,
	purchaseListUrl: PropTypes.string.isRequired,
	getManagePurchaseUrlFor: PropTypes.func.isRequired,
	isFullWidth: PropTypes.bool.isRequired,
};

// Returns an ID as used in the payment method list inside CheckoutPaymentMethods.
function getCurrentPaymentMethodId( payment ) {
	if ( payment?.type === 'credits' ) {
		return 'credits';
	}
	if ( payment?.type === 'paypal' ) {
		// This intentionally is not 'paypal' because we don't want to highlight
		// the paypal checkbox in case they want to add a new paypal agreement.
		return 'paypal-existing';
	}
	if ( payment?.type === 'credit_card' ) {
		return 'existingCard-' + payment.creditCard.id;
	}
	return 'none';
}

function getChangePaymentMethodTitleCopy( currentPaymentMethodId ) {
	if ( isEnabled( 'purchases/new-payment-methods' ) ) {
		if ( [ 'credits', 'none' ].includes( currentPaymentMethodId ) ) {
			return titles.addPaymentMethod;
		}
		return titles.changePaymentMethod;
	}
	return titles.editCardDetails;
}

// We want to preselect the current method if it is in the list, but if not, preselect the first method.
function getInitiallySelectedPaymentMethodId( currentlyAssignedPaymentMethodId, paymentMethods ) {
	if (
		! paymentMethods.some(
			( paymentMethod ) => paymentMethod.id === currentlyAssignedPaymentMethodId
		)
	) {
		return paymentMethods?.[ 0 ]?.id;
	}

	return currentlyAssignedPaymentMethodId;
}

function ChangePaymentMethodList( {
	currentlyAssignedPaymentMethodId,
	purchase,
	successCallback,
	siteSlug,
	apiParams,
} ) {
	const translate = useTranslate();
	const reduxDispatch = useDispatch();
	const { isStripeLoading, stripe, stripeConfiguration } = useStripe();
	const paymentMethods = useCreateAssignablePaymentMethods( currentlyAssignedPaymentMethodId );

	const showErrorMessage = useCallback(
		( error ) => {
			const message = error?.toString ? error.toString() : error;
			reduxDispatch( errorNotice( message, { persistent: true } ) );
		},
		[ reduxDispatch ]
	);

	const showInfoMessage = useCallback(
		( message ) => {
			reduxDispatch( infoNotice( message ) );
		},
		[ reduxDispatch ]
	);

	const showSuccessMessage = useCallback(
		( message ) => {
			reduxDispatch( successNotice( message, { persistent: true, duration: 5000 } ) );
		},
		[ reduxDispatch ]
	);

	const currentPaymentMethodNotAvailable = ! paymentMethods.some(
		( paymentMethod ) => paymentMethod.id === currentlyAssignedPaymentMethodId
	);

	useHandleRedirectChangeError( () => {
		showErrorMessage(
			translate( 'There was a problem assigning that payment method. Please try again.' )
		);
	} );
	useHandleRedirectChangeComplete( () => {
		onChangeComplete( { successCallback, translate, showSuccessMessage, reduxDispatch } );
	} );

	return (
		<CheckoutProvider
			onPaymentComplete={ () =>
				onChangeComplete( { successCallback, translate, showSuccessMessage, reduxDispatch } )
			}
			showErrorMessage={ showErrorMessage }
			showInfoMessage={ showInfoMessage }
			showSuccessMessage={ showSuccessMessage }
			paymentMethods={ paymentMethods }
			paymentProcessors={ {
				paypal: () => assignPayPalProcessor( purchase ),
				'existing-card': ( data ) => assignExistingCardProcessor( purchase, data ),
				card: ( data ) =>
					assignNewCardProcessor(
						{ purchase, translate, siteSlug, apiParams, stripe, stripeConfiguration },
						data
					),
			} }
			isLoading={ isStripeLoading }
			initiallySelectedPaymentMethodId={ getInitiallySelectedPaymentMethodId(
				currentlyAssignedPaymentMethodId,
				paymentMethods
			) }
		>
			<Card className="change-payment-method__content">
				<QueryPaymentCountries />
				{ currentPaymentMethodNotAvailable && (
					<CurrentPaymentMethodNotAvailableNotice purchase={ purchase } />
				) }
				<CheckoutPaymentMethods className="change-payment-method__list" isComplete={ false } />
				<div className="change-payment-method__terms">
					<Gridicon icon="info-outline" size={ 18 } />
					<p>
						<TosText />
					</p>
				</div>

				<CheckoutSubmitButton />
			</Card>
		</CheckoutProvider>
	);
}

function onChangeComplete( { successCallback, translate, showSuccessMessage, reduxDispatch } ) {
	reduxDispatch( recordTracksEvent( 'calypso_purchases_save_new_payment_method' ) );
	showSuccessMessage( translate( 'Your payment method has been set.' ) );
	successCallback();
}

function CurrentPaymentMethodNotAvailableNotice( { purchase } ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const storedPaymentAgreements = useSelector( getStoredPaymentAgreements );
	const noticeProps = { showDismiss: false };

	if ( creditCardHasAlreadyExpired( purchase ) ) {
		noticeProps.text = translate(
			'Your %(cardType)s ending in %(cardNumber)d expired %(cardExpiry)s.',
			{
				args: {
					cardType: purchase.payment.creditCard.type.toUpperCase(),
					cardNumber: parseInt( purchase.payment.creditCard.number, 10 ),
					cardExpiry: moment( purchase.payment.creditCard.expiryDate, 'MM/YY' ).format(
						'MMMM YYYY'
					),
				},
			}
		);
		return <Notice { ...noticeProps } />;
	}

	if ( getCurrentPaymentMethodId( purchase.payment ) === 'paypal-existing' ) {
		const storedPaymentAgreement = storedPaymentAgreements.find(
			( agreement ) => agreement.stored_details_id === purchase.payment.storedDetailsId
		);
		if ( storedPaymentAgreement?.email ) {
			noticeProps.text = translate(
				'This purchase is currently billed to your PayPal account (%(emailAddress)s).',
				{
					args: {
						emailAddress: storedPaymentAgreement.email,
					},
				}
			);
			return <Notice { ...noticeProps } />;
		}

		noticeProps.text = translate( 'This purchase is currently billed to your PayPal account.' );
		return <Notice { ...noticeProps } />;
	}

	return null;
}

const mapStateToProps = ( state, { cardId, purchaseId } ) => ( {
	card: getStoredCardById( state, cardId ),
	hasLoadedSites: ! isRequestingSites( state ),
	hasLoadedStoredCardsFromServer: hasLoadedStoredCardsFromServer( state ),
	hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
	purchase: getByPurchaseId( state, purchaseId ),
	payment: getByPurchaseId( state, purchaseId )?.payment,
	selectedSite: getSelectedSite( state ),
	userId: getCurrentUserId( state ),
	locale: getCurrentUserLocale( state ),
} );

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
