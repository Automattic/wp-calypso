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
import LoadingPlaceholder from 'components/loading-placeholder';
import { managePurchase } from 'me/purchases/paths';
import titles from 'me/purchases/titles';

const CancelPurchasePlaceholder = React.createClass( {
	propTypes: {
		purchaseId: React.PropTypes.string.isRequired,
		selectedSite: React.PropTypes.object.isRequired
	},

	render() {
		return (
			<LoadingPlaceholder
				title={ titles.cancelPurchase }
				path={ managePurchase( this.props.selectedSite.slug, this.props.purchaseId ) }>
				<Card className="cancel-purchase-placeholder__card">
					<h2 className="cancel-purchase-placeholder__header" />
					<div className="cancel-purchase-placeholder__subheader" />
					<div className="cancel-purchase-placeholder__reason" />
					<div className="cancel-purchase-placeholder__reason" />
				</Card>
				<CompactCard>
					<Button className="cancel-purchase-placeholder__cancel-button" />
				</CompactCard>
			</LoadingPlaceholder>
		);
	}
} );

export default CancelPurchasePlaceholder;
