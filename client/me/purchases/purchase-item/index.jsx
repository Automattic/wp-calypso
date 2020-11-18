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
import { CompactCard } from '@automattic/components';
import {
	getDisplayName,
	isExpired,
	isExpiring,
	isIncludedWithPlan,
	isOneTimePurchase,
	isPartnerPurchase,
	isRecentMonthlyPurchase,
	isRenewing,
	purchaseType,
	showCreditCardExpiringWarning,
	getPartnerName,
} from 'calypso/lib/purchases';
import { isDomainTransfer, isConciergeSession } from 'calypso/lib/products-values';
import Notice from 'calypso/components/notice';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import SiteIcon from 'calypso/blocks/site-icon';

/**
 * Style dependencies
 */
import './style.scss';

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

		if ( isRenewing( purchase ) && purchase.renewDate ) {
			const renewDate = moment( purchase.renewDate );

			return translate( 'Renews at %(amount)s on %(date)s.', {
				args: {
					amount: purchase.priceText,
					date: renewDate.format( 'LL' ),
				},
			} );
		}

		const expiry = moment( purchase.expiryDate );

		if ( isExpiring( purchase ) ) {
			if ( expiry < moment().add( 30, 'days' ) ) {
				const status = isRecentMonthlyPurchase( purchase ) ? 'is-info' : 'is-error';
				return (
					<Notice isCompact status={ status } icon="notice">
						{ translate( 'Expires %(timeUntilExpiry)s', {
							args: {
								timeUntilExpiry: expiry.fromNow(),
							},
							context:
								'timeUntilExpiry is of the form "[number] [time-period] ago" i.e. "3 days ago"',
						} ) }
						{ this.trackImpression( 'purchase-expiring' ) }
					</Notice>
				);
			}

			return translate( 'Expires on %s', {
				args: expiry.format( 'LL' ),
			} );
		}

		if ( isExpired( purchase ) ) {
			if ( isConciergeSession( purchase ) ) {
				return translate( 'Session used on %s', {
					args: expiry.format( 'LL' ),
				} );
			}

			const expiredToday = moment().diff( expiry, 'hours' ) < 24;
			const expiredText = expiredToday ? expiry.format( '[today]' ) : expiry.fromNow();

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

	scrollToTop() {
		window.scrollTo( 0, 0 );
	}

	getLabelText() {
		const { purchase, translate } = this.props;

		if ( purchase && isPartnerPurchase( purchase ) ) {
			return translate( 'This plan is managed by %(partnerName)s.', {
				args: {
					partnerName: getPartnerName( purchase ),
				},
			} );
		}

		return null;
	}

	renderPurhaseItemContent = () => {
		const { isPlaceholder, purchase, site } = this.props;
		const label = this.getLabelText();
		const classes = classNames(
			'purchase-item__wrapper',
			{ 'is-expired': purchase && 'expired' === purchase.expiryStatus },
			{ 'is-placeholder': isPlaceholder },
			{ 'is-included-with-plan': purchase && isIncludedWithPlan( purchase ) }
		);

		if ( isPlaceholder ) {
			return <>Loading...</>;
		}

		return (
			<div className={ classes }>
				<SiteIcon site={ site } />

				<div className="purchase-item__title">{ getDisplayName( purchase ) }</div>
				<div className="purchase-item__purchase-type">
					{ purchaseType( purchase ) + ' for ' + site.name + ' (' + site.URL + ')' }
				</div>
				{ label && <div className="purchase-item__term-label">{ label }</div> }
				{ ! isPartnerPurchase( purchase ) && (
					<div className="purchase-item__purchase-date">{ this.renewsOrExpiresOn() }</div>
				) }
			</div>
		);
	};

	render() {
		const {
			isPlaceholder,
			isDisconnectedSite,
			getManagePurchaseUrlFor,
			purchase,
			slug,
			isJetpack,
		} = this.props;

		let onClick;
		let href;
		if ( ! isPlaceholder && getManagePurchaseUrlFor ) {
			// A "disconnected" Jetpack site's purchases may be managed.
			// A "disconnected" WordPress.com site may not (the user has been removed).
			if ( ! isDisconnectedSite || isJetpack ) {
				onClick = this.scrollToTop;
				href = getManagePurchaseUrlFor( slug, purchase.id );
			}
		}

		return (
			<CompactCard
				className="purchase-item"
				data-e2e-connected-site={ ! isDisconnectedSite }
				href={ href }
				onClick={ onClick }
			>
				{ this.renderPurhaseItemContent() }
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
	getManagePurchaseUrlFor: PropTypes.func,
};

export default localize( withLocalizedMoment( PurchaseItem ) );
