/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import page from 'page';
import classNames from 'classnames';

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
import { getPurchaseListUrlFor } from 'calypso/my-sites/purchases/paths';
import { getPaymentMethodImageURL } from 'calypso/lib/checkout/payment-methods';
import payPalImage from 'calypso/assets/images/upgrades/paypal-full.svg';
import { CALYPSO_CONTACT } from 'calypso/lib/url/support';

/**
 * Style dependencies
 */
import 'calypso/me/purchases/style.scss';

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

	getStatus() {
		const { purchase, translate, moment, name, isJetpack, isDisconnectedSite } = this.props;
		const expiry = moment( purchase.expiryDate );

		if ( purchase && isPartnerPurchase( purchase ) ) {
			return translate( 'Managed by %(partnerName)s', {
				args: {
					partnerName: getPartnerName( purchase ),
				},
			} );
		}

		if ( isDisconnectedSite ) {
			if ( isJetpack ) {
				return (
					<span className="purchase-item__is-error">
						{ translate( 'Disconnected from WordPress.com' ) }
					</span>
				);
			}

			return (
				<span className="purchase-item__is-error">
					{ translate(
						'You no longer have access to this site and its purchases. {{button}}Contact support{{/button}}',
						{
							args: {
								site: name,
							},
							components: {
								button: (
									<button
										className="purchase-item__link purchase-item__link--error"
										onClick={ ( event ) => {
											event.stopPropagation();
											event.preventDefault();
											page( CALYPSO_CONTACT );
										} }
										title={ translate( 'Contact Support' ) }
									/>
								),
							},
						}
					) }
				</span>
			);
		}

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
			const expiredToday = moment().diff( expiry, 'hours' ) < 24;
			const expiredText = expiredToday ? expiry.format( '[today]' ) : expiry.fromNow();

			if ( isConciergeSession( purchase ) ) {
				return translate( 'Session used on %s', {
					args: expiry.format( 'LL' ),
				} );
			}

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

	getPurchaseType() {
		const { purchase, site, translate, slug, showSite, isDisconnectedSite, name } = this.props;

		if ( showSite && site ) {
			return translate( '%(purchaseType)s for {{button}}%(site)s{{/button}}', {
				args: {
					purchaseType: purchaseType( purchase ),
					site: site.name,
				},
				components: {
					button: (
						<button
							className="purchase-item__link"
							onClick={ ( event ) => {
								event.stopPropagation();
								event.preventDefault();
								page( getPurchaseListUrlFor( slug ) );
							} }
							title={ translate( 'View subscriptions for %(siteName)s', {
								args: {
									siteName: site.name,
								},
							} ) }
						/>
					),
				},
			} );
		}

		if ( isDisconnectedSite ) {
			return translate( '%(purchaseType)s for %(site)s', {
				args: {
					purchaseType: purchaseType( purchase ),
					site: name,
				},
			} );
		}

		return purchaseType( purchase );
	}

	getPaymentMethod() {
		const { purchase } = this.props;

		if ( isRenewing( purchase ) ) {
			if ( purchase.payment.type === 'credit_card' ) {
				return (
					<>
						<img
							src={ getPaymentMethodImageURL( purchase.payment.creditCard.type ) }
							alt={ purchase.payment.creditCard.type }
							className="purchase-item__payment-method-card"
						/>
						{ purchase.payment.type === 'credit_card' && purchase.payment.creditCard.number }
					</>
				);
			}

			if ( purchase.payment.type === 'paypal' ) {
				return (
					<img
						src={ payPalImage }
						alt={ purchase.payment.type }
						className="purchase-item__paypal"
					/>
				);
			}

			return null;
		}
	}

	renderPurhaseItemContent = () => {
		const { purchase, site, showSite } = this.props;

		return (
			<div className="purchase-item__wrapper purchases-layout__wrapper">
				{ showSite && (
					<div className="purchase-item__site purchases-layout__site">
						<SiteIcon site={ site } size={ 24 } />
					</div>
				) }

				<div className="purchase-item__information purchases-layout__information">
					<div className="purchase-item__title">{ getDisplayName( purchase ) }</div>
					<div className="purchase-item__purchase-type">{ this.getPurchaseType() }</div>
				</div>

				<div className="purchase-item__status purchases-layout__status">{ this.getStatus() }</div>

				<div className="purchase-item__payment-method purchases-layout__payment-method">
					{ this.getPaymentMethod() }
				</div>
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

		const classes = classNames( 'purchase-item', {
			'purchase-item--disconnected': isDisconnectedSite,
		} );

		if ( isPlaceholder ) {
			return (
				<>
					<CompactCard className="purchase-item__placeholder-wrapper purchases-list-header" />
					<CompactCard>
						<div className="purchase-item__placeholder" />
					</CompactCard>
				</>
			);
		}

		if ( ! isPlaceholder && getManagePurchaseUrlFor ) {
			// A "disconnected" Jetpack site's purchases may be managed.
			// A "disconnected" WordPress.com site may not (the user has been removed).
			if ( ! isDisconnectedSite || isJetpack ) {
				onClick = () => {
					window.scrollTo( 0, 0 );
				};
				href = getManagePurchaseUrlFor( slug, purchase.id );
			}
		}

		return (
			<CompactCard
				className={ classes }
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
	getManagePurchaseUrlFor: PropTypes.func,
	isDisconnectedSite: PropTypes.bool,
	isJetpack: PropTypes.bool,
	isPlaceholder: PropTypes.bool,
	purchase: PropTypes.object,
	showSite: PropTypes.bool,
	slug: PropTypes.string,
};

export default localize( withLocalizedMoment( PurchaseItem ) );
