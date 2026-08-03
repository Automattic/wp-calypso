import {
	isDomainTransfer,
	isDomainRegistration,
	isConciergeSession,
	isAkismetFreeProduct,
	PLAN_MONTHLY_PERIOD,
	PLAN_ANNUAL_PERIOD,
	PLAN_BIENNIAL_PERIOD,
	PLAN_TRIENNIAL_PERIOD,
	isJetpackPlan,
	isJetpackProduct,
	getPlan,
	is100Year,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { CompactCard, Gridicon } from '@automattic/components';
import { formatCurrency } from '@automattic/number-formatters';
import { CALYPSO_CONTACT } from '@automattic/urls';
import { getPaymentMethodImageURL, razorpayImage as upiImage } from '@automattic/wpcom-checkout';
import { ExternalLink, Button } from '@wordpress/components';
import { Icon, arrowUpRight, cautionFilled as warningIcon } from '@wordpress/icons';
import clsx from 'clsx';
import { localize, useTranslate } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import akismetIcon from 'calypso/assets/images/icons/akismet-icon.svg';
import jetpackIcon from 'calypso/assets/images/icons/jetpack-icon.svg';
import passportIcon from 'calypso/assets/images/icons/passport-icon.svg';
import payPalImage from 'calypso/assets/images/upgrades/paypal-full.svg';
import SiteIcon from 'calypso/blocks/site-icon';
import InfoPopover from 'calypso/components/info-popover';
import { withLocalizedMoment, useLocalizedMoment } from 'calypso/components/localized-moment';
import { getCalendarDaysUntil, getRelativeDayString } from 'calypso/dashboard/utils/datetime';
import { EXPIRY_ERROR_DAYS, EXPIRY_WARNING_DAYS } from 'calypso/dashboard/utils/purchase';
import {
	getExpiredCopy,
	getExpiredRenewalTitle,
	getExpiringSoonCopy,
	getExpiringSoonRenewalTitle,
} from 'calypso/dashboard/utils/purchase-expiry-copy';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import {
	getDisplayName,
	isExpiredOrRemoved,
	isExpiredWithNoAutoRenewAttemptsLeft,
	isExpiring,
	isRechargeable,
	isIncludedWithPlan,
	isOneTimePurchase,
	isPartnerPurchase,
	isRenewable,
	isCloseToExpiration,
	isRenewingBeforeExpiration,
	isRemoved,
	purchaseType,
	creditCardExpiresBeforeSubscription,
	creditCardHasAlreadyExpired,
	getPartnerName,
	isWithinIntroductoryOfferPeriod,
	isIntroductoryOfferFreeTrial,
	hasPaymentMethod,
	isPaidWithCredits,
	mightStillAutoRenew,
	handleRenewNowClick,
} from 'calypso/lib/purchases';
import { getPurchaseListUrlFor } from 'calypso/my-sites/purchases/paths';
import { useDispatch, useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import getSiteIconUrl from 'calypso/state/selectors/get-site-icon-url';
import { getSite } from 'calypso/state/sites/selectors';
import { isTransferredOwnership } from '../hooks/use-is-transferred-ownership';
import {
	isJetpackHoldingSitePurchase,
	isAkismetHoldingSitePurchase,
	isMarketplaceHoldingSitePurchase,
	isA4AHoldingSitePurchase,
	isA4ABillingDragonPurchase,
} from '../utils';
import OwnerInfo from './owner-info';
import type { Purchases, SiteDetails } from '@automattic/data-stores';
import 'calypso/me/purchases/style.scss';
import type { Site } from 'calypso/blocks/site-icon';
import type { ExpiryStatusCopy } from 'calypso/dashboard/utils/purchase-expiry-copy';
import type { GetManagePurchaseUrlFor } from 'calypso/lib/purchases/types';
import type { AppState } from 'calypso/types';
import type { LocalizeProps } from 'i18n-calypso';

const eventProperties = ( warning: string ) => ( { warning, position: 'purchase-list' } );

interface PurchaseItemPropsPlaceholder {
	isPlaceholder: true;
}

interface PurchaseItemProps {
	getManagePurchaseUrlFor: GetManagePurchaseUrlFor;
	purchase: Purchases.Purchase;
	site?: SiteDetails | null | undefined;
	slug?: string;
	showSite?: boolean;
	isPlaceholder?: boolean;
	isJetpack?: boolean;
	isDisconnectedSite?: boolean;
	isBackupMethodAvailable?: boolean;
	transferredOwnershipPurchases?: Purchases.Purchase[];
}

interface PurchaseItemPropsConnected {
	translate: LocalizeProps[ 'translate' ];
	moment: ReturnType< typeof useLocalizedMoment >;
	iconUrl: string | undefined;
}

function TrackImpression( props: { warning: string } ) {
	const warning = props.warning;
	return (
		<TrackComponentView
			eventName="calypso_subscription_warning_impression"
			eventProperties={ eventProperties( warning ) }
		/>
	);
}

export function PurchaseItemSiteIcon( {
	site,
	isDisconnectedSite,
	purchase,
	iconUrl,
}: {
	purchase: Purchases.Purchase;
	site?: Site | null | undefined;
	isDisconnectedSite?: boolean;
	iconUrl?: string | null;
} ) {
	let content = <SiteIcon site={ site ?? undefined } size={ 36 } />;

	if ( isAkismetHoldingSitePurchase( purchase ) ) {
		content = (
			<div className="purchase-item__static-icon">
				<img src={ akismetIcon } alt="Akismet icon" />
			</div>
		);
	}
	if ( isMarketplaceHoldingSitePurchase( purchase ) ) {
		if ( purchase.productSlug.startsWith( 'passport' ) ) {
			content = (
				<div className="purchase-item__static-icon">
					<img src={ passportIcon } alt="Passport icon" />
				</div>
			);
		} else {
			content = <SiteIcon size={ 36 } />;
		}
	}

	if ( isDisconnectedSite ) {
		content = (
			<div className="purchase-item__disconnected-icon">
				<Gridicon icon="block" size={ Math.round( 36 / 1.8 ) } />
			</div>
		);
	}

	const isJetpackPurchase = isJetpackProduct( purchase ) || isJetpackPlan( purchase );

	if ( ! iconUrl && isJetpackPurchase ) {
		content = (
			<div className="purchase-item__static-icon">
				<img src={ jetpackIcon } alt="Jetpack icon" />
			</div>
		);
	}

	return <div className="purchase-item__site purchases-layout__site">{ content }</div>;
}

export function PurchaseItemProduct( {
	purchase,
	site,
	translate,
	slug,
	showSite,
	isDisconnectedSite,
}: {
	purchase: Purchases.Purchase;
	site?: SiteDetails | null | undefined;
	translate: LocalizeProps[ 'translate' ];
	slug?: string | number | null;
	showSite?: boolean;
	isDisconnectedSite?: boolean;
} ) {
	if ( purchase.isAttachedToHoldingSite ) {
		return null;
	}

	const productType = isDomainRegistration( purchase ) ? null : purchaseType( purchase );

	if ( showSite && site ) {
		if ( productType && site.name && slug ) {
			// translators: The string contains the product name, the name of the site, and the URL for the site e.g. Premium plan for Block Store (blockstore.com)
			return translate(
				'%(purchaseType)s for {{button}}%(siteName)s{{/button}} ({{link}}%(siteDomain)s{{/link}})',
				{
					args: {
						purchaseType: productType,
						siteName: site.name,
						siteDomain: site.domain,
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
									textOnly: true,
									args: {
										siteName: site.name,
									},
								} ) }
							/>
						),
						link: (
							<a
								className="purchase-item__link"
								href={ 'https://' + site.domain }
								target="_blank"
								rel="noreferrer"
								title={ translate( 'View %(siteName)s', {
									textOnly: true,
									args: {
										siteName: site.name,
									},
								} ) }
							/>
						),
					},
				}
			);
		}

		if ( productType && slug ) {
			// translators: The string contains the product name, and the URL of the site e.g. Premium plan for blockstore.com
			return translate( '%(purchaseType)s for {{button}}%(siteDomain)s{{/button}}', {
				args: {
					purchaseType: productType,
					siteDomain: site.domain,
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
							title={ translate( 'View subscriptions for %(siteDomain)s', {
								textOnly: true,
								args: {
									siteDomain: site.domain,
								},
							} ) }
						/>
					),
				},
			} );
		}

		if ( site.name && slug ) {
			// translators: The string contains the name of the site, and the URL of the site e.g. for Block Store (blockstore.com)
			return translate( 'for {{button}}%(siteName)s{{/button}} ({{link}}%(siteDomain)s{{/link}})', {
				args: {
					siteName: site.name,
					siteDomain: site.domain,
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
								textOnly: true,
								args: {
									siteName: site.name,
								},
							} ) }
						/>
					),
					link: (
						<a
							className="purchase-item__link"
							href={ 'https://' + site.domain }
							target="_blank"
							rel="noreferrer"
							title={ translate( 'View %(siteName)s', {
								textOnly: true,
								args: {
									siteName: site.name,
								},
							} ) }
						/>
					),
				},
			} );
		}
	}

	if ( isDisconnectedSite && productType ) {
		return translate( '%(purchaseType)s for %(site)s', {
			textOnly: true,
			args: {
				purchaseType: productType,
				site: purchase.domain,
			},
		} );
	}

	return productType;
}

