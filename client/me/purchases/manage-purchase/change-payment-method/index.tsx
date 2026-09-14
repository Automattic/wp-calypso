import { getPurchasePayment } from '@automattic/api-core';
import { purchaseQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { StripeHookProvider, useStripe } from '@automattic/calypso-stripe';
import { useQuery } from '@tanstack/react-query';
import { Fragment, useEffect } from 'react';
import HeaderCake from 'calypso/components/header-cake';
import Layout from 'calypso/components/layout';
import Column from 'calypso/components/layout/column';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { invalidatePurchaseQueries } from 'calypso/lib/purchases/actions';
import { getStripeConfiguration } from 'calypso/lib/store-transactions';
import PaymentMethodLoader from 'calypso/me/purchases/components/payment-method-loader';
import PaymentMethodSidebar from 'calypso/me/purchases/components/payment-method-sidebar';
import titles from 'calypso/me/purchases/titles';
import TrackPurchasePageView from 'calypso/me/purchases/track-purchase-page-view';
import { useStoredPaymentMethods } from 'calypso/my-sites/checkout/src/hooks/use-stored-payment-methods';
import { useSelector, useDispatch } from 'calypso/state';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { clearPurchases } from 'calypso/state/purchases/actions';
import { isRequestingSites } from 'calypso/state/sites/selectors';
import PaymentMethodSelector from '../payment-method-selector';
import getPaymentMethodIdFromPayment from '../payment-method-selector/get-payment-method-id-from-payment';
import useCreateAssignablePaymentMethods from './use-create-assignable-payment-methods';

interface ChangePaymentMethodProps {
	getManagePurchaseUrlFor: ( siteSlug: string, purchaseId: number ) => string;
	purchaseId: number;
	purchaseListUrl: string;
	siteSlug: string;
}

function ChangePaymentMethod( {
	getManagePurchaseUrlFor,
	purchaseId,
	purchaseListUrl,
	siteSlug,
}: ChangePaymentMethodProps ) {
	const hasLoadedSites = useSelector( ( state ) => ! isRequestingSites( state ) );
	const { data: purchase, isPending: isPendingPurchase } = useQuery( purchaseQuery( purchaseId ) );
	const payment = purchase ? getPurchasePayment( purchase ) : undefined;
	const { isLoading: isLoadingStoredCards } = useStoredPaymentMethods( { type: 'card' } );

	const { isStripeLoading } = useStripe();

	const isDataLoading =
		! hasLoadedSites || isPendingPurchase || isLoadingStoredCards || isStripeLoading;

	useEffect( () => {
		if ( ! isDataLoading && ! purchase ) {
			// Redirect if invalid data
			page( purchaseListUrl );
		}
	}, [ isDataLoading, purchase, purchaseListUrl ] );

	const currentPaymentMethodId = getPaymentMethodIdFromPayment( payment );
	const changePaymentMethodTitle = getChangePaymentMethodTitleCopy( currentPaymentMethodId );
	const paymentMethods = useCreateAssignablePaymentMethods( currentPaymentMethodId );
	const reduxDispatch = useDispatch();

	if ( isDataLoading || ! purchase ) {
		return <PaymentMethodLoader title={ changePaymentMethodTitle } />;
	}

	const successCallback = () => {
		reduxDispatch( clearPurchases() );
		invalidatePurchaseQueries();
		page( getManagePurchaseUrlFor( siteSlug, purchase.ID ) );
	};

	return (
		<Fragment>
			<TrackPurchasePageView
				eventName="calypso_change_payment_method_view"
				purchaseId={ purchaseId }
			/>
			<PageViewTracker
				path="/me/purchases/:site/:purchaseId/payment-method/change/:cardId"
				title={ `${ titles.activeUpgrades } › ${ changePaymentMethodTitle }` }
			/>

			<HeaderCake backHref={ getManagePurchaseUrlFor( siteSlug, purchaseId ) }>
				{ changePaymentMethodTitle }
			</HeaderCake>

			<Layout>
				<Column type="main">
					<PaymentMethodSelector
						purchase={ purchase }
						paymentMethods={ paymentMethods }
						successCallback={ successCallback }
						eventContext="/me/purchases/:site/:purchaseId/payment-method/change/:cardId"
					/>
				</Column>
				<Column type="sidebar">
					<PaymentMethodSidebar purchase={ purchase } />
				</Column>
			</Layout>
		</Fragment>
	);
}

function getChangePaymentMethodTitleCopy( currentPaymentMethodId: string ): string {
	if ( [ 'credits', 'none' ].includes( currentPaymentMethodId ) ) {
		return String( titles.addPaymentMethod );
	}
	return String( titles.changePaymentMethod );
}

export default function ChangePaymentMethodWrapper( props: ChangePaymentMethodProps ) {
	const locale = useSelector( getCurrentUserLocale );
	return (
		<StripeHookProvider locale={ locale } fetchStripeConfiguration={ getStripeConfiguration }>
			<ChangePaymentMethod { ...props } />
		</StripeHookProvider>
	);
}
