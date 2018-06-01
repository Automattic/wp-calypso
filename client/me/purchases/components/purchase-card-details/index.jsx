/** @format */
/**
 * External dependencies
 */
import page from 'page';
import { Component } from 'react';
import { curry } from 'lodash';

/**
 * Internal Dependencies
 */
import analytics from 'lib/analytics';
import { createCardToken } from 'lib/store-transactions';
import { isDataLoading } from 'me/purchases/utils';
import { managePurchase, purchasesRoot } from 'me/purchases/paths';

class PurchaseCardDetails extends Component {
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

		page( managePurchase( id ) );
	}
}

export default PurchaseCardDetails;
