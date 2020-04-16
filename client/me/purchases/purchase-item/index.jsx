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
import { CompactCard, ProductIcon } from '@automattic/components';
import {
	getDisplayName,
	isExpired,
	isExpiring,
	isIncludedWithPlan,
	isOneTimePurchase,
	isPartnerPurchase,
	isRenewing,
	purchaseType,
	showCreditCardExpiringWarning,
	subscribedWithinPastWeek,
	getPartnerName,
} from 'lib/purchases';
import {
	isDomainProduct,
	isDomainTransfer,
	isGoogleApps,
	isPlan,
	isTheme,
	isJetpackProduct,
	isConciergeSession,
} from 'lib/products-values';
import Notice from 'components/notice';
import Gridicon from 'components/gridicon';
import { withLocalizedMoment } from 'components/localized-moment';
import { managePurchase } from '../paths';
import TrackComponentView from 'lib/analytics/track-component-view';
import { getPlanClass, getPlanTermLabel } from 'lib/plans';

/**
 * Style dependencies
 */
import './style.scss';

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

		if ( isRenewing( purchase ) && purchase.renewDate ) {
			const renewDate = moment( purchase.renewDate );
			return translate( 'Renews on %s', {
				args: renewDate.format( 'LL' ),
			} );
		}

		const expiry = moment( purchase.expiryDate );

		if ( isExpiring( purchase ) ) {
			if ( expiry < moment().add( 30, 'days' ) ) {
				const status = subscribedWithinPastWeek( purchase ) ? 'is-info' : 'is-error';
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

	renderIcon() {
		const { purchase } = this.props;

		if ( ! purchase ) {
			return null;
		}

		if ( isPlan( purchase ) || isJetpackProduct( purchase ) ) {
			return (
				<div className="purchase-item__plan-icon">
					<ProductIcon
						slug={ purchase.productSlug }
						className={ getPlanClass( purchase.productSlug ) }
					/>
				</div>
			);
		}

		let icon;
		if ( isDomainProduct( purchase ) || isDomainTransfer( purchase ) ) {
			icon = 'domains';
		} else if ( isTheme( purchase ) ) {
			icon = 'themes';
		} else if ( isGoogleApps( purchase ) ) {
			icon = 'mail';
		}

		if ( ! icon ) {
			return null;
		}

		return (
			<div className="purchase-item__plan-icon">
				<Gridicon icon={ icon } size={ 24 } />
			</div>
		);
	}

	getLabelText() {
		const { purchase, translate } = this.props;

		if ( purchase && isPartnerPurchase( purchase ) ) {
			return translate( 'This plan is managed by %(partnerName)s', {
				args: {
					partnerName: getPartnerName( purchase ),
				},
			} );
		} else if ( purchase && purchase.productSlug ) {
			return getPlanTermLabel( purchase.productSlug, translate );
		}

		return null;
	}

	render() {
		const { isPlaceholder, isDisconnectedSite, purchase, isJetpack } = this.props;
		const classes = classNames(
			'purchase-item',
			{ 'is-expired': purchase && 'expired' === purchase.expiryStatus },
			{ 'is-placeholder': isPlaceholder },
			{ 'is-included-with-plan': purchase && isIncludedWithPlan( purchase ) }
		);

		const label = this.getLabelText();

		let content;
		if ( isPlaceholder ) {
			content = this.placeholder();
		} else {
			content = (
				<span className="purchase-item__wrapper">
					{ this.renderIcon() }
					<div className="purchase-item__details">
						<div className="purchase-item__title">{ getDisplayName( purchase ) }</div>
						<div className="purchase-item__purchase-type">{ purchaseType( purchase ) }</div>
						{ label && <div className="purchase-item__term-label">{ label }</div> }
						{ ! isPartnerPurchase( purchase ) && (
							<div className="purchase-item__purchase-date">{ this.renewsOrExpiresOn() }</div>
						) }
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

export default localize( withLocalizedMoment( PurchaseItem ) );
