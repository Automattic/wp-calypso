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
import CreditCardForm from 'blocks/credit-card-form';
import CreditCardFormLoadingPlaceholder from 'blocks/credit-card-form/loading-placeholder';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QueryUserPurchases from 'components/data/query-user-purchases';
import titles from 'me/purchases/titles';
import TrackPurchasePageView from 'me/purchases/track-purchase-page-view';
import { clearPurchases } from 'state/purchases/actions';
import { createCardToken } from 'lib/store-transactions';
import { getByPurchaseId, hasLoadedUserPurchasesFromServer } from 'state/purchases/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import { isRequestingSites } from 'state/sites/selectors';
import { managePurchase, purchasesRoot } from 'me/purchases/paths';
import { recordTracksEvent } from 'state/analytics/actions';
import { StripeHookProvider } from 'lib/stripe';

function AddCardDetails( props ) {
	const createCardUpdateToken = ( ...args ) => createCardToken( 'card_update', ...args );
	const isDataLoading = ! props.hasLoadedSites || ! props.hasLoadedUserPurchasesFromServer;
	const isDataValid = ( { purchase, selectedSite } ) => purchase && selectedSite;

	if ( ! isDataLoading && ! isDataValid( props ) ) {
		// Redirect if invalid data
		page( purchasesRoot );
	}

	if ( isDataLoading ) {
		return (
			<Fragment>
				<QueryUserPurchases userId={ props.userId } />

				<CreditCardFormLoadingPlaceholder title={ titles.addCardDetails } />
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
		page( managePurchase( props.siteSlug, id ) );
	};

	return (
		<Main>
			<TrackPurchasePageView
				eventName="calypso_add_card_details_purchase_view"
				purchaseId={ props.purchaseId }
			/>
			<PageViewTracker
				path="/me/purchases/:site/:purchaseId/payment/add"
				title="Purchases > Add Card Details"
			/>
			<HeaderCake backHref={ managePurchase( props.siteSlug, props.purchaseId ) }>
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
		</Main>
	);
}

AddCardDetails.propTypes = {
	clearPurchases: PropTypes.func.isRequired,
	hasLoadedSites: PropTypes.bool.isRequired,
	hasLoadedUserPurchasesFromServer: PropTypes.bool.isRequired,
	purchaseId: PropTypes.number.isRequired,
	purchase: PropTypes.object,
	selectedSite: PropTypes.object,
	siteSlug: PropTypes.string.isRequired,
	userId: PropTypes.number,
};

const mapStateToProps = ( state, { purchaseId } ) => ( {
	hasLoadedSites: ! isRequestingSites( state ),
	hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
	purchase: getByPurchaseId( state, purchaseId ),
	selectedSite: getSelectedSite( state ),
	userId: getCurrentUserId( state ),
} );

export default connect( mapStateToProps, { clearPurchases, recordTracksEvent } )( AddCardDetails );
