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
import { getName, getSubscriptionEndDate, isOneTimePurchase, isRefundable, isSubscription } from 'lib/purchases';
import { isDomainRegistration } from 'lib/products-values';
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
		const { purchase } = this.props;

		let text, onClick;

		if ( isRefundable( purchase ) ) {
			onClick = this.goToCancelConfirmation;

			if ( isDomainRegistration( purchase ) ) {
				text = this.translate( 'Cancel Domain and Refund' );
			}

			if ( isSubscription( purchase ) ) {
				text = this.translate( 'Cancel Subscription and Refund' );
			}

			if ( isOneTimePurchase( purchase ) ) {
				text = this.translate( 'Cancel and Refund' );
			}
		} else {
			onClick = this.cancelPurchase;

			if ( isDomainRegistration( purchase ) ) {
				text = this.translate( 'Cancel Domain' );
			}

			if ( isSubscription( purchase ) ) {
				text = this.translate( 'Cancel Subscription' );
			}
		}

		return (
			<Button
				className="cancel-purchase__button"
				disabled={ this.state.disabled }
				onClick={ onClick }
				primary>
				{ text }
			</Button>
		);
	}
} );

export default CancelPurchaseButton;
