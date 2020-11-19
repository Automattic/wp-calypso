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
	creditCardExpiresBeforeSubscription,
	creditCardHasAlreadyExpired,
	getPartnerName,
} from 'calypso/lib/purchases';
import { isDomainTransfer, isConciergeSession } from 'calypso/lib/products-values';
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

		if ( isRenewing( purchase ) && purchase.renewDate ) {
			const renewDate = moment( purchase.renewDate );

			if ( creditCardHasAlreadyExpired( purchase ) ) {
				return (
					<span className="purchase-item__is-error">
						{ translate( 'Credit card expired' ) }
						{ this.trackImpression( 'credit-card-expiring' ) }
					</span>
				);
			}

			if ( creditCardExpiresBeforeSubscription( purchase ) ) {
				return (
					<span className="purchase-item__is-error">
						{ translate( 'Credit card expiring soon' ) }
						{ this.trackImpression( 'credit-card-expiring' ) }
					</span>
				);
			}

			return translate( 'Renews at %(amount)s on {{span}}%(date)s{{/span}}', {
				args: {
					amount: purchase.priceText,
					date: renewDate.format( 'LL' ),
				},
				components: {
					span: <span className="purchase-item__date" />,
				},
			} );
		}

		const expiry = moment( purchase.expiryDate );

		if ( isExpiring( purchase ) ) {
			if ( expiry < moment().add( 30, 'days' ) && ! isRecentMonthlyPurchase( purchase ) ) {
				const expiryClass =
					expiry < moment().add( 7, 'days' )
						? 'purchase-item__is-error'
						: 'purchase-item__is-warning';

				return (
					<span className={ expiryClass }>
						{ translate( 'Expires %(timeUntilExpiry)s on {{span}}%(date)s{{/span}}', {
							args: {
								timeUntilExpiry: expiry.fromNow(),
								date: expiry.format( 'LL' ),
							},
							components: {
								span: <span className="purchase-item__date" />,
							},
							context:
								'timeUntilExpiry is of the form "[number] [time-period] ago" i.e. "3 days ago"',
						} ) }
						{ this.trackImpression( 'purchase-expiring' ) }
					</span>
				);
			}

			return translate( 'Expires on {{span}}%s{{/span}}', {
				args: expiry.format( 'LL' ),
				components: {
					span: <span className="purchase-item__date" />,
				},
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
				<span className="purchase-item__is-error">
					{ translate( 'Expired %(timeSinceExpiry)s', {
						args: {
							timeSinceExpiry: expiredText,
						},
						context:
							'timeSinceExpiry is of the form "[number] [time-period] ago" i.e. "3 days ago"',
					} ) }
					{ this.trackImpression( 'purchase-expired' ) }
				</span>
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

	getPurchaseType() {
		const { purchase, site } = this.props;

		if ( ! purchase ) {
			//Add site-level condition
			return purchaseType( purchase );
		}

		return (
			<>
				{ purchaseType( purchase ) } for{ ' ' }
				<span className="purchase-item__site-name">{ site.name }</span>
			</>
		);
	}

	getStatus() {
		const { purchase, translate } = this.props;

		if ( purchase && isPartnerPurchase( purchase ) ) {
			return translate( 'This plan is managed by %(partnerName)s.', {
				args: {
					partnerName: getPartnerName( purchase ),
				},
			} );
		}

		return this.renewsOrExpiresOn();
	}

	getPaymentMethod() {
		const { purchase } = this.props;

		if ( isRenewing( purchase ) ) {
			if ( purchase.payment.type === 'credit_card' ) {
				return purchase.payment.creditCard.type + ' **** ' + purchase.payment.creditCard.number;
			}
		}

		return null;
	}

	renderPurhaseItemContent = () => {
		const { isPlaceholder, purchase, site } = this.props;
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
				{ true && ( // check prop to inlude site info
					<div className="purchase-item__site-icon">
						<SiteIcon site={ site } size={ 24 } />
					</div>
				) }

				<div className="purchase-item__information">
					<div className="purchase-item__title">{ getDisplayName( purchase ) }</div>
					<div className="purchase-item__purchase-type">{ this.getPurchaseType() }</div>
				</div>

				<div className="purchase-item__status">{ this.getStatus() }</div>

				<div className="purchase-item__payment-method">{ this.getPaymentMethod() }</div>
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
