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
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import PurchaseCardDetails from 'me/purchases/components/purchase-card-details';
import QueryUserPurchases from 'components/data/query-user-purchases';
import titles from 'me/purchases/titles';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { managePurchase } from 'me/purchases/paths';
import TrackPurchasePageView from 'me/purchases/track-purchase-page-view';
import { getCurrentUserId } from 'state/current-user/selectors';

class AddCardDetails extends PurchaseCardDetails {
	static propTypes = {
		clearPurchases: PropTypes.func.isRequired,
		hasLoadedSites: PropTypes.bool.isRequired,
		hasLoadedUserPurchasesFromServer: PropTypes.bool.isRequired,
		purchaseId: PropTypes.number.isRequired,
		purchase: PropTypes.object,
		userId: PropTypes.number,
	};

	componentWillMount() {
		this.redirectIfDataIsInvalid();
	}

	componentWillReceiveProps( nextProps ) {
		this.redirectIfDataIsInvalid( nextProps );
	}

	render() {
		if ( ! this.props.hasLoadedUserPurchasesFromServer ) {
			return (
				<div>
					<QueryUserPurchases userId={ this.props.userId } />

					<CreditCardFormLoadingPlaceholder title={ titles.addCardDetails } />
				</div>
			);
		}

		return (
			<Main>
				<TrackPurchasePageView
					eventName="calypso_add_card_details_purchase_view"
					purchaseId={ this.props.purchaseId }
				/>
				<PageViewTracker
					path="/me/purchases/:site/:purchaseId/payment/add"
					title="Purchases > Add Card Details"
				/>
				<HeaderCake backHref={ managePurchase( this.props.purchaseId ) }>
					{ titles.addCardDetails }
				</HeaderCake>

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
		hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
		purchase: getByPurchaseId( state, purchaseId ),
		userId: getCurrentUserId( state ),
	};
};

const mapDispatchToProps = {
	clearPurchases,
};

export default connect( mapStateToProps, mapDispatchToProps )( AddCardDetails );
