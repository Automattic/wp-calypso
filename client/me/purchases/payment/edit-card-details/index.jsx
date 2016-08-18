/**
 * External Dependencies
 */
import { connect } from 'react-redux';
import React, { PropTypes } from 'react';

/**
 * Internal Dependencies
 */
import { clearPurchases } from 'state/purchases/actions';
import CreditCardPage from 'me/purchases/components/credit-card-page';
import CreditCardPageLoadingPlaceholder from 'me/purchases/components/credit-card-page/loading-placeholder';
import { getByPurchaseId, hasLoadedUserPurchasesFromServer } from 'state/purchases/selectors';
import { getSelectedSite as getSelectedSiteSelector } from 'state/ui/selectors';
import { getStoredCardById, hasLoadedStoredCardsFromServer } from 'state/stored-cards/selectors';
import { isDataLoading, recordPageView } from 'me/purchases/utils';
import { isRequestingSites } from 'state/sites/selectors';
import PurchaseCardDetails from 'me/purchases/components/purchase-card-details';
import QueryStoredCards from 'components/data/query-stored-cards';
import QueryUserPurchases from 'components/data/query-user-purchases';
import titles from 'me/purchases/titles';
import userFactory from 'lib/user';

const user = userFactory();

class EditCardDetails extends PurchaseCardDetails {
	static propTypes = {
		card: PropTypes.object,
		clearPurchases: PropTypes.func.isRequired,
		hasLoadedSites: PropTypes.bool.isRequired,
		hasLoadedStoredCardsFromServer: PropTypes.bool.isRequired,
		hasLoadedUserPurchasesFromServer: PropTypes.bool.isRequired,
		selectedPurchase: PropTypes.object,
		selectedSite: PropTypes.oneOfType( [
			PropTypes.object,
			PropTypes.bool
		] ),
		title: PropTypes.string.isRequired
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

					<CreditCardPageLoadingPlaceholder title={ this.props.title } />
				</div>
			);
		}

		return <CreditCardPage
			apiParams={ this.getApiParams() }
			goBack={ this.goBack }
			initialValues={ this.props.card }
			recordFormSubmitEvent={ this.recordFormSubmitEvent }
			successCallback={ this.successCallback }
			title={ this.props.title } />;
	}
}

const mapStateToProps = ( state, { cardId, purchaseId } ) => {
	return {
		card: getStoredCardById( state, cardId ),
		hasLoadedSites: ! isRequestingSites( state ),
		hasLoadedStoredCardsFromServer: hasLoadedStoredCardsFromServer( state ),
		hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
		selectedPurchase: getByPurchaseId( state, purchaseId ),
		selectedSite: getSelectedSiteSelector( state ),
		title: titles.editCardDetails
	};
};

const mapDispatchToProps = {
	clearPurchases
};

export default connect( mapStateToProps, mapDispatchToProps )( EditCardDetails );
