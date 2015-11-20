/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import { purchaseTitle } from 'lib/purchases';

const CancelPurchaseButton = React.createClass( {
	propTypes: {
		purchase: React.PropTypes.object.isRequired
	},

	render() {
		return (
			<button type="button"
				onClick={ this.props.onClick }
				className="button">
				{ this.renderText() }
			</button>
		);
	},

	renderText() {
		const { isRefundable } = this.props.purchase,
			productName = purchaseTitle( this.props.purchase );

		if ( isRefundable ) {
			return this.translate( 'Cancel and Refund %(productName)s', {
				args: { productName }
			} );
		}

		return this.translate( 'Cancel %(productName)s', {
			args: { productName }
		} );
	}
} );

export default CancelPurchaseButton;
