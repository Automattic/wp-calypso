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
import QueryStoredCards from 'calypso/components/data/query-stored-cards';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import titles from 'calypso/me/purchases/titles';
import TrackPurchasePageView from 'calypso/me/purchases/track-purchase-page-view';
import { clearPurchases } from 'calypso/state/purchases/actions';
import { createCardToken, getStripeConfiguration } from 'calypso/lib/store-transactions';
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

function ChangePaymentMethod( props ) {
	const isDataLoading = ! props.hasLoadedSites || ! props.hasLoadedUserPurchasesFromServer;
	const isDataValid = ( { purchase, selectedSite } ) => purchase && selectedSite;

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

	const createCardUpdateToken = ( ...args ) => createCardToken( 'card_update', ...args );

	return (
		<Fragment>
			<TrackPurchasePageView
				eventName="calypso_edit_card_details_purchase_view"
				purchaseId={ props.purchaseId }
			/>
			<PageViewTracker
				path="/me/purchases/:site/:purchaseId/payment/edit/:cardId"
				title="Purchases > Edit Card Details"
			/>

			<HeaderCake backHref={ props.getManagePurchaseUrlFor( props.siteSlug, props.purchaseId ) }>
				{ titles.changePaymentMethod }
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
							createCardToken={ createCardUpdateToken }
							initialValues={ props.card }
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
