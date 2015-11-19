/**
 * External Dependencies
 */
import page from 'page';
import React from 'react';

/**
 * Internal Dependencies
 */
import Button from 'components/button';
import { cancelPurchase } from 'lib/upgrades/actions';
import paths from 'me/purchases/paths';
import notices from 'notices';
import { isRefundable, purchaseTitle } from 'lib/purchases';

const CancelPurchaseButton = React.createClass( {
	propTypes: {
		purchase: React.PropTypes.object.isRequired
	},

	getInitialState() {
		return {
			disabled: false
		};
	},

	goToCancelConfirmation() {
		const { domain, id } = this.props.purchase;

		page( paths.confirmCancelPurchase( domain, id ) );
	},

	cancelPurchase() {
		const { id } = this.props.purchase;

		this.toggleDisabled();

		cancelPurchase( id, ( success ) => {
			if ( success ) {
				notices.success( this.translate( 'Purchase successfully cancelled.' ), { persistent: true } );
				page.redirect( paths.list() );
			} else {
				notices.error( this.translate(
					'There was a problem canceling this purchase. ' +
					'Please try again later or contact support.'
				) );
				this.toggleDisabled();
			}
		} );
	},

	toggleDisabled() {
		this.setState( {
			disabled: ! this.state.disabled
		} );
	},

	render() {
		const purchase = this.props.purchase,
			productName = purchaseTitle( purchase );

		if ( isRefundable( purchase ) ) {
			return (
				<Button type="button"
					onClick={ this.goToCancelConfirmation }>
					{ this.translate( 'Cancel and Refund %(productName)s', {
						args: { productName }
					} ) }
				</Button>
			);
		}

		return (
			<Button type="button"
				disabled={ this.state.disabled }
				onClick={ this.cancelPurchase }>
				{ this.translate( 'Cancel %(productName)s', {
					args: { productName }
				} ) }
			</Button>
		);
	}
} );

export default CancelPurchaseButton;
