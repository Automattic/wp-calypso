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
import { getName, getSubscriptionEndDate, isRefundable } from 'lib/purchases';
import notices from 'notices';
import paths from 'me/purchases/paths';

const CancelPurchaseButton = React.createClass( {
	propTypes: {
		purchase: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.object.isRequired
	},

	getInitialState() {
		return {
			disabled: false
		};
	},

	goToCancelConfirmation() {
		const { id } = this.props.purchase,
			{ slug } = this.props.selectedSite;

		page( paths.confirmCancelPurchase( slug, id ) );
	},

	cancelPurchase() {
		const { purchase } = this.props,
			{ id } = purchase;

		this.toggleDisabled();

		cancelPurchase( id, ( success ) => {
			const purchaseName = getName( purchase ),
				subscriptionEndDate = getSubscriptionEndDate( purchase );

			if ( success ) {
				notices.success( this.translate(
					'%(purchaseName)s was successfully cancelled. It will be available for use until it expires on %(subscriptionEndDate)s.',
					{
						args: {
							purchaseName,
							subscriptionEndDate
						}
					}
				), { persistent: true } );

				page( paths.list() );
			} else {
				notices.error( this.translate(
					'There was a problem canceling %(purchaseName)s. ' +
					'Please try again later or contact support.',
					{
						args: { purchaseName }
					}
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
		const { purchase } = this.props,
			purchaseName = getName( purchase );

		if ( isRefundable( purchase ) ) {
			return (
				<Button type="button"
					onClick={ this.goToCancelConfirmation }>
					{ this.translate( 'Cancel and Refund %(purchaseName)s', {
						args: { purchaseName }
					} ) }
				</Button>
			);
		}

		return (
			<Button type="button"
				disabled={ this.state.disabled }
				onClick={ this.cancelPurchase }>
				{ this.translate( 'Cancel %(purchaseName)s', {
					args: { purchaseName }
				} ) }
			</Button>
		);
	}
} );

export default CancelPurchaseButton;
