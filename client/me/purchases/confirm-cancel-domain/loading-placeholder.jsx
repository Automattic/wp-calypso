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
import { cancelPurchase } from 'client/me/purchases/paths';
import Card from 'client/components/card';
import CompactCard from 'client/components/card/compact';
import LoadingPlaceholder from 'client/me/purchases/components/loading-placeholder';
import titles from 'client/me/purchases/titles';

const ConfirmCancelDomainLoadingPlaceholder = ( { purchaseId, selectedSite } ) => {
	let path;

	if ( selectedSite ) {
		path = cancelPurchase( selectedSite.slug, purchaseId );
	}

	return (
		<LoadingPlaceholder title={ titles.confirmCancelDomain } path={ path }>
			<Card className="confirm-cancel-domain__loading-placeholder-card">
				<h2 className="loading-placeholder__content confirm-cancel-domain__loading-placeholder-header" />
				<div className="loading-placeholder__content confirm-cancel-domain__loading-placeholder-subheader" />
				<div className="loading-placeholder__content confirm-cancel-domain__loading-placeholder-reason" />
				<div className="loading-placeholder__content confirm-cancel-domain__loading-placeholder-reason" />
			</Card>
			<CompactCard>
				<Button className="confirm-cancel-domain__loading-placeholder-cancel-button" />
			</CompactCard>
		</LoadingPlaceholder>
	);
};

ConfirmCancelDomainLoadingPlaceholder.propTypes = {
	purchaseId: PropTypes.number.isRequired,
	selectedSite: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ),
};

export default ConfirmCancelDomainLoadingPlaceholder;
