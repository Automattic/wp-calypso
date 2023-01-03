import config from '@automattic/calypso-config';
import {
	isDomainTransfer,
	isJetpackPlan,
	isJetpackProduct,
	JETPACK_LEGACY_PLANS,
} from '@automattic/calypso-products';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import {
	hasPaymentMethod,
	isExpired,
	isRechargeable,
	isCloseToExpiration,
	isRenewable,
} from 'calypso/lib/purchases';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import AutoRenewToggle from './auto-renew-toggle';

function renderRenewsOrExpiresOnLabel( { purchase, translate } ) {
	if ( isExpiring( purchase ) ) {
		if ( isDomainRegistration( purchase ) ) {
			return translate( 'Domain expires on' );
		}

		if ( isSubscription( purchase ) ) {
			return translate( 'Subscription expires on' );
		}

		if ( isOneTimePurchase( purchase ) ) {
			return translate( 'Expires on' );
		}
	}

	if ( isExpired( purchase ) ) {
		if ( isDomainRegistration( purchase ) ) {
			return translate( 'Domain expired on' );
		}

		if ( isConciergeSession( purchase ) ) {
			return translate( 'Session used on' );
		}

		if ( isSubscription( purchase ) ) {
			return translate( 'Subscription expired on' );
		}

		if ( isOneTimePurchase( purchase ) ) {
			return translate( 'Expired on' );
		}
	}

	if ( isDomainRegistration( purchase ) ) {
		return translate( 'Domain renews on' );
	}

	if ( isSubscription( purchase ) ) {
		return translate( 'Subscription renews on' );
	}

	if ( isOneTimePurchase( purchase ) ) {
		return translate( 'Renews on' );
	}

	return null;
}

function renderRenewsOrExpiresOn( {
	moment,
	purchase,
	siteSlug,
	translate,
	getManagePurchaseUrlFor,
} ) {
	if ( isIncludedWithPlan( purchase ) ) {
		const attachedPlanUrl = getManagePurchaseUrlFor( siteSlug, purchase.attachedToPurchaseId );

		return (
			<span>
				<a href={ attachedPlanUrl }>{ translate( 'Renews with Plan' ) }</a>
			</span>
		);
	}

	if ( isExpiring( purchase ) || isExpired( purchase ) ) {
		return moment( purchase.expiryDate ).format( 'LL' );
	}

	if ( isRenewing( purchase ) ) {
		return moment( purchase.renewDate ).format( 'LL' );
	}

	if ( isOneTimePurchase( purchase ) ) {
		return translate( 'Never Expires' );
	}
}

function PurchaseMetaExpiration( {
	purchase,
	site,
	siteSlug,
	getChangePaymentMethodUrlFor,
	getManagePurchaseUrlFor,
} ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const isProductOwner = purchase?.userId === useSelector( getCurrentUserId );
	const isJetpackPurchase = isJetpackPlan( purchase ) || isJetpackProduct( purchase );
	const isAutorenewalEnabled = purchase?.isAutoRenewEnabled ?? false;
	const isJetpackPurchaseUsingPrimaryCancellationFlow =
		isJetpackPurchase && config.isEnabled( 'jetpack/cancel-through-main-flow' );
	const hideAutoRenew =
		purchase && JETPACK_LEGACY_PLANS.includes( purchase.productSlug ) && ! isRenewable( purchase );

	if ( ! purchase || isDomainTransfer( purchase ) || purchase?.isInAppPurchase ) {
		return null;
	}

	if ( isRenewable( purchase ) && ! isExpired( purchase ) ) {
		const dateSpan = <span className="manage-purchase__detail-date-span" />;
		// If a jetpack site has been disconnected, the "site" prop will be null here.
		const shouldRenderToggle = site && isProductOwner;
		const autoRenewToggle = shouldRenderToggle ? (
			<AutoRenewToggle
				planName={ site.plan.product_name_short }
				siteDomain={ site.domain }
				siteSlug={ site.slug }
				purchase={ purchase }
				toggleSource="manage-purchase"
				showLink={ true }
				getChangePaymentMethodUrlFor={ getChangePaymentMethodUrlFor }
			/>
		) : (
			<span />
		);
		const subsRenewText = isAutorenewalEnabled
			? translate( 'Auto-renew is {{autoRenewToggle}}ON{{/autoRenewToggle}}', {
					components: {
						autoRenewToggle,
					},
			  } )
			: translate( 'Auto-renew is {{autoRenewToggle}}OFF{{/autoRenewToggle}}', {
					components: {
						autoRenewToggle,
					},
			  } );

		const subsReEnableText = translate(
			'{{autoRenewToggle}}Re-activate subscription{{/autoRenewToggle}}',
			{
				components: {
					autoRenewToggle,
				},
			}
		);

		let subsBillingText;
		if (
			isAutorenewalEnabled &&
			! hideAutoRenew &&
			hasPaymentMethod( purchase ) &&
			isRechargeable( purchase )
		) {
			subsBillingText = translate( 'You will be billed on {{dateSpan}}%(renewDate)s{{/dateSpan}}', {
				args: {
					renewDate: purchase.renewDate && moment( purchase.renewDate ).format( 'LL' ),
				},
				components: {
					dateSpan,
				},
			} );
		} else {
			subsBillingText = translate( 'Expires on {{dateSpan}}%(expireDate)s{{/dateSpan}}', {
				args: {
					expireDate: moment( purchase.expiryDate ).format( 'LL' ),
				},
				components: {
					dateSpan,
				},
			} );
		}

		return (
			<li className="manage-purchase__meta-expiration">
				<em className="manage-purchase__detail-label">{ translate( 'Subscription Renewal' ) }</em>
				{ ! hideAutoRenew && ! isJetpackPurchaseUsingPrimaryCancellationFlow && (
					<div className="manage-purchase__auto-renew">
						<span className="manage-purchase__detail manage-purchase__auto-renew-text">
							{ subsRenewText }
						</span>
					</div>
				) }
				<span
					className={ classNames( 'manage-purchase__detail', {
						'is-expiring': isCloseToExpiration( purchase ),
					} ) }
				>
					{ subsBillingText }
				</span>
				{ ! isAutorenewalEnabled &&
					! hideAutoRenew &&
					shouldRenderToggle &&
					isJetpackPurchaseUsingPrimaryCancellationFlow && (
						<div className="manage-purchase__auto-renew">
							<span className="manage-purchase__detail manage-purchase__auto-renew-text">
								{ subsReEnableText }
							</span>
						</div>
					) }
			</li>
		);
	}

	return (
		<li>
			<em className="manage-purchase__detail-label">
				{ renderRenewsOrExpiresOnLabel( { purchase, translate } ) }
			</em>
			<span className="manage-purchase__detail">
				{ renderRenewsOrExpiresOn( {
					moment,
					purchase,
					siteSlug,
					translate,
					getManagePurchaseUrlFor,
				} ) }
			</span>
		</li>
	);
}

export default PurchaseMetaExpiration;
