/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { Button, Card, CompactCard } from '@automattic/components';
import LoadingPlaceholder from 'calypso/me/purchases/components/loading-placeholder';
import titles from 'calypso/me/purchases/titles';

const CancelPurchaseLoadingPlaceholder = ( { purchaseId, siteSlug, getManagePurchaseUrlFor } ) => {
	let path;

	if ( siteSlug ) {
		path = getManagePurchaseUrlFor( siteSlug, purchaseId );
	}

	/* eslint-disable wpcalypso/jsx-classname-namespace, jsx-a11y/heading-has-content */
	return (
		<LoadingPlaceholder title={ titles.cancelPurchase } path={ path } isFullWidth={ true }>
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
/* eslint-enable wpcalypso/jsx-classname-namespace, jsx-a11y/heading-has-content */

CancelPurchaseLoadingPlaceholder.propTypes = {
	purchaseId: PropTypes.number.isRequired,
	siteSlug: PropTypes.string.isRequired,
	getManagePurchaseUrlFor: PropTypes.func.isRequired,
};

export default CancelPurchaseLoadingPlaceholder;
