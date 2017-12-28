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
import { clearPurchases } from 'client/state/purchases/actions';
import CreditCardForm from 'client/blocks/credit-card-form';
import CreditCardFormLoadingPlaceholder from 'client/blocks/credit-card-form/loading-placeholder';
import {
	getByPurchaseId,
	hasLoadedUserPurchasesFromServer,
} from 'client/state/purchases/selectors';
import { getSelectedSite as getSelectedSiteSelector } from 'client/state/ui/selectors';
import HeaderCake from 'client/components/header-cake';
import { isDataLoading, recordPageView } from 'client/me/purchases/utils';
import { isRequestingSites } from 'client/state/sites/selectors';
import Main from 'client/components/main';
import PurchaseCardDetails from 'client/me/purchases/components/purchase-card-details';
import QueryUserPurchases from 'client/components/data/query-user-purchases';
import titles from 'client/me/purchases/titles';
import userFactory from 'client/lib/user';

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
					createCardToken={ this.createCardToken }
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
