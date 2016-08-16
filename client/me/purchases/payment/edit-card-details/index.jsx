/**
 * External Dependencies
 */
import { connect } from 'react-redux';
import page from 'page';
import React, { Component, PropTypes } from 'react';

/**
 * Internal Dependencies
 */
import { clearPurchases } from 'state/purchases/actions';
import CreditCardPage from 'me/purchases/components/credit-card-page';
import CreditCardPageLoadingPlaceholder from 'me/purchases/components/credit-card-page/loading-placeholder';
import { getByPurchaseId, hasLoadedUserPurchasesFromServer } from 'state/purchases/selectors';
import { getSelectedSite as getSelectedSiteSelector } from 'state/ui/selectors';
import { getStoredCardById, hasLoadedStoredCardsFromServer } from 'state/stored-cards/selectors';
import { getPurchase, goToManagePurchase, isDataLoading, recordPageView } from 'me/purchases/utils';
import { isRequestingSites } from 'state/sites/selectors';
import paths from 'me/purchases/paths';
import QueryStoredCards from 'components/data/query-stored-cards';
import QueryUserPurchases from 'components/data/query-user-purchases';
import titles from 'me/purchases/titles';
import userFactory from 'lib/user';

const user = userFactory();

class EditCardDetails extends Component {
	static propTypes = {
		hasLoadedSites: PropTypes.bool.isRequired,
		hasLoadedStoredCardsFromServer: PropTypes.bool.isRequired,
		hasLoadedUserPurchasesFromServer: PropTypes.bool.isRequired
	};

	componentWillMount() {
		this.redirectIfDataIsInvalid();

		recordPageView( 'edit_card_details', this.props );
	}

	redirectIfDataIsInvalid( props = this.props ) {
		if ( isDataLoading( props ) ) {
			return true;
		}

		if ( ! this.isDataValid( props ) ) {
			page( paths.list() );
		}
	}

	isDataValid( props = this.props ) {
		const purchase = getPurchase( props ),
			{ selectedSite } = props;

		return purchase && selectedSite;
	}

	goBack( props ) {
		goToManagePurchase( props );
	}

	successCallback( props ) {
		const { id } = getPurchase( props );

		props.clearPurchases();

		page( paths.managePurchase( props.selectedSite.slug, id ) );
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

		return <CreditCardPage { ...this.props }
			goBack={ () => this.goBack( this.props ) }
			initialValues={ this.props.card }
			successCallback={ () => this.successCallback( this.props ) } />;
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
