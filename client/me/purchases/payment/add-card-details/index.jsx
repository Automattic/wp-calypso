/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import CreditCardForm from 'blocks/credit-card-form';
import CreditCardFormLoadingPlaceholder from 'blocks/credit-card-form/loading-placeholder';
import QueryUserPurchases from 'components/data/query-user-purchases';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import userFactory from 'lib/user';
import PurchaseCardDetails from 'me/purchases/components/purchase-card-details';
import titles from 'me/purchases/titles';
import { isDataLoading, recordPageView } from 'me/purchases/utils';
import { clearPurchases } from 'state/purchases/actions';
import { getByPurchaseId, hasLoadedUserPurchasesFromServer } from 'state/purchases/selectors';
import { isRequestingSites } from 'state/sites/selectors';
import { getSelectedSite as getSelectedSiteSelector } from 'state/ui/selectors';

const user = userFactory();

class AddCardDetails extends PurchaseCardDetails {
	static propTypes = {
		clearPurchases: PropTypes.func.isRequired,
		hasLoadedSites: PropTypes.bool.isRequired,
		hasLoadedUserPurchasesFromServer: PropTypes.bool.isRequired,
		selectedPurchase: PropTypes.object,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
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

					<CreditCardFormLoadingPlaceholder title={ titles.addCardDetails } />
				</div>
			);
		}

		return (
			<Main>
				<HeaderCake onClick={ this.goToManagePurchase }>{ titles.addCardDetails }</HeaderCake>

				<CreditCardForm
					apiParams={ this.getApiParams() }
					createPaygateToken={ this.createPaygateToken }
					recordFormSubmitEvent={ this.recordFormSubmitEvent }
					successCallback={ this.successCallback }
				/>
			</Main>
		);
	}
}

const mapStateToProps = ( state, { purchaseId } ) => {
	return {
		hasLoadedSites: ! isRequestingSites( state ),
		hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
		selectedPurchase: getByPurchaseId( state, purchaseId ),
		selectedSite: getSelectedSiteSelector( state ),
	};
};

const mapDispatchToProps = {
	clearPurchases,
};

export default connect( mapStateToProps, mapDispatchToProps )( AddCardDetails );
