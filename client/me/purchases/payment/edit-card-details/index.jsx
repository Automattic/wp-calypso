/** @format */

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
import QueryStoredCards from 'components/data/query-stored-cards';
import QueryUserPurchases from 'components/data/query-user-purchases';
import titles from 'me/purchases/titles';
import TrackPurchasePageView from 'me/purchases/track-purchase-page-view';
import { clearPurchases } from 'state/purchases/actions';
import { createCardToken } from 'lib/store-transactions';
import { getByPurchaseId, hasLoadedUserPurchasesFromServer } from 'state/purchases/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import { getStoredCardById, hasLoadedStoredCardsFromServer } from 'state/stored-cards/selectors';
import { isRequestingSites } from 'state/sites/selectors';
import { managePurchase, purchasesRoot } from 'me/purchases/paths';
import { recordTracksEvent } from 'state/analytics/actions';
import { StripeHookProvider } from 'lib/stripe';

function EditCardDetails( props ) {
	const isDataLoading = ! props.hasLoadedSites || ! props.hasLoadedUserPurchasesFromServer;
	const isDataValid = ( { purchase, selectedSite } ) => purchase && selectedSite;

	if ( ! isDataLoading && ! isDataValid( props ) ) {
		// Redirect if invalid data
		page( purchasesRoot );
	}

	if ( isDataLoading || ! props.hasLoadedStoredCardsFromServer ) {
		return (
			<Fragment>
				<QueryStoredCards />

				<QueryUserPurchases userId={ props.userId } />

				<CreditCardFormLoadingPlaceholder title={ titles.editCardDetails } />
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

	const createCardUpdateToken = ( ...args ) => createCardToken( 'card_update', ...args );

	return (
		<Main>
			<TrackPurchasePageView
				eventName="calypso_edit_card_details_purchase_view"
				purchaseId={ props.purchaseId }
			/>
			<PageViewTracker
				path="/me/purchases/:site/:purchaseId/payment/edit/:cardId"
				title="Purchases > Edit Card Details"
			/>
			<HeaderCake backHref={ managePurchase( props.siteSlug, props.purchaseId ) }>
				{ titles.editCardDetails }
			</HeaderCake>

			<StripeHookProvider configurationArgs={ { needs_intent: true } }>
				<CreditCardForm
					apiParams={ { purchaseId: props.purchase.id } }
					createCardToken={ createCardUpdateToken }
					initialValues={ props.card }
					purchase={ props.purchase }
					recordFormSubmitEvent={ recordFormSubmitEvent }
					siteSlug={ props.siteSlug }
					successCallback={ successCallback }
				/>
			</StripeHookProvider>
		</Main>
	);
}

EditCardDetails.propTypes = {
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
};

const mapStateToProps = ( state, { cardId, purchaseId } ) => ( {
	card: getStoredCardById( state, cardId ),
	hasLoadedSites: ! isRequestingSites( state ),
	hasLoadedStoredCardsFromServer: hasLoadedStoredCardsFromServer( state ),
	hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
	purchase: getByPurchaseId( state, purchaseId ),
	selectedSite: getSelectedSite( state ),
	userId: getCurrentUserId( state ),
} );

export default connect( mapStateToProps, { clearPurchases, recordTracksEvent } )( EditCardDetails );
