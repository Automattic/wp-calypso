/**
 * External dependencies
 */
import page from 'page';
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { StripeHookProvider, useStripe } from '@automattic/calypso-stripe';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import HeaderCake from 'calypso/components/header-cake';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import QueryStoredCards from 'calypso/components/data/query-stored-cards';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
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
import PaymentMethodSelector from '../payment-method-selector';
import getPaymentMethodIdFromPayment from '../payment-method-selector/get-payment-method-id-from-payment';
import useCreateAssignablePaymentMethods from './use-create-assignable-payment-methods';

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

	const currentPaymentMethodId = getPaymentMethodIdFromPayment( props.payment );
	const changePaymentMethodTitle = getChangePaymentMethodTitleCopy( currentPaymentMethodId );
	const paymentMethods = useCreateAssignablePaymentMethods( currentPaymentMethodId );

	if ( isDataLoading ) {
		return (
			<Fragment>
				<QueryStoredCards />
				<QueryUserPurchases userId={ props.userId } />
				<PaymentMethodLoader title={ changePaymentMethodTitle } />
			</Fragment>
		);
	}

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
				path="/me/purchases/:site/:purchaseId/payment-method/change/:cardId"
				title={ `${ titles.activeUpgrades } › ${ changePaymentMethodTitle }` }
			/>

			<HeaderCake backHref={ props.getManagePurchaseUrlFor( props.siteSlug, props.purchaseId ) }>
				{ changePaymentMethodTitle }
			</HeaderCake>

			<Layout>
				<Column type="main">
					{
						<PaymentMethodSelector
							purchase={ props.purchase }
							paymentMethods={ paymentMethods }
							successCallback={ successCallback }
						/>
					}
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

function getChangePaymentMethodTitleCopy( currentPaymentMethodId ) {
	if ( [ 'credits', 'none' ].includes( currentPaymentMethodId ) ) {
		return titles.addPaymentMethod;
	}
	return titles.changePaymentMethod;
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
	localize( ChangePaymentMethodWrapper )
);