/**
 * The expiry status of a subscription that is close to expiring or has already
 * expired: colored to draw attention, and linked to renewal checkout where
 * renewing is something the viewer can act on right now.
 *
 * Expiry further off than the warning window is not urgent, and is rendered as
 * plain text by the caller rather than through here.
 */
function UrgentExpiryStatus( {
	purchase,
	copy,
	hasExpired,
	untranslatedFallbackText,
	isDisconnectedSite,
	impression,
}: {
	purchase: Purchases.Purchase;
	copy: ExpiryStatusCopy;

	/**
	 * Whether `copy` describes a lapsed subscription rather than one still
	 * heading for expiry. Taken from the caller because that is decided by the
	 * subscription's status, which can disagree with its date in both
	 * directions — and the tooltip has to read the same way the status does.
	 */
	hasExpired: boolean;

	/**
	 * Wording for locales that have no translation for `copy` yet. A `ReactNode`
	 * because that older sentence interpolates the date into an element. Both
	 * this and `copy.text`'s nullability go away once the copy is translated.
	 */
	untranslatedFallbackText?: React.ReactNode;
	isDisconnectedSite?: boolean;

	/** Rendered alongside the status, but outside the renewal link. */
	impression: React.ReactNode;
} ) {
	const dispatch = useDispatch();
	const moment = useLocalizedMoment();
	const currentUserId = useSelector( getCurrentUserId );
	const expiry = moment( purchase.expiryDate );
	const className =
		copy.intent === 'error' ? 'purchase-item__is-error' : 'purchase-item__is-warning';
	const expiryText = copy.text ?? untranslatedFallbackText;

	// The same conditions as `renderRenewButton` in `manage-purchase/index.tsx`:
	// both the ones inside it and the ownership and lock checks in the JSX that
	// renders it. That page also has a "Renew now" nav item which applies fewer
	// conditions, and it isn't clear whether the difference between the two is
	// intentional; these were copied from the header control because the link
	// below is prominent in the same way that one is.
	//
	// Repeated rather than shared because that page reads the raw
	// `@automattic/api-core` purchase and this list still reads the camelCase
	// `@automattic/data-stores` one (SHILL-2256), so each side needs different
	// field names.
	const canRenewNow =
		( ! isPartnerPurchase( purchase ) || isA4ABillingDragonPurchase( purchase ) ) &&
		isRenewable( purchase ) &&
		( ! isDisconnectedSite ||
			isAkismetHoldingSitePurchase( purchase ) ||
			isMarketplaceHoldingSitePurchase( purchase ) ||
			isA4ABillingDragonPurchase( purchase ) ) &&
		! isAkismetFreeProduct( purchase ) &&
		! ( is100Year( purchase ) && ! isCloseToExpiration( purchase ) ) &&
		purchase.canExplicitRenew &&
		purchase.userId === currentUserId &&
		! purchase.isLocked;

	// How close to expiry a subscription has to be before renewal is worth
	// offering. A monthly subscription is never far from expiring, so the annual
	// window would ask for a renewal within days of the purchase; it gets the
	// last week instead. Anything already past its expiry date is inside either.
	const renewalWindowDays =
		purchase.billPeriodDays === PLAN_MONTHLY_PERIOD ? EXPIRY_ERROR_DAYS : EXPIRY_WARNING_DAYS;
	const daysUntilExpiry = getCalendarDaysUntil( expiry.toDate() );
	const isRenewalWorthOffering = canRenewNow && daysUntilExpiry <= renewalWindowDays;

	if ( ! isRenewalWorthOffering ) {
		return (
			<span className={ className } title={ expiry.format( 'LL' ) }>
				{ expiryText }
				{ impression }
			</span>
		);
	}

	const renewalTitle = hasExpired
		? getExpiredRenewalTitle( expiry.format( 'LL' ) )
		: getExpiringSoonRenewalTitle( expiry.format( 'LL' ) );

	return (
		<span className={ className }>
			<button
				className="purchase-item__expiry-link"
				// On the button rather than the wrapper, so that it describes the
				// control to a screen reader as well as showing on hover.
				title={ renewalTitle ?? expiry.format( 'LL' ) }
				onClick={ ( event ) => {
					event.preventDefault();
					event.stopPropagation();
					// Come back to the list afterwards, whether the renewal goes
					// through or is abandoned, since that is where they were.
					// Absolute, since checkout runs on wordpress.com and the purchase
					// listing page can run on other hosts like Jetpack Cloud and A4A.
					const backUrl = window.location.href;
					dispatch(
						handleRenewNowClick( purchase, purchase.siteSlug ?? '', {
							redirectTo: backUrl,
							cancelTo: backUrl,
							tracksProps: { position: 'purchase-list' },
						} )
					);
				} }
			>
				{ expiryText }
				<Icon icon={ arrowUpRight } size={ 18 } />
			</button>
			{ impression }
		</span>
	);
}

