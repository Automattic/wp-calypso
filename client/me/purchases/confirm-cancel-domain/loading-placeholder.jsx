/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { Button, Card, CompactCard } from '@automattic/components';
import { cancelPurchase } from 'calypso/me/purchases/paths';
import LoadingPlaceholder from 'calypso/me/purchases/components/loading-placeholder';
import titles from 'calypso/me/purchases/titles';

const ConfirmCancelDomainLoadingPlaceholder = ( { purchaseId, selectedSite } ) => {
	let path;

	if ( selectedSite ) {
		path = cancelPurchase( selectedSite.slug, purchaseId );
	}

	return (
		<LoadingPlaceholder title={ titles.confirmCancelDomain } path={ path } isFullWidth={ true }>
			<Card className="confirm-cancel-domain__loading-placeholder-card">
				<div className="loading-placeholder__content confirm-cancel-domain__loading-placeholder-header" />
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
