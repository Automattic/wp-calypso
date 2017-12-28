/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'client/components/button';
import Card from 'client/components/card';
import CompactCard from 'client/components/card/compact';
import LoadingPlaceholder from 'client/me/purchases/components/loading-placeholder';
import { managePurchase } from 'client/me/purchases/paths';
import titles from 'client/me/purchases/titles';

const CancelPurchaseLoadingPlaceholder = ( { purchaseId, selectedSite } ) => {
	let path;

	if ( selectedSite ) {
		path = managePurchase( selectedSite.slug, purchaseId );
	}

	return (
		<LoadingPlaceholder title={ titles.cancelPurchase } path={ path }>
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
	purchaseId: PropTypes.number.isRequired,
	selectedSite: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ),
};

export default CancelPurchaseLoadingPlaceholder;
