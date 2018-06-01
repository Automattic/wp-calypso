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
import { cancelPurchase } from 'me/purchases/paths';
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import LoadingPlaceholder from 'me/purchases/components/loading-placeholder';
import titles from 'me/purchases/titles';

const ConfirmCancelDomainLoadingPlaceholder = ( { purchaseId } ) => (
	<LoadingPlaceholder title={ titles.confirmCancelDomain } path={ cancelPurchase( purchaseId ) }>
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

ConfirmCancelDomainLoadingPlaceholder.propTypes = {
	purchaseId: PropTypes.number.isRequired,
};

export default ConfirmCancelDomainLoadingPlaceholder;
