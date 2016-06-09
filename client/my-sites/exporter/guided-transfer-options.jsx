/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Button from 'components/forms/form-button';

export default React.createClass( {
	displayName: 'GuidedTransferOptions',

	propTypes: {
		siteSlug: PropTypes.string.isRequired
	},

	purchaseGuidedTransfer() {
		page( `/settings/export/${this.props.siteSlug}/guided` );
	},

	render() {
		return (
			<div>
				<CompactCard>
					<div className="exporter__guided-transfer-options-header-title-container">
						<h1 className="exporter__title">
							{ this.translate( 'Guided Transfer' ) }
						</h1>
					</div>
					<div className="exporter__guided-transfer-options-header-button-container">
						<Button
							onClick={ this.purchaseGuidedTransfer }
							isPrimary={ true }>
							{ this.translate( 'Purchase a Guided Transfer' ) }
						</Button>
					</div>
				</CompactCard>
			</div>
		);
	}
} );
