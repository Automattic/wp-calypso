/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { cancelPurchase } from 'me/purchases/paths';
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import LoadingPlaceholder from 'me/purchases/components/loading-placeholder';
import titles from 'me/purchases/titles';

const ConfirmCancelPurchaseLoadingPlaceholder = ( { purchaseId, selectedSite } ) => {
	let path;

	if ( selectedSite ) {
		path = cancelPurchase( selectedSite.slug, purchaseId );
	}

	return (
		<LoadingPlaceholder
			title={ titles.confirmCancelPurchase }
			path={ path }>
			<Card className="confirm-cancel-purchase-loading-placeholder__card">
				<h2 className="loading-placeholder__content confirm-cancel-purchase-loading-placeholder__header" />
				<div className="loading-placeholder__content confirm-cancel-purchase-loading-placeholder__subheader" />
				<div className="loading-placeholder__content confirm-cancel-purchase-loading-placeholder__reason" />
				<div className="loading-placeholder__content confirm-cancel-purchase-loading-placeholder__reason" />
			</Card>

			<CompactCard>
				<Button className="confirm-cancel-purchase-loading-placeholder__cancel-button" />
			</CompactCard>
		</LoadingPlaceholder>
	);
};

ConfirmCancelPurchaseLoadingPlaceholder.propTypes = {
	purchaseId: React.PropTypes.string.isRequired,
	selectedSite: React.PropTypes.oneOfType( [
		React.PropTypes.bool,
		React.PropTypes.object
	] ).isRequired
};

export default ConfirmCancelPurchaseLoadingPlaceholder;
