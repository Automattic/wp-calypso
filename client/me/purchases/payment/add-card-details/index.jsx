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
import HeaderCake from 'components/header-cake' ;
import { isDataLoading, recordPageView } from 'me/purchases/utils';
import { isRequestingSites } from 'state/sites/selectors';
import Main from 'components/main';
import PurchaseCardDetails from 'me/purchases/components/purchase-card-details';
import QueryUserPurchases from 'components/data/query-user-purchases';
import titles from 'me/purchases/titles';
import userFactory from 'lib/user';

const user = userFactory();

class AddCardDetails extends PurchaseCardDetails {
	static propTypes = {
		clearPurchases: PropTypes.func.isRequired,
		hasLoadedSites: PropTypes.bool.isRequired,
		hasLoadedUserPurchasesFromServer: PropTypes.bool.isRequired,
		selectedPurchase: PropTypes.object,
		selectedSite: PropTypes.oneOfType( [
			PropTypes.object,
			PropTypes.bool
		] )
	};

	componentWillMount() {
		this.redirectIfDataIsInvalid();

		recordPageView( 'add_card_details', this.props );
	}

	componentWillReceiveProps( nextProps ) {
		this.redirectIfDataIsInvalid( nextProps );

		recordPageView( 'add_card_details', this.props, nextProps );
	}

	render() {
		if ( isDataLoading( this.props ) ) {
			return (
				<div>
					<QueryUserPurchases userId={ user.get().ID } />

					<CreditCardPageLoadingPlaceholder title={ titles.addCardDetails } />
				</div>
			);
		}

		return (
			<Main>
				<HeaderCake onClick={ this.goToManagePurchase }>{ titles.addCardDetails }</HeaderCake>

				<CreditCardPage
					apiParams={ this.getApiParams() }
					recordFormSubmitEvent={ this.recordFormSubmitEvent }
					successCallback={ this.successCallback } />
			</Main>
		);
	}
}

const mapStateToProps = ( state, { purchaseId } ) => {
	return {
		hasLoadedSites: ! isRequestingSites( state ),
		hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
		selectedPurchase: getByPurchaseId( state, purchaseId ),
		selectedSite: getSelectedSiteSelector( state )
	};
};

const mapDispatchToProps = {
	clearPurchases
};

export default connect( mapStateToProps, mapDispatchToProps )( AddCardDetails );
