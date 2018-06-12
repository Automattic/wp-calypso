/** @format */

/**
 * External dependencies
 */
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import React, { Component } from 'react';
import page from 'page';
import { curry } from 'lodash';

/**
 * Internal Dependencies
 */
import { clearPurchases } from 'state/purchases/actions';
import CreditCardForm from 'blocks/credit-card-form';
import CreditCardFormLoadingPlaceholder from 'blocks/credit-card-form/loading-placeholder';
import { getByPurchaseId, hasLoadedUserPurchasesFromServer } from 'state/purchases/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import HeaderCake from 'components/header-cake';
import { isDataLoading } from 'me/purchases/utils';
import { isRequestingSites } from 'state/sites/selectors';
import Main from 'components/main';
import QueryUserPurchases from 'components/data/query-user-purchases';
import titles from 'me/purchases/titles';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { managePurchase, purchasesRoot } from 'me/purchases/paths';
import TrackPurchasePageView from 'me/purchases/track-purchase-page-view';
import { getCurrentUserId } from 'state/current-user/selectors';

import analytics from 'lib/analytics';
import { createCardToken } from 'lib/store-transactions';

class AddCardDetails extends Component {
	static propTypes = {
		clearPurchases: PropTypes.func.isRequired,
		hasLoadedSites: PropTypes.bool.isRequired,
		hasLoadedUserPurchasesFromServer: PropTypes.bool.isRequired,
		purchaseId: PropTypes.number.isRequired,
		purchase: PropTypes.object,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
		siteSlug: PropTypes.string.isRequired,
		userId: PropTypes.number,
	};

	constructor( props ) {
		super( props );
		this.createCardToken = curry( createCardToken )( 'card_update' );
		this.recordFormSubmitEvent = this.recordFormSubmitEvent.bind( this );
		this.successCallback = this.successCallback.bind( this );
	}

	redirectIfDataIsInvalid( props = this.props ) {
		if ( isDataLoading( props ) ) {
			return true;
		}

		if ( ! this.isDataValid( props ) ) {
			page( purchasesRoot );
		}
	}

	isDataValid( props = this.props ) {
		const { purchase, selectedSite } = props;

		return purchase && selectedSite;
	}

	getApiParams() {
		return {
			purchaseId: this.props.purchase.id,
		};
	}

	recordFormSubmitEvent() {
		analytics.tracks.recordEvent( 'calypso_purchases_credit_card_form_submit', {
			product_slug: this.props.purchase.productSlug,
		} );
	}

	successCallback() {
		const { id } = this.props.purchase;

		this.props.clearPurchases();

		page( managePurchase( this.props.selectedSite.slug, id ) );
	}

	componentWillMount() {
		this.redirectIfDataIsInvalid();
	}

	componentWillReceiveProps( nextProps ) {
		this.redirectIfDataIsInvalid( nextProps );
	}

	render() {
		if ( isDataLoading( this.props ) ) {
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
				<HeaderCake backHref={ managePurchase( this.props.siteSlug, this.props.purchaseId ) }>
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
		hasLoadedSites: ! isRequestingSites( state ),
		hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
		purchase: getByPurchaseId( state, purchaseId ),
		selectedSite: getSelectedSite( state ),
		userId: getCurrentUserId( state ),
	};
};

const mapDispatchToProps = {
	clearPurchases,
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( AddCardDetails );
