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
import { isDataLoading, recordPageView } from 'me/purchases/utils';
import { isRequestingSites } from 'state/sites/selectors';
import Main from 'components/main';
import PurchaseCardDetails from 'me/purchases/components/purchase-card-details';
import QueryStoredCards from 'components/data/query-stored-cards';
import QueryUserPurchases from 'components/data/query-user-purchases';
import titles from 'me/purchases/titles';
import userFactory from 'lib/user';
import PageViewTracker from 'lib/analytics/page-view-tracker';

const user = userFactory();

class EditCardDetails extends PurchaseCardDetails {
	static propTypes = {
		card: PropTypes.object,
		clearPurchases: PropTypes.func.isRequired,
		hasLoadedSites: PropTypes.bool.isRequired,
		hasLoadedStoredCardsFromServer: PropTypes.bool.isRequired,
		hasLoadedUserPurchasesFromServer: PropTypes.bool.isRequired,
		selectedPurchase: PropTypes.object,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
	};

	componentWillMount() {
		this.redirectIfDataIsInvalid();

		recordPageView( 'edit_card_details', this.props );
	}

	componentWillReceiveProps( nextProps ) {
		this.redirectIfDataIsInvalid( nextProps );

		recordPageView( 'edit_card_details', this.props, nextProps );
	}

	render() {
		if ( isDataLoading( this.props ) || ! this.props.hasLoadedStoredCardsFromServer ) {
			return (
				<div>
					<QueryStoredCards />

					<QueryUserPurchases userId={ user.get().ID } />

					<CreditCardFormLoadingPlaceholder title={ titles.editCardDetails } />
				</div>
			);
		}

		return (
			<Main>
				<PageViewTracker
					path="/me/purchases/:site/:purchaseId/payment/edit/:cardId"
					title="Purchases > Edit Card Details"
				/>
				<HeaderCake onClick={ this.goToManagePurchase }>{ titles.editCardDetails }</HeaderCake>

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

const mapStateToProps = ( state, { cardId, purchaseId } ) => {
	return {
		card: getStoredCardById( state, cardId ),
		hasLoadedSites: ! isRequestingSites( state ),
		hasLoadedStoredCardsFromServer: hasLoadedStoredCardsFromServer( state ),
		hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
		selectedPurchase: getByPurchaseId( state, purchaseId ),
		selectedSite: getSelectedSite( state ),
	};
};

const mapDispatchToProps = {
	clearPurchases,
};

export default connect( mapStateToProps, mapDispatchToProps )( EditCardDetails );