export function PurchaseItemStatus( {
	purchase,
	translate,
	moment,
	isDisconnectedSite,
}: {
	purchase: Purchases.Purchase;
	translate: LocalizeProps[ 'translate' ];
	moment: ReturnType< typeof useLocalizedMoment >;
	isDisconnectedSite?: boolean;
} ) {
	const expiry = moment( purchase.expiryDate );

	// @todo: There isn't currently a way to get the taxName based on the
	// country. The country is not included in the purchase information
	// envelope. We should add this information so we can utilize useTaxName
	// to retrieve the correct taxName. For now, we are using a fallback tax
	// name with context, to prevent mis-translation.
	const taxName = translate( 'tax', {
		context: "Shortened form of 'Sales Tax', not a country-specific tax name",
	} );

	/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST"). */
	const excludeTaxStringAbbreviation = translate( '(excludes %s)', {
		textOnly: true,
		args: [ taxName ],
	} );

	/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST"). */
	const excludeTaxStringTitle = translate( 'Renewal price excludes any applicable %s', {
		textOnly: true,
		args: [ taxName ],
	} );

	if ( purchase && isPartnerPurchase( purchase ) ) {
		const partnerName = getPartnerName( purchase );
		if ( partnerName ) {
			return translate( 'Managed by %(partnerName)s', {
				args: {
					partnerName,
				},
			} );
		}
	}

	if (
		isDisconnectedSite &&
		! isAkismetHoldingSitePurchase( purchase ) &&
		! isMarketplaceHoldingSitePurchase( purchase ) &&
		! isA4AHoldingSitePurchase( purchase ) &&
		! isA4ABillingDragonPurchase( purchase )
	) {
		if ( isJetpackHoldingSitePurchase( purchase ) ) {
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
						href="https://jetpack.com/support/activate-a-jetpack-product-via-license-key/"
					>
						{ translate( 'Learn more' ) }
					</ExternalLink>
				</>
			);
		}

		if ( purchase.isJetpackPlanOrProduct ) {
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

	if ( purchase.isInAppPurchase && purchase.iapPurchaseManagementLink ) {
		return translate(
			'This product is an in-app purchase. You can manage it from within {{managePurchase}}the app store{{/managePurchase}}.',
			{
				components: {
					managePurchase: <a href={ purchase.iapPurchaseManagementLink } />,
				},
			}
		);
	}

	if (
		isWithinIntroductoryOfferPeriod( purchase ) &&
		isIntroductoryOfferFreeTrial( purchase ) &&
		! isExpiredOrRemoved( purchase )
	) {
		if ( isRenewingBeforeExpiration( purchase ) ) {
			return translate(
				'Free trial ends on {{span}}%(date)s{{/span}}, renews automatically at %(amount)s {{abbr}}%(excludeTaxStringAbbreviation)s{{/abbr}}',
				{
					args: {
						date: expiry.format( 'LL' ),
						amount: formatCurrency( purchase.priceInteger, purchase.currencyCode, {
							isSmallestUnit: true,
							stripZeros: true,
						} ),
						excludeTaxStringAbbreviation: excludeTaxStringAbbreviation,
					},
					components: {
						span: <span className="purchase-item__date" />,
						abbr: <abbr title={ excludeTaxStringTitle } />,
					},
				}
			);
		}

		const expiryClass =
			expiry < moment().add( 7, 'days' ) ? 'purchase-item__is-error' : 'purchase-item__is-warning';

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
				<TrackImpression warning="purchase-expiring" />
			</span>
		);
	}

	if ( isRenewingBeforeExpiration( purchase ) && purchase.renewDate ) {
		const renewDate = moment( purchase.renewDate );

		if ( creditCardHasAlreadyExpired( purchase ) ) {
			return (
				<span className="purchase-item__is-error">
					{ translate( 'Credit card expired' ) }
					<TrackImpression warning="credit-card-expiring" />
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
					<TrackImpression warning="credit-card-expiring" />
				</span>
			);
		}

		// When a downgrade is scheduled for the next renewal, the plan won't simply
		// renew at its current price — it changes to a lower-tier plan. Say so instead
		// of the usual "Renews ... on <date>" line.
		if ( purchase.isDelayedDowngradePending ) {
			const targetPlanName = purchase.delayedDowngradeToProductSlug
				? getPlan( purchase.delayedDowngradeToProductSlug )?.getTitle()
				: null;
			if ( targetPlanName ) {
				return translate( 'Changing to %(plan)s on {{span}}%(date)s{{/span}}', {
					args: {
						plan: targetPlanName,
						date: renewDate.format( 'LL' ),
					},
					components: {
						span: <span className="purchase-item__date" />,
					},
				} );
			}
			return translate( 'Changing plan on {{span}}%(date)s{{/span}}', {
				args: {
					date: renewDate.format( 'LL' ),
				},
				components: {
					span: <span className="purchase-item__date" />,
				},
			} );
		}

		if ( purchase.billPeriodDays ) {
			const translateOptions = {
				args: {
					amount: formatCurrency( purchase.priceInteger, purchase.currencyCode, {
						isSmallestUnit: true,
						stripZeros: true,
					} ),
					excludeTaxStringAbbreviation: excludeTaxStringAbbreviation,
					date: renewDate.format( 'LL' ),
				},
				components: {
					abbr: <abbr title={ excludeTaxStringTitle } />,
					span: <span className="purchase-item__date" />,
				},
			};
			switch ( purchase.billPeriodDays ) {
				case PLAN_MONTHLY_PERIOD:
					return translate(
						'Renews monthly at %(amount)s {{abbr}}%(excludeTaxStringAbbreviation)s{{/abbr}} on {{span}}%(date)s{{/span}}',
						translateOptions
					);
				case PLAN_ANNUAL_PERIOD:
					return translate(
						'Renews yearly at %(amount)s {{abbr}}%(excludeTaxStringAbbreviation)s{{/abbr}} on {{span}}%(date)s{{/span}}',
						translateOptions
					);
				case PLAN_BIENNIAL_PERIOD:
					return translate(
						'Renews every two years at %(amount)s {{abbr}}%(excludeTaxStringAbbreviation)s{{/abbr}} on {{span}}%(date)s{{/span}}',
						translateOptions
					);
				case PLAN_TRIENNIAL_PERIOD:
					return translate(
						'Renews every three years at %(amount)s {{abbr}}%(excludeTaxStringAbbreviation)s{{/abbr}} on {{span}}%(date)s{{/span}}',
						translateOptions
					);
			}
		}

		return translate(
			'Renews at %(amount)s {{abbr}}%(excludeTaxStringAbbreviation)s{{/abbr}} on {{span}}%(date)s{{/span}}',
			{
				args: {
					amount: formatCurrency( purchase.priceInteger, purchase.currencyCode, {
						isSmallestUnit: true,
						stripZeros: true,
					} ),
					excludeTaxStringAbbreviation: excludeTaxStringAbbreviation,
					date: renewDate.format( 'LL' ),
				},
				components: {
					abbr: <abbr title={ excludeTaxStringTitle } />,
					span: <span className="purchase-item__date" />,
				},
			}
		);
	}

	if ( isExpiring( purchase ) && ! isAkismetFreeProduct( purchase ) ) {
		const copy = getExpiringSoonCopy( expiry.toDate() );

		if ( ! copy ) {
			return translate( 'Expires on {{span}}%s{{/span}}', {
				args: expiry.format( 'LL' ),
				components: {
					span: <span className="purchase-item__date" />,
				},
			} );
		}

		// Only reached where the day-count copy has no translation yet. Delete
		// this and the prop it is passed to once it does; see `getExpiringSoonCopy`.
		const untranslatedFallbackText = translate(
			'Expires %(timeUntilExpiry)s on {{span}}%(date)s{{/span}}',
			{
				args: {
					timeUntilExpiry: getRelativeDayString( expiry.toDate(), 'upcoming' ),
					date: expiry.format( 'LL' ),
				},
				components: {
					span: <span className="purchase-item__date" />,
				},
			}
		);

		return (
			<UrgentExpiryStatus
				purchase={ purchase }
				copy={ copy }
				hasExpired={ false }
				untranslatedFallbackText={ untranslatedFallbackText }
				isDisconnectedSite={ isDisconnectedSite }
				impression={ <TrackImpression warning="purchase-expiring" /> }
			/>
		);
	}

	if ( isExpiredOrRemoved( purchase ) ) {
		if ( isConciergeSession( purchase ) ) {
			return translate( 'Session used on %s', {
				args: expiry.format( 'LL' ),
			} );
		}

		return (
			<UrgentExpiryStatus
				purchase={ purchase }
				copy={ getExpiredCopy( expiry.toDate() ) }
				hasExpired
				isDisconnectedSite={ isDisconnectedSite }
				impression={ <TrackImpression warning="purchase-expired" /> }
			/>
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

export function PurchaseItemPaymentMethod( {
	purchase,
	translate,
	isDisconnectedSite,
}: {
	purchase: Purchases.Purchase;
	translate: LocalizeProps[ 'translate' ];
	isDisconnectedSite?: boolean;
} ) {
	if ( isRemoved( purchase ) ) {
		return null;
	}

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

	const goToAddPaymentMethod = (
		e: React.MouseEvent< HTMLButtonElement >,
		siteSlug: string | number,
		purchaseId: number
	) => {
		e.preventDefault();
		e.stopPropagation();

		if ( isJetpackCloud() ) {
			window.open(
				`https://wordpress.com/me/purchases/${ siteSlug }/${ purchaseId }/payment-method/add`
			);
		} else {
			page( `/me/purchases/${ siteSlug }/${ purchaseId }/payment-method/add` );
		}
	};

	if (
		purchase.isAutoRenewEnabled &&
		( ! hasPaymentMethod( purchase ) || isPaidWithCredits( purchase ) ) &&
		! isExpiredWithNoAutoRenewAttemptsLeft( purchase ) &&
		! isPartnerPurchase( purchase ) &&
		! isAkismetFreeProduct( purchase )
	) {
		return (
			<div className="purchase-item__no-payment-method">
				{ ! isDisconnectedSite && (
					<Button
						variant="link"
						size="compact"
						onClick={ ( e: React.MouseEvent< HTMLButtonElement > ) =>
							goToAddPaymentMethod( e, purchase.siteId, purchase.id )
						}
					>
						{ translate( 'Add payment method' ) }
					</Button>
				) }
			</div>
		);
	}

	if (
		! isAkismetFreeProduct( purchase ) &&
		! isRechargeable( purchase ) &&
		hasPaymentMethod( purchase ) && // why does it check for payment method type but shows missing method?
		purchase.isAutoRenewEnabled
	) {
		return (
			<div className="purchase-item__no-payment-method">
				<Icon icon={ warningIcon } />
				<span>{ translate( 'You don’t have a payment method to renew this subscription' ) }</span>
			</div>
		);
	}

	if ( mightStillAutoRenew( purchase ) ) {
		if ( purchase.payment.type === 'credit_card' && purchase.payment.creditCard ) {
			const paymentMethodType = purchase.payment.creditCard.displayBrand
				? purchase.payment.creditCard.displayBrand
				: purchase.payment.creditCard.type || purchase.payment.paymentPartner || '';

			return (
				<>
					<img
						src={ getPaymentMethodImageURL( paymentMethodType ) }
						alt={ paymentMethodType }
						className="purchase-item__payment-method-card"
					/>
					{ purchase.payment.creditCard.number }
				</>
			);
		}

		if ( purchase.payment.type === 'paypal' ) {
			return (
				<img src={ payPalImage } alt={ purchase.payment.type } className="purchase-item__paypal" />
			);
		}

		if ( purchase.payment.type === 'upi' ) {
			return <img src={ upiImage } alt={ purchase.payment.type } />;
		}

		return null;
	}
}

export function BackupPaymentMethodNotice() {
	const translate = useTranslate();
	const noticeText = translate(
		'If the renewal fails, a {{link}}backup payment method{{/link}} may be used.',
		{
			components: {
				link: (
					<a
						href={
							isJetpackCloud()
								? 'https://wordpress.com/me/purchases/payment-methods'
								: '/me/purchases/payment-methods'
						}
					/>
				),
			},
		}
	);
	return (
		<span className="purchase-item__backup-payment-method-notice">
			<InfoPopover position="bottom">{ noticeText }</InfoPopover>
		</span>
	);
}

class PurchaseItem extends Component<
	PurchaseItemPropsPlaceholder | ( PurchaseItemProps & PurchaseItemPropsConnected )
> {
	renderPurchaseItemContent = () => {
		if ( this.props.isPlaceholder ) {
			return null;
		}

		const {
			purchase,
			site,
			translate,
			slug,
			showSite,
			iconUrl,
			isBackupMethodAvailable,
			moment,
			isDisconnectedSite,
			transferredOwnershipPurchases = [],
		} = this.props;

		const isOwnershipTransferred = isTransferredOwnership(
			purchase.id,
			transferredOwnershipPurchases
		);

		return (
			<div className="purchase-item__wrapper purchases-layout__wrapper">
				{ showSite && (
					<div className="purchase-item__site purchases-layout__site">
						<PurchaseItemSiteIcon
							site={ site }
							isDisconnectedSite={ isDisconnectedSite }
							purchase={ purchase }
							iconUrl={ iconUrl }
						/>
					</div>
				) }
				<div className="purchase-item__information purchases-layout__information">
					<div className="purchase-item__title">
						{ getDisplayName( purchase ) }
						&nbsp;
						<OwnerInfo purchase={ purchase } isTransferredOwnership={ isOwnershipTransferred } />
					</div>

					<div className="purchase-item__purchase-type">
						<PurchaseItemProduct
							purchase={ purchase }
							site={ site }
							translate={ translate }
							slug={ slug }
							showSite={ showSite }
							isDisconnectedSite={ isDisconnectedSite }
						/>
					</div>
				</div>

				<div className="purchase-item__status purchases-layout__status">
					<PurchaseItemStatus
						purchase={ purchase }
						translate={ translate }
						moment={ moment }
						isDisconnectedSite={ isDisconnectedSite }
					/>
				</div>

				<div className="purchase-item__payment-method purchases-layout__payment-method">
					<PurchaseItemPaymentMethod
						purchase={ purchase }
						translate={ translate }
						isDisconnectedSite={ isDisconnectedSite }
					/>
					{ isBackupMethodAvailable && mightStillAutoRenew( purchase ) && (
						<BackupPaymentMethodNotice />
					) }
				</div>
			</div>
		);
	};

	render() {
		if ( this.props.isPlaceholder ) {
			return (
				<>
					<CompactCard className="purchase-item__placeholder-wrapper purchases-list-header" />
					<CompactCard>
						<div className="purchase-item__placeholder" />
					</CompactCard>
				</>
			);
		}

		const {
			isDisconnectedSite,
			getManagePurchaseUrlFor,
			purchase,
			slug,
			transferredOwnershipPurchases = [],
		} = this.props;

		const classes = clsx( 'purchase-item', {
			'purchase-item--disconnected': isDisconnectedSite,
		} );

		const isOwnershipTransferred = isTransferredOwnership(
			purchase.id,
			transferredOwnershipPurchases
		);

		let onClick;
		let href;

		if ( getManagePurchaseUrlFor && slug && ! isOwnershipTransferred ) {
			// A "disconnected" Jetpack site's purchases may be managed.
			// A "disconnected" WordPress.com site may *NOT* be managed (the user has been removed), unless it is a
			// WPCOM generated temporary site, which is created during the siteless checkout flow. (currently Jetpack & Akismet can have siteless purchases).
			if (
				! isDisconnectedSite ||
				purchase.isJetpackPlanOrProduct ||
				purchase.isAttachedToHoldingSite ||
				isA4ABillingDragonPurchase( purchase )
			) {
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

export default connect(
	( state: AppState, ownProps: PurchaseItemPropsPlaceholder | PurchaseItemProps ) => {
		if ( ownProps.isPlaceholder ) {
			return {};
		}

		const stateSite = getSite( state, ownProps.site?.ID );

		if ( ! stateSite ) {
			return {
				iconUrl: ownProps.site?.icon?.img,
			};
		}

		return {
			iconUrl: getSiteIconUrl( state, stateSite.ID ),
		};
	}
)( localize( withLocalizedMoment( PurchaseItem ) ) );
