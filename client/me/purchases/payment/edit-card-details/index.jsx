/** @format */

/**
 * External dependencies
 */
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
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
import { isDataLoading } from 'me/purchases/utils';
import { isRequestingSites } from 'state/sites/selectors';
import { managePurchase, purchasesRoot } from 'me/purchases/paths';
import { recordTracksEvent } from 'state/analytics/actions';

class EditCardDetails extends Component {
	static propTypes = {
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

	createCardToken = ( ...args ) => createCardToken( 'card_update', ...args );

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

	recordFormSubmitEvent = () =>
		void this.props.recordTracksEvent( 'calypso_purchases_credit_card_form_submit', {
			product_slug: this.props.purchase.productSlug,
		} );

	successCallback = () => {
		const { id } = this.props.purchase;

		this.props.clearPurchases();

		page( managePurchase( this.props.siteSlug, id ) );
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
				<Fragment>
					<QueryStoredCards />

					<QueryUserPurchases userId={ this.props.userId } />

					<CreditCardFormLoadingPlaceholder title={ titles.editCardDetails } />
				</Fragment>
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
				<HeaderCake backHref={ managePurchase( this.props.siteSlug, this.props.purchaseId ) }>
					{ titles.editCardDetails }
				</HeaderCake>

				<CreditCardForm
					apiParams={ { purchaseId: this.props.purchase.id } }
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

export default connect(
	mapStateToProps,
	{ clearPurchases, recordTracksEvent }
)( EditCardDetails );
