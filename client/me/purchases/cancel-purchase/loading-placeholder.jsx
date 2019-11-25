/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { Button, Card, CompactCard } from '@automattic/components';
import LoadingPlaceholder from 'me/purchases/components/loading-placeholder';
import { managePurchase } from 'me/purchases/paths';
import titles from 'me/purchases/titles';

const CancelPurchaseLoadingPlaceholder = ( { purchaseId, siteSlug } ) => {
	let path;

	if ( siteSlug ) {
		path = managePurchase( siteSlug, purchaseId );
	}

	return (
		/* eslint-disable */
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
		/* eslint-enable*/
	);
};

CancelPurchaseLoadingPlaceholder.propTypes = {
	purchaseId: PropTypes.number.isRequired,
	siteSlug: PropTypes.string.isRequired,
};

export default CancelPurchaseLoadingPlaceholder;
