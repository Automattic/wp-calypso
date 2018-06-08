/** @format */

/**
 * External dependencies
 */
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal Dependencies
 */
import { clearPurchases } from 'state/purchases/actions';
import CreditCardForm from 'blocks/credit-card-form';
import CreditCardFormLoadingPlaceholder from 'blocks/credit-card-form/loading-placeholder';
import { getByPurchaseId, hasLoadedUserPurchasesFromServer } from 'state/purchases/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import { getStoredCardById, hasLoadedStoredCardsFromServer } from 'state/stored-cards/selectors';
import HeaderCake from 'components/header-cake';
import { isDataLoading } from 'me/purchases/utils';
import { isRequestingSites } from 'state/sites/selectors';
import Main from 'components/main';
import PurchaseCardDetails from 'me/purchases/components/purchase-card-details';
import QueryStoredCards from 'components/data/query-stored-cards';
import QueryUserPurchases from 'components/data/query-user-purchases';
import titles from 'me/purchases/titles';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { managePurchase } from 'me/purchases/paths';
import TrackPurchasePageView from 'me/purchases/track-purchase-page-view';
import { getCurrentUserId } from 'state/current-user/selectors';

class EditCardDetails extends PurchaseCardDetails {
	static propTypes = {
		card: PropTypes.object,
		clearPurchases: PropTypes.func.isRequired,
		hasLoadedSites: PropTypes.bool.isRequired,
		hasLoadedStoredCardsFromServer: PropTypes.bool.isRequired,
		hasLoadedUserPurchasesFromServer: PropTypes.bool.isRequired,
		purchaseId: PropTypes.number.isRequired,
		purchase: PropTypes.object,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
		siteSlug: PropTypes.string.isRequired,
		userId: PropTypes.number,
	};

	componentWillMount() {
		this.redirectIfDataIsInvalid();
	}

	componentWillReceiveProps( nextProps ) {
		this.redirectIfDataIsInvalid( nextProps );
	}

	render() {
		if ( isDataLoading( this.props ) || ! this.props.hasLoadedStoredCardsFromServer ) {
			return (
				<div>
					<QueryStoredCards />

					<QueryUserPurchases userId={ this.props.userId } />

					<CreditCardFormLoadingPlaceholder title={ titles.editCardDetails } />
				</div>
			);
		}

		return (
			<Main>
				<TrackPurchasePageView
					eventName="calypso_edit_card_details_purchase_view"
					purchaseId={ this.props.purchaseId }
				/>
				<PageViewTracker
					path="/me/purchases/:site/:purchaseId/payment/edit/:cardId"
					title="Purchases > Edit Card Details"
				/>
				<HeaderCake backHref={ managePurchase( this.props.purchaseId ) }>
					{ titles.editCardDetails }
				</HeaderCake>

				<CreditCardForm
					apiParams={ this.getApiParams() }
					createCardToken={ this.createCardToken }
					initialValues={ this.props.card }
					recordFormSubmitEvent={ this.recordFormSubmitEvent }
					successCallback={ this.successCallback }
				/>
			</Main>
		);
	}
}

const mapStateToProps = ( state, { cardId, purchaseId } ) => ( {
	card: getStoredCardById( state, cardId ),
	hasLoadedSites: ! isRequestingSites( state ),
	hasLoadedStoredCardsFromServer: hasLoadedStoredCardsFromServer( state ),
	hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
	purchase: getByPurchaseId( state, purchaseId ),
	selectedSite: getSelectedSite( state ),
	userId: getCurrentUserId( state ),
} );

const mapDispatchToProps = {
	clearPurchases,
};

export default connect( mapStateToProps, mapDispatchToProps )( EditCardDetails );
