/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import paths from '../../paths';
import CompactCard from 'components/card/compact';
import Flag from 'components/flag';
import {
	getName,
	isExpired,
	isExpiring,
	isRenewing,
	isIncludedWithPlan,
	isOneTimePurchase,
	purchaseType,
	showCreditCardExpiringWarning
} from 'lib/purchases';

const PurchaseItem = React.createClass( {
	propTypes: {
		domain: React.PropTypes.string,
		purchase: React.PropTypes.object,
		isPlaceholder: React.PropTypes.bool
	},

	renewsOrExpiresOn() {
		const { purchase } = this.props;

		if ( showCreditCardExpiringWarning( purchase ) ) {
			return (
				<Flag type="is-error" icon="noticon-warning">
					{ this.translate( 'Credit card expiring soon' ) }
				</Flag>
			);
		}

		if ( isRenewing( purchase ) ) {
			return this.translate( 'Renews on %s', {
				args: purchase.renewMoment.format( 'LL' )
			} );
		}

		if ( isExpiring( purchase ) ) {
			if ( purchase.expiryMoment < this.moment().add( 30, 'days' ) ) {
				return (
					<Flag type="is-error" icon="noticon-warning">
						{ this.translate( 'Expires %(timeUntilExpiry)s', {
							args: {
								timeUntilExpiry: purchase.expiryMoment.fromNow()
							},
							context: 'timeUntilExpiry is of the form "[number] [time-period] ago" i.e. "3 days ago"'
						} ) }
					</Flag>
				);
			}

			return this.translate( 'Expires on %s', {
				args: purchase.expiryMoment.format( 'LL' )
			} );
		}

		if ( isExpired( purchase ) ) {
			return (
				<Flag type="is-error" icon="noticon-warning">
					{ this.translate( 'Expired %(timeSinceExpiry)s', {
						args: {
							timeSinceExpiry: purchase.expiryMoment.fromNow()
						},
						context: 'timeSinceExpiry is of the form "[number] [time-period] ago" i.e. "3 days ago"'
					} ) }
				</Flag>
			);
		}

		if ( isIncludedWithPlan( purchase ) ) {
			return this.translate( 'Included with Plan' );
		}

		if ( isOneTimePurchase( purchase ) ) {
			return this.translate( 'Never Expires' );
		}

		return null;
	},

	placeholder() {
		return (
			<span>
				<div className="purchase-item__title" />
				<div className="purchase-item__purchase-type" />
				<div className="purchase-item__purchase-date" />
			</span>
		);
	},

	scrollToTop() {
		window.scrollTo( 0, 0 );
	},

	render() {
		const { isPlaceholder } = this.props,
			classes = classNames( 'purchase-item',
				{ 'is-expired': this.props.purchase && 'expired' === this.props.purchase.expiryStatus },
				{ 'is-placeholder': isPlaceholder },
				{ 'is-included-with-plan': this.props.purchase && isIncludedWithPlan( this.props.purchase ) }
			);

		let content,
			props = {};

		if ( isPlaceholder ) {
			content = this.placeholder();
		} else {
			content = (
				<span>
					<div className="purchase-item__title">
						{ getName( this.props.purchase ) }
					</div>
					<div className="purchase-item__purchase-type">{ purchaseType( this.props.purchase ) }</div>
					<div className="purchase-item__purchase-date">
						{ this.renewsOrExpiresOn() }
					</div>
				</span>
			);
		}

		if ( ! isPlaceholder ) {
			props = {
				href: paths.managePurchase( this.props.domain, this.props.purchase.id ),
				onClick: this.scrollToTop
			};
		}

		return (
			<CompactCard className={ classes } { ...props }>
				{ content }
			</CompactCard>
		);
	}
} );

export default PurchaseItem;
