/**
 * External dependencies
 */
import page from 'page';
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import CreditCardForm from 'calypso/blocks/credit-card-form';
import CreditCardFormLoadingPlaceholder from 'calypso/blocks/credit-card-form/loading-placeholder';
import HeaderCake from 'calypso/components/header-cake';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import titles from 'calypso/me/purchases/titles';
import TrackPurchasePageView from 'calypso/me/purchases/track-purchase-page-view';
import { clearPurchases } from 'calypso/state/purchases/actions';
import { createCardToken } from 'calypso/lib/store-transactions';
import {
	getByPurchaseId,
	hasLoadedUserPurchasesFromServer,
} from 'calypso/state/purchases/selectors';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { isRequestingSites } from 'calypso/state/sites/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { StripeHookProvider } from 'calypso/lib/stripe';

function AddCardDetails( props ) {
	const createCardUpdateToken = ( ...args ) => createCardToken( 'card_update', ...args );
	const isDataLoading = ! props.hasLoadedSites || ! props.hasLoadedUserPurchasesFromServer;
	const isDataValid = ( { purchase, selectedSite } ) => purchase && selectedSite;

	if ( ! isDataLoading && ! isDataValid( props ) ) {
		// Redirect if invalid data
		page( props.purchaseListUrl );
	}

	if ( isDataLoading ) {
		return (
			<Fragment>
				<QueryUserPurchases userId={ props.userId } />

				<CreditCardFormLoadingPlaceholder
					title={ titles.addCardDetails }
					isFullWidth={ props.isFullWidth }
				/>
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
				eventName="calypso_add_card_details_purchase_view"
				purchaseId={ props.purchaseId }
			/>
			<PageViewTracker
				path="/me/purchases/:site/:purchaseId/payment/add"
				title="Purchases > Add Card Details"
			/>
			<HeaderCake backHref={ props.getManagePurchaseUrlFor( props.siteSlug, props.purchaseId ) }>
				{ titles.addCardDetails }
			</HeaderCake>

			<StripeHookProvider configurationArgs={ { needs_intent: true } }>
				<CreditCardForm
					apiParams={ { purchaseId: props.purchase.id } }
					createCardToken={ createCardUpdateToken }
					purchase={ props.purchase }
					recordFormSubmitEvent={ recordFormSubmitEvent }
					siteSlug={ props.siteSlug }
					successCallback={ successCallback }
				/>
			</StripeHookProvider>
		</Fragment>
	);
}

AddCardDetails.propTypes = {
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
	isFullWidth: PropTypes.bool.isRequired,
};

const mapStateToProps = ( state, { purchaseId } ) => ( {
	hasLoadedSites: ! isRequestingSites( state ),
	hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
	purchase: getByPurchaseId( state, purchaseId ),
	selectedSite: getSelectedSite( state ),
	userId: getCurrentUserId( state ),
} );

export default connect( mapStateToProps, { clearPurchases, recordTracksEvent } )( AddCardDetails );
