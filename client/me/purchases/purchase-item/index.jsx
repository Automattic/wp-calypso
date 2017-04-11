/**
 * External dependencies
 */
import classNames from 'classnames';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import {
	getName,
	isExpired,
	isExpiring,
	isIncludedWithPlan,
	isOneTimePurchase,
	isRenewing,
	purchaseType,
	showCreditCardExpiringWarning
} from 'lib/purchases';
import { isPlan, isDomainProduct } from 'lib/products-values';
import Notice from 'components/notice';
import PlanIcon from 'components/plans/plan-icon';
import Gridicon from 'gridicons';
import paths from '../paths';

class PurchaseItem extends Component {
	renewsOrExpiresOn() {
		const { purchase, translate, moment } = this.props;

		if ( showCreditCardExpiringWarning( purchase ) ) {
			return (
				<Notice isCompact status="is-error" icon="notice">
					{ translate( 'Credit card expiring soon' ) }
				</Notice>
			);
		}

		if ( isRenewing( purchase ) ) {
			return translate( 'Renews on %s', {
				args: purchase.renewMoment.format( 'LL' )
			} );
		}

		if ( isExpiring( purchase ) ) {
			if ( purchase.expiryMoment < moment().add( 30, 'days' ) ) {
				return (
					<Notice isCompact status="is-error" icon="notice">
						{ translate( 'Expires %(timeUntilExpiry)s', {
							args: {
								timeUntilExpiry: purchase.expiryMoment.fromNow()
							},
							context: 'timeUntilExpiry is of the form "[number] [time-period] ago" i.e. "3 days ago"'
						} ) }
					</Notice>
				);
			}

			return translate( 'Expires on %s', {
				args: purchase.expiryMoment.format( 'LL' )
			} );
		}

		if ( isExpired( purchase ) ) {
			return (
				<Notice isCompact status="is-error" icon="notice">
					{ translate( 'Expired %(timeSinceExpiry)s', {
						args: {
							timeSinceExpiry: purchase.expiryMoment.fromNow()
						},
						context: 'timeSinceExpiry is of the form "[number] [time-period] ago" i.e. "3 days ago"'
					} ) }
				</Notice>
			);
		}

		if ( isIncludedWithPlan( purchase ) ) {
			return translate( 'Included with Plan' );
		}

		if ( isOneTimePurchase( purchase ) ) {
			return translate( 'Never Expires' );
		}

		return null;
	}

	placeholder() {
		return (
			<span className="purchase-item__wrapper">
				<div className="purchase-item__plan-icon" />
				<div className="purchase-item__details">
					<div className="purchase-item__title" />
					<div className="purchase-item__purchase-type" />
					<div className="purchase-item__purchase-date" />
				</div>
			</span>
		);
	}

	scrollToTop() {
		window.scrollTo( 0, 0 );
	}

	render() {
		const { isPlaceholder, purchase } = this.props;
		const classes = classNames( 'purchase-item',
			{ 'is-expired': purchase && 'expired' === purchase.expiryStatus },
			{ 'is-placeholder': isPlaceholder },
			{ 'is-included-with-plan': purchase && isIncludedWithPlan( purchase ) }
		);

		let icon;
		if ( purchase && isPlan( purchase ) ) {
			icon = (
				<div className="purchase-item__plan-icon">
					<PlanIcon plan={ purchase.productSlug } />
				</div>
			);
		} else if ( purchase && isDomainProduct( purchase ) ) {
			icon = (
				<div className="purchase-item__plan-icon">
					<Gridicon icon="domains" size={ 24 } />
				</div>
			);
		}

		let content;
		if ( isPlaceholder ) {
			content = this.placeholder();
		} else {
			content = (
				<span className="purchase-item__wrapper">
					{ icon }
					<div className="purchase-item__details">
						<div className="purchase-item__title">
							{ getName( this.props.purchase ) }
						</div>
						<div className="purchase-item__purchase-type">{ purchaseType( this.props.purchase ) }</div>
						<div className="purchase-item__purchase-date">
							{ this.renewsOrExpiresOn() }
						</div>
					</div>
				</span>
			);
		}

		let props;
		if ( ! isPlaceholder ) {
			props = {
				href: paths.managePurchase( this.props.slug, this.props.purchase.id ),
				onClick: this.scrollToTop
			};
		}

		return (
			<CompactCard className={ classes } { ...props }>
				{ content }
			</CompactCard>
		);
	}
}

PurchaseItem.propTypes = {
	isPlaceholder: React.PropTypes.bool,
	purchase: React.PropTypes.object,
	slug: React.PropTypes.string
};

export default localize( PurchaseItem );
