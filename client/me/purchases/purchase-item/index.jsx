/** @format */
/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
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
	showCreditCardExpiringWarning,
	subscribedWithinPastWeek,
} from 'lib/purchases';
import { isDomainTransfer } from 'lib/products-values';
import Notice from 'components/notice';
import ProductIcon from '../product-icon';
import { managePurchase } from '../paths';
import TrackComponentView from 'lib/analytics/track-component-view';

const eventProperties = warning => ( { warning, position: 'purchase-list' } );

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
				const status = subscribedWithinPastWeek( purchase ) ? 'is-info' : 'is-error';
				return (
					<Notice isCompact status={ status } icon="notice">
						{ translate( 'Expires %(timeUntilExpiry)s', {
							args: {
								timeUntilExpiry: purchase.expiryMoment.fromNow(),
							},
							context:
								'timeUntilExpiry is of the form "[number] [time-period] ago" i.e. "3 days ago"',
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
						context:
							'timeSinceExpiry is of the form "[number] [time-period] ago" i.e. "3 days ago"',
					} ) }
					{ this.trackImpression( 'purchase-expired' ) }
				</Notice>
			);
		}

		if ( isIncludedWithPlan( purchase ) ) {
			return translate( 'Included with Plan' );
		}

		if ( isOneTimePurchase( purchase ) && ! isDomainTransfer( purchase ) ) {
			return translate( 'Never Expires' );
		}

		return null;
	}

	placeholder() {
		return (
			<span className="purchase-item__wrapper">
				<div className="purchase-item__plan-icon purchase-icon" />
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
		const { isPlaceholder, isDisconnectedSite, purchase, isJetpack } = this.props;
		const classes = classNames(
			'purchase-item',
			{ 'is-expired': purchase && 'expired' === purchase.expiryStatus },
			{ 'is-placeholder': isPlaceholder },
			{ 'is-included-with-plan': purchase && isIncludedWithPlan( purchase ) }
		);

		let content;
		if ( isPlaceholder ) {
			content = this.placeholder();
		} else {
			content = (
				<span className="purchase-item__wrapper">
					<ProductIcon className="purchase-item__plan-icon" productSlug={ purchase.productSlug } />
					<div className="purchase-item__details">
						<div className="purchase-item__title">{ getName( purchase ) }</div>
						<div className="purchase-item__purchase-type">{ purchaseType( purchase ) }</div>
						<div className="purchase-item__purchase-date">{ this.renewsOrExpiresOn() }</div>
					</div>
				</span>
			);
		}

		let onClick;
		let href;
		if ( ! isPlaceholder ) {
			// A "disconnected" Jetpack site's purchases may be managed.
			// A "disconnected" WordPress.com site may not (the user has been removed).
			if ( ! isDisconnectedSite || isJetpack ) {
				onClick = this.scrollToTop;
				href = managePurchase( this.props.slug, this.props.purchase.id );
			}
		}

		return (
			<CompactCard
				className={ classes }
				data-e2e-connected-site={ ! isDisconnectedSite }
				href={ href }
				onClick={ onClick }
			>
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
	isJetpack: PropTypes.bool,
};

export default localize( PurchaseItem );
