/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import config from 'config';
import Button from 'components/forms/form-button';

export default React.createClass( {
	displayName: 'GuidedTransferOptions',

	propTypes: {
		siteSlug: PropTypes.string.isRequired
	},

	purchaseGuidedTransfer() {
		const { siteSlug } = this.props;
		if ( config.isEnabled( 'manage/export/guided-transfer' ) ) {
			page( `/settings/export/${ siteSlug }/guided` );
		} else {
			// Redirect to legacy guided transfer
			window.location = `https://${ siteSlug }/wp-admin/paid-upgrades.php?product=40&view=purchase&source=export`;
		}
	},

	render() {
		return (
			<CompactCard>
				<div className="exporter__guided-transfer-options">
					<div className="exporter__guided-transfer-options-header-title-container">
						<h1 className="exporter__guided-transfer-title">
							{ this.translate( 'Guided Transfer' ) }
						</h1>
						<h2 className="exporter__guided-transfer-subtitle">
							<span className="exporter__guided-transfer-price">$129</span> One-time expense
						</h2>
					</div>
					<div className="exporter__guided-transfer-options-header-button-container">
						<Button
							onClick={ this.purchaseGuidedTransfer }
							isPrimary={ true }>
							{ this.translate( 'Purchase a Guided Transfer' ) }
						</Button>
					</div>
				</div>
			</CompactCard>
		);
	}
} );
