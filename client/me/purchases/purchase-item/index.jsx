/**
 * External dependencies
 */
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import paths from '../paths';
import CompactCard from 'components/card/compact';
import Notice from 'components/notice';
import PlanIcon from 'components/plans/plan-icon';
import TrackComponentView from 'lib/analytics/track-component-view';
import { isPlan, isDomainProduct, isTheme } from 'lib/products-values';
import { getName, isExpired, isExpiring, isIncludedWithPlan, isOneTimePurchase, isRenewing, purchaseType, showCreditCardExpiringWarning } from 'lib/purchases';

const eventProperties = ( warning ) => ( { warning, position: 'purchase-list' } );

class PurchaseItem extends Component {
	trackImpression( warning ) {
		return (
			<TrackComponentView
				eventName="calypso_subscription_warning_impression"
				eventProperties={ eventProperties( warning ) }
			/>
		);
	}

	renewsOrExpiresOn() {
		const { purchase, translate, moment } = this.props;

		if ( showCreditCardExpiringWarning( purchase ) ) {
			return (
				<Notice isCompact status="is-error" icon="notice">
					{ translate( 'Credit card expiring soon' ) }
					{ this.trackImpression( 'credit-card-expiring' ) }
				</Notice>
			);
		}

		if ( isRenewing( purchase ) ) {
			return translate( 'Renews on %s', {
				args: purchase.renewMoment.format( 'LL' ),
			} );
		}

		if ( isExpiring( purchase ) ) {
			if ( purchase.expiryMoment < moment().add( 30, 'days' ) ) {
				return (
					<Notice isCompact status="is-error" icon="notice">
						{ translate( 'Expires %(timeUntilExpiry)s', {
							args: {
								timeUntilExpiry: purchase.expiryMoment.fromNow(),
							},
							context: 'timeUntilExpiry is of the form "[number] [time-period] ago" i.e. "3 days ago"',
						} ) }
						{ this.trackImpression( 'purchase-expiring' ) }
					</Notice>
				);
			}

			return translate( 'Expires on %s', {
				args: purchase.expiryMoment.format( 'LL' ),
			} );
		}

		if ( isExpired( purchase ) ) {
			const expiredToday = moment().diff( purchase.expiryMoment, 'hours' ) < 24;
			const expiredText = expiredToday
				? purchase.expiryMoment.format( '[today]' )
				: purchase.expiryMoment.fromNow();

			return (
				<Notice isCompact status="is-error" icon="notice">
					{ translate( 'Expired %(timeSinceExpiry)s', {
						args: {
							timeSinceExpiry: expiredText,
						},
						context: 'timeSinceExpiry is of the form "[number] [time-period] ago" i.e. "3 days ago"',
					} ) }
					{ this.trackImpression( 'purchase-expired' ) }
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
		const { isPlaceholder, isDisconnectedSite, purchase } = this.props;
		const classes = classNames(
			'purchase-item',
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
		} else if ( purchase && isTheme( purchase ) ) {
			icon = (
				<div className="purchase-item__plan-icon">
					<Gridicon icon="themes" size={ 24 } />
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
						<div className="purchase-item__purchase-type">
							{ purchaseType( this.props.purchase ) }
						</div>
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
				onClick: this.scrollToTop,
			};

			if ( ! isDisconnectedSite ) {
				props.href = paths.managePurchase( this.props.slug, this.props.purchase.id );
			}
		}

		return (
			<CompactCard className={ classes } { ...props }>
				{ content }
			</CompactCard>
		);
	}
}

PurchaseItem.propTypes = {
	isPlaceholder: PropTypes.bool,
	isDisconnectedSite: PropTypes.bool,
	purchase: PropTypes.object,
	slug: PropTypes.string,
};

export default localize( PurchaseItem );
