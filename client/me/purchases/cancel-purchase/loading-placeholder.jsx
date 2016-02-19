/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import Button from 'components/button';
import LoadingPlaceholder from 'me/purchases/components/loading-placeholder';
import { managePurchase } from 'me/purchases/paths';
import titles from 'me/purchases/titles';

const CancelPurchaseLoadingPlaceholder = React.createClass( {
	propTypes: {
		purchaseId: React.PropTypes.string.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired
	},

	render() {
		return (
			<LoadingPlaceholder
				title={ titles.cancelPurchase }
				path={ managePurchase( this.props.selectedSite.slug, this.props.purchaseId ) }>
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
	}
} );

export default CancelPurchaseLoadingPlaceholder;
