/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
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

const CancelPurchaseLoadingPlaceholder = ( { purchaseId } ) => (
	<LoadingPlaceholder title={ titles.cancelPurchase } path={ managePurchase( purchaseId ) }>
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
CancelPurchaseLoadingPlaceholder.propTypes = {
	purchaseId: PropTypes.number.isRequired,
};

export default CancelPurchaseLoadingPlaceholder;
