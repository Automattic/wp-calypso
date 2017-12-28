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
import analytics from 'client/lib/analytics';
import { createCardToken } from 'client/lib/store-transactions';
import { getPurchase, goToManagePurchase, isDataLoading } from 'client/me/purchases/utils';
import paths from 'client/me/purchases/paths';

class PurchaseCardDetails extends Component {
	constructor( props ) {
		super( props );
		this.createCardToken = curry( createCardToken )( 'card_update' );
		this.goToManagePurchase = this.goToManagePurchase.bind( this );
		this.recordFormSubmitEvent = this.recordFormSubmitEvent.bind( this );
		this.successCallback = this.successCallback.bind( this );
	}

	redirectIfDataIsInvalid( props = this.props ) {
		if ( isDataLoading( props ) ) {
			return true;
		}

		if ( ! this.isDataValid( props ) ) {
			page( paths.purchasesRoot() );
		}
	}

	isDataValid( props = this.props ) {
		const purchase = getPurchase( props ),
			{ selectedSite } = props;

		return purchase && selectedSite;
	}

	getApiParams() {
		return {
			purchaseId: getPurchase( this.props ).id,
		};
	}

	goToManagePurchase() {
		goToManagePurchase( this.props );
	}

	recordFormSubmitEvent() {
		analytics.tracks.recordEvent( 'calypso_purchases_credit_card_form_submit', {
			product_slug: getPurchase( this.props ).productSlug,
		} );
	}

	successCallback() {
		const { id } = getPurchase( this.props );

		this.props.clearPurchases();

		page( paths.managePurchase( this.props.selectedSite.slug, id ) );
	}
}

export default PurchaseCardDetails;
