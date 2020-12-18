/**
 * External dependencies
 */
import page from 'page';
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { StripeHookProvider } from '@automattic/calypso-stripe';

/**
 * Internal Dependencies
 */
import PaymentMethodForm from 'calypso/me/purchases/components/payment-method-form';
import HeaderCake from 'calypso/components/header-cake';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import titles from 'calypso/me/purchases/titles';
import TrackPurchasePageView from 'calypso/me/purchases/track-purchase-page-view';
import { clearPurchases } from 'calypso/state/purchases/actions';
import getStripeConfiguration from 'calypso/my-sites/checkout/get-stripe-configuration';
import {
	getByPurchaseId,
	hasLoadedUserPurchasesFromServer,
} from 'calypso/state/purchases/selectors';
import { getCurrentUserId, getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { isRequestingSites } from 'calypso/state/sites/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import Layout from 'calypso/components/layout';
import Column from 'calypso/components/layout/column';
import PaymentMethodSidebar from 'calypso/me/purchases/components/payment-method-sidebar';
import PaymentMethodLoader from 'calypso/me/purchases/components/payment-method-loader';
import { isEnabled } from 'calypso/config';
import { concatTitle } from 'calypso/lib/react-helpers';

function AddPaymentMethod( props ) {
	const isDataLoading = ! props.hasLoadedSites || ! props.hasLoadedUserPurchasesFromServer;
	const isDataValid = ( { purchase, selectedSite } ) => purchase && selectedSite;
	const addPaymentMethodTitle = isEnabled( 'purchases/new-payment-methods' )
		? titles.addPaymentMethod
		: titles.addCreditCard;

	if ( ! isDataLoading && ! isDataValid( props ) ) {
		// Redirect if invalid data
		page( props.purchaseListUrl );
	}

	if ( isDataLoading ) {
		return (
			<Fragment>
				<QueryUserPurchases userId={ props.userId } />

				<PaymentMethodLoader title={ titles.addPaymentMethod } />
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
				eventName="calypso_add_payment_method_to_purchase_view"
				purchaseId={ props.purchaseId }
			/>
			<PageViewTracker
				path={
					isEnabled( 'purchases/new-payment-methods' )
						? '/me/purchases/:site/:purchaseId/payment-method/add'
						: '/me/purchases/:site/:purchaseId/payment/add'
				}
				title={ concatTitle( titles.purchases, addPaymentMethodTitle ) }
			/>

			<HeaderCake backHref={ props.getManagePurchaseUrlFor( props.siteSlug, props.purchaseId ) }>
				{ addPaymentMethodTitle }
			</HeaderCake>

			<Layout>
				<Column type="main">
					<StripeHookProvider
						locale={ props.locale }
						configurationArgs={ { needs_intent: true } }
						fetchStripeConfiguration={ getStripeConfiguration }
					>
						<PaymentMethodForm
							apiParams={ { purchaseId: props.purchase.id } }
							purchase={ props.purchase }
							recordFormSubmitEvent={ recordFormSubmitEvent }
							siteSlug={ props.siteSlug }
							successCallback={ successCallback }
						/>
					</StripeHookProvider>
				</Column>
				<Column type="sidebar">
					<PaymentMethodSidebar purchase={ props.purchase } />
				</Column>
			</Layout>
		</Fragment>
	);
}

AddPaymentMethod.propTypes = {
	getManagePurchaseUrlFor: PropTypes.func.isRequired,
	purchaseListUrl: PropTypes.string.isRequired,
	clearPurchases: PropTypes.func.isRequired,
	hasLoadedSites: PropTypes.bool.isRequired,
	hasLoadedUserPurchasesFromServer: PropTypes.bool.isRequired,
	purchaseId: PropTypes.number.isRequired,
	purchase: PropTypes.object,
	selectedSite: PropTypes.object,
	siteSlug: PropTypes.string.isRequired,
	userId: PropTypes.number,
	locale: PropTypes.string,
	isFullWidth: PropTypes.bool.isRequired,
};

const mapStateToProps = ( state, { purchaseId } ) => ( {
	hasLoadedSites: ! isRequestingSites( state ),
	hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
	purchase: getByPurchaseId( state, purchaseId ),
	selectedSite: getSelectedSite( state ),
	userId: getCurrentUserId( state ),
	locale: getCurrentUserLocale( state ),
} );

export default connect( mapStateToProps, { clearPurchases, recordTracksEvent } )(
	AddPaymentMethod
);
