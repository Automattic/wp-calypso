import {
	isDomainTransfer,
	isConciergeSession,
	isAkismetFreeProduct,
	PLAN_MONTHLY_PERIOD,
	PLAN_ANNUAL_PERIOD,
	PLAN_BIENNIAL_PERIOD,
	PLAN_TRIENNIAL_PERIOD,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { CompactCard, Gridicon } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { ExternalLink } from '@wordpress/components';
import { Icon, warning as warningIcon } from '@wordpress/icons';
import classNames from 'classnames';
import i18n, { localize, useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import akismetIcon from 'calypso/assets/images/icons/akismet-icon.svg';
import payPalImage from 'calypso/assets/images/upgrades/paypal-full.svg';
import SiteIcon from 'calypso/blocks/site-icon';
import InfoPopover from 'calypso/components/info-popover';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { getPaymentMethodImageURL } from 'calypso/lib/checkout/payment-methods';
import {
	getDisplayName,
	isExpired,
	isExpiring,
	isRechargeable,
	isIncludedWithPlan,
	isOneTimePurchase,
	isPartnerPurchase,
	isRecentMonthlyPurchase,
	isRenewing,
	purchaseType,
	creditCardExpiresBeforeSubscription,
	creditCardHasAlreadyExpired,
	getPartnerName,
	isWithinIntroductoryOfferPeriod,
	isIntroductoryOfferFreeTrial,
	hasPaymentMethod,
} from 'calypso/lib/purchases';
import { CALYPSO_CONTACT } from 'calypso/lib/url/support';
import { getPurchaseListUrlFor } from 'calypso/my-sites/purchases/paths';
import {
	isTemporarySitePurchase,
	isJetpackTemporarySitePurchase,
	isAkismetTemporarySitePurchase,
	isMarketplaceTemporarySitePurchase,
} from '../utils';
import OwnerInfo from './owner-info';
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
		const { purchase, translate, locale, moment, name, isJetpack, isDisconnectedSite } = this.props;
		const expiry = moment( purchase.expiryDate );

		if ( purchase && isPartnerPurchase( purchase ) ) {
			return translate( 'Managed by %(partnerName)s', {
				args: {
					partnerName: getPartnerName( purchase ),
				},
			} );
		}

		if (
			isDisconnectedSite &&
			! isAkismetTemporarySitePurchase( purchase ) &&
			! isMarketplaceTemporarySitePurchase( purchase )
		) {
			if ( isJetpackTemporarySitePurchase( purchase ) ) {
				return (
					<>
						<span className="purchase-item__is-error">
							{ translate( 'Activate your product license key' ) }
						</span>
						<br />
						{ /* TODO: These anchor links are causing React console warnings,
						"Warning: validateDOMNesting(...): <a> cannot appear as a descendant of <a>."
						Because the <CompactCard> component that renders this also us surrounded by an anchor link.
						See: <Card> General Guidelines: https://github.com/Automattic/wp-calypso/tree/trunk/packages/components/src/card#general-guidelines
						TLDR: Don't display more than one primary button or action in a single card. (in which the card itself if a primary action/link in this case) */ }
						<ExternalLink
							className="purchase-item__link"
							href="https://jetpack.com/support/install-jetpack-and-connect-your-new-plan/#how-can-i-activate-my-license-key-in-my-jetpack-installation"
						>
							{ translate( 'Learn more' ) }
						</ExternalLink>
					</>
				);
			}

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

		if ( purchase.isInAppPurchase ) {
			return translate(
				'This product is an in-app purchase. You can manage it from within {{managePurchase}}the app store{{/managePurchase}}.',
				{
					components: {
						managePurchase: <a href={ purchase.iapPurchaseManagementLink } />,
					},
				}
			);
		}

		if ( isWithinIntroductoryOfferPeriod( purchase ) && isIntroductoryOfferFreeTrial( purchase ) ) {
			if (
				isRenewing( purchase ) &&
				( locale === 'en' ||
					i18n.hasTranslation(
						'Free trial ends on {{span}}%(date)s{{/span}}, renews automatically at %(amount)s'
					) )
			) {
				return translate(
					'Free trial ends on {{span}}%(date)s{{/span}}, renews automatically at %(amount)s',
					{
						args: {
							date: expiry.format( 'LL' ),
							amount: formatCurrency( purchase.priceInteger, purchase.currencyCode, {
								isSmallestUnit: true,
								stripZeros: true,
							} ),
						},
						components: {
							span: <span className="purchase-item__date" />,
						},
					}
				);
			}

			if (
				locale === 'en' ||
				i18n.hasTranslation( 'Free trial ends on {{span}}%(date)s{{/span}}' )
			) {
				const expiryClass =
					expiry < moment().add( 7, 'days' )
						? 'purchase-item__is-error'
						: 'purchase-item__is-warning';

				return (
					<span className={ expiryClass }>
						{ translate( 'Free trial ends on {{span}}%(date)s{{/span}}', {
							args: {
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
					<span className="purchase-item__is-warning">
						{ translate(
							'Credit card expires before your next renewal on {{span}}%(date)s{{/span}}',
							{
								args: {
									date: renewDate.format( 'LL' ),
								},
								components: {
									span: <span className="purchase-item__date" />,
								},
							}
						) }
						{ this.trackImpression( 'credit-card-expiring' ) }
					</span>
				);
			}

			if ( purchase.billPeriodDays ) {
				const translateOptions = {
					args: {
						amount: formatCurrency( purchase.priceInteger, purchase.currencyCode, {
							isSmallestUnit: true,
							stripZeros: true,
						} ),
						date: renewDate.format( 'LL' ),
					},
					components: {
						span: <span className="purchase-item__date" />,
					},
				};
				switch ( purchase.billPeriodDays ) {
					case PLAN_MONTHLY_PERIOD:
						if (
							locale === 'en' ||
							i18n.hasTranslation( 'Renews monthly at %(amount)s on {{span}}%(date)s{{/span}}' )
						) {
							return translate(
								'Renews monthly at %(amount)s on {{span}}%(date)s{{/span}}',
								translateOptions
							);
						}
					case PLAN_ANNUAL_PERIOD:
						if (
							locale === 'en' ||
							i18n.hasTranslation( 'Renews yearly at %(amount)s on {{span}}%(date)s{{/span}}' )
						) {
							return translate(
								'Renews yearly at %(amount)s on {{span}}%(date)s{{/span}}',
								translateOptions
							);
						}
					case PLAN_BIENNIAL_PERIOD:
						if (
							locale === 'en' ||
							i18n.hasTranslation(
								'Renews every two years at %(amount)s on {{span}}%(date)s{{/span}}'
							)
						) {
							return translate(
								'Renews every two years at %(amount)s on {{span}}%(date)s{{/span}}',
								translateOptions
							);
						}
					case PLAN_TRIENNIAL_PERIOD:
						if (
							locale === 'en' ||
							i18n.hasTranslation(
								'Renews every three years at %(amount)s on {{span}}%(date)s{{/span}}'
							)
						) {
							return translate(
								'Renews every three years at %(amount)s on {{span}}%(date)s{{/span}}',
								translateOptions
							);
						}
				}
			}

			return translate( 'Renews at %(amount)s on {{span}}%(date)s{{/span}}', {
				args: {
					amount: formatCurrency( purchase.priceInteger, purchase.currencyCode, {
						isSmallestUnit: true,
						stripZeros: true,
					} ),
					date: renewDate.format( 'LL' ),
				},
				components: {
					span: <span className="purchase-item__date" />,
				},
			} );
		}

		if ( isExpiring( purchase ) && ! isAkismetFreeProduct( purchase ) ) {
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
			if ( isConciergeSession( purchase ) ) {
				return translate( 'Session used on %s', {
					args: expiry.format( 'LL' ),
				} );
			}

			const isExpiredToday = moment().diff( expiry, 'hours' ) < 24;
			const expiredTodayText = translate( 'Expired today' );
			const expiredFromNowText = translate( 'Expired %(timeSinceExpiry)s', {
				args: {
					timeSinceExpiry: expiry.fromNow(),
				},
				context: 'timeSinceExpiry is of the form "[number] [time-period] ago" i.e. "3 days ago"',
			} );

			return (
				<span className="purchase-item__is-error">
					{ isExpiredToday ? expiredTodayText : expiredFromNowText }
					{ this.trackImpression( 'purchase-expired' ) }
				</span>
			);
		}

		if ( isIncludedWithPlan( purchase ) ) {
			return translate( 'Included with Plan' );
		}

		if (
			( isOneTimePurchase( purchase ) || isAkismetFreeProduct( purchase ) ) &&
			! isDomainTransfer( purchase )
		) {
			return translate( 'Never Expires' );
		}

		return null;
	}

	getPurchaseType() {
		const { purchase, site, translate, slug, showSite, isDisconnectedSite } = this.props;
		if ( isTemporarySitePurchase( purchase ) ) {
			return null;
		}

		const productType = purchaseType( purchase );
		if ( showSite && site ) {
			if ( productType ) {
				return translate( '%(purchaseType)s for {{button}}%(site)s{{/button}}', {
					args: {
						purchaseType: productType,
						site: site.domain,
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

			return translate( 'for {{button}}%(site)s{{/button}}', {
				args: {
					site: site.domain,
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
					purchaseType: productType,
					site: purchase.domain,
				},
			} );
		}

		return productType;
	}

	getPaymentMethod() {
		const { purchase, translate } = this.props;

		if ( isIncludedWithPlan( purchase ) ) {
			return translate( 'Included with Plan' );
		}

		if ( purchase.isInAppPurchase ) {
			return (
				<div>
					<span>{ translate( 'In-App Purchase' ) }</span>
				</div>
			);
		}

		if (
			purchase.isAutoRenewEnabled &&
			! hasPaymentMethod( purchase ) &&
			! isPartnerPurchase( purchase ) &&
			! isAkismetFreeProduct( purchase )
		) {
			return (
				<div className="purchase-item__no-payment-method">
					<Icon icon={ warningIcon } />
					<span>{ translate( 'You don’t have a payment method to renew this subscription' ) }</span>
				</div>
			);
		}

		if (
			! isAkismetFreeProduct( purchase ) &&
			! isRechargeable( purchase ) &&
			hasPaymentMethod( purchase ) &&
			purchase.isAutoRenewEnabled
		) {
			return (
				<div className="purchase-item__no-payment-method">
					<Icon icon={ warningIcon } />
					<span>{ translate( 'You don’t have a payment method to renew this subscription' ) }</span>
				</div>
			);
		}

		if ( isRenewing( purchase ) ) {
			if ( purchase.payment.type === 'credit_card' ) {
				return (
					<>
						<img
							src={ getPaymentMethodImageURL( purchase.payment.creditCard.type ) }
							alt={ purchase.payment.creditCard.type }
							className="purchase-item__payment-method-card"
						/>
						{ purchase.payment.creditCard.number }
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

	getSiteIcon = () => {
		const { site, isDisconnectedSite, purchase } = this.props;

		if ( isAkismetTemporarySitePurchase( purchase ) ) {
			return (
				<div className="purchase-item__static-icon">
					<img src={ akismetIcon } alt="Akismet icon" />
				</div>
			);
		}

		if ( isMarketplaceTemporarySitePurchase( purchase ) ) {
			return <SiteIcon size={ 36 } />;
		}

		if ( isDisconnectedSite ) {
			return (
				<div className="purchase-item__disconnected-icon">
					<Gridicon icon="block" size={ Math.round( 36 / 1.8 ) } />
				</div>
			);
		}

		return <SiteIcon site={ site } size={ 36 } />;
	};

	renderPurchaseItemContent = () => {
		const { purchase, showSite, isBackupMethodAvailable } = this.props;

		return (
			<div className="purchase-item__wrapper purchases-layout__wrapper">
				{ showSite && (
					<div className="purchase-item__site purchases-layout__site">{ this.getSiteIcon() }</div>
				) }

				<div className="purchase-item__information purchases-layout__information">
					<div className="purchase-item__title">
						{ getDisplayName( purchase ) }
						&nbsp;
						<OwnerInfo purchase={ purchase } />
					</div>

					<div className="purchase-item__purchase-type">{ this.getPurchaseType() }</div>
				</div>

				<div className="purchase-item__status purchases-layout__status">{ this.getStatus() }</div>

				<div className="purchase-item__payment-method purchases-layout__payment-method">
					{ this.getPaymentMethod() }
					{ isBackupMethodAvailable && isRenewing( purchase ) && <BackupPaymentMethodNotice /> }
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

		let onClick;
		let href;

		if ( ! isPlaceholder && getManagePurchaseUrlFor ) {
			// A "disconnected" Jetpack site's purchases may be managed.
			// A "disconnected" WordPress.com site may *NOT* be managed (the user has been removed), unless it is a
			// WPCOM generated temporary site, which is created during the siteless checkout flow. (currently Jetpack & Akismet can have siteless purchases).
			if ( ! isDisconnectedSite || isJetpack || isTemporarySitePurchase( purchase ) ) {
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
				{ this.renderPurchaseItemContent() }
			</CompactCard>
		);
	}
}

function BackupPaymentMethodNotice() {
	const translate = useTranslate();
	const noticeText = translate(
		'If the renewal fails, a {{link}}backup payment method{{/link}} may be used.',
		{
			components: {
				link: <a href="/me/purchases/payment-methods" />,
			},
		}
	);
	return (
		<span className="purchase-item__backup-payment-method-notice">
			<InfoPopover position="bottom">{ noticeText }</InfoPopover>
		</span>
	);
}

PurchaseItem.propTypes = {
	getManagePurchaseUrlFor: PropTypes.func,
	isDisconnectedSite: PropTypes.bool,
	isJetpack: PropTypes.bool,
	isPlaceholder: PropTypes.bool,
	purchase: PropTypes.object,
	showSite: PropTypes.bool,
	slug: PropTypes.string,
	isBackupMethodAvailable: PropTypes.bool,
};

export default localize( withLocalizedMoment( PurchaseItem ) );
