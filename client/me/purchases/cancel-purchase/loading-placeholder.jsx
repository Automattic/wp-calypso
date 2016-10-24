/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import LoadingPlaceholder from 'me/purchases/components/loading-placeholder';
import { managePurchase } from 'me/purchases/paths';
import titles from 'me/purchases/titles';

const CancelPurchaseLoadingPlaceholder = ( { purchaseId, selectedSite } ) => {
	let path;

	if ( selectedSite ) {
		path = managePurchase( selectedSite.slug, purchaseId );
	}

	return (
		<LoadingPlaceholder
			title={ titles.cancelPurchase }
			path={ path }>
			<Card className="cancel-purchase-loading-placeholder__card">
				<h2 className="loading-placeholder__content cancel-purchase-loading-placeholder__header" />
				<div className="loading-placeholder__content cancel-purchase-loading-placeholder__subheader" />
				<div className="loading-placeholder__content cancel-purchase-loading-placeholder__reason" />
				<div className="loading-placeholder__content cancel-purchase-loading-placeholder__reason" />
			</Card>

			<CompactCard>
				<Button className="cancel-purchase-loading-placeholder__cancel-button" />
			</CompactCard>
		</LoadingPlaceholder>
	);
};

CancelPurchaseLoadingPlaceholder.propTypes = {
	purchaseId: React.PropTypes.number.isRequired,
	selectedSite: React.PropTypes.oneOfType( [
		React.PropTypes.bool,
		React.PropTypes.object
	] )
};

export default CancelPurchaseLoadingPlaceholder;
