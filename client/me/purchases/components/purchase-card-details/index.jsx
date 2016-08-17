/**
 * External Dependencies
 */
import page from 'page';
import { Component } from 'react';

/**
 * Internal Dependencies
 */
import analytics from 'lib/analytics';
import { getPurchase, goToManagePurchase, isDataLoading } from 'me/purchases/utils';
import paths from 'me/purchases/paths';

class PurchaseCardDetails extends Component {
	constructor( props ) {
		super( props );
		this.goBack = this.goBack.bind( this );
		this.recordFormSubmitEvent = this.recordFormSubmitEvent.bind( this );
		this.successCallback = this.successCallback.bind( this );
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

	getApiParams() {
		return {
			purchaseId: getPurchase( this.props ).id
		};
	}

	goBack() {
		goToManagePurchase( this.props );
	}

	recordFormSubmitEvent() {
		analytics.tracks.recordEvent(
			'calypso_purchases_credit_card_form_submit',
			{ product_slug: getPurchase( this.props ).productSlug }
		);
	}

	successCallback() {
		const { id } = getPurchase( this.props );

		this.props.clearPurchases();

		page( paths.managePurchase( this.props.selectedSite.slug, id ) );
	}
}

export default PurchaseCardDetails;
