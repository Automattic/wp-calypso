import config from '@automattic/calypso-config';
import {
	isAkismetFreeProduct,
	isDomainTransfer,
	isJetpackPlan,
	isJetpackProduct,
	JETPACK_LEGACY_PLANS,
	is100Year,
} from '@automattic/calypso-products';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import InfoPopover from 'calypso/components/info-popover';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { ResponseDomain } from 'calypso/lib/domains/types';
import {
	hasPaymentMethod,
	isRechargeable,
	isCloseToExpiration,
	isRenewable,
	isExpired,
} from 'calypso/lib/purchases';
import { isAkismetTemporarySitePurchase } from 'calypso/me/purchases/utils';
import { useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getAllDomains } from 'calypso/state/sites/domains/selectors';
import AutoRenewToggle from './auto-renew-toggle';
import type { SiteDetails } from '@automattic/data-stores';
import type {
	Purchase,
	GetChangePaymentMethodUrlFor,
	RenderRenewsOrExpiresOn,
	RenderRenewsOrExpiresOnLabel,
	GetManagePurchaseUrlFor,
} from 'calypso/lib/purchases/types';

interface ExpirationProps {
	purchase: Purchase;
	site?: SiteDetails;
	siteSlug?: string;
	getChangePaymentMethodUrlFor: GetChangePaymentMethodUrlFor;
	getManagePurchaseUrlFor: GetManagePurchaseUrlFor;
	renderRenewsOrExpiresOn: RenderRenewsOrExpiresOn;
	renderRenewsOrExpiresOnLabel: RenderRenewsOrExpiresOnLabel;
}

function PurchaseMetaExpiration( {
	purchase,
	site,
	siteSlug,
	getChangePaymentMethodUrlFor,
	getManagePurchaseUrlFor,
	renderRenewsOrExpiresOn,
	renderRenewsOrExpiresOnLabel,
}: ExpirationProps ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const isProductOwner = purchase?.userId === useSelector( getCurrentUserId );
	const isJetpackPurchase = isJetpackPlan( purchase ) || isJetpackProduct( purchase );
	const isCancellableSitelessPurchase = isAkismetTemporarySitePurchase( purchase );
	const isAutorenewalEnabled = purchase?.isAutoRenewEnabled ?? false;
	const isJetpackPurchaseUsingPrimaryCancellationFlow =
		isJetpackPurchase && config.isEnabled( 'jetpack/cancel-through-main-flow' );

	const allDomains = useSelector( getAllDomains );
	const domainDetails = allDomains?.[ purchase.siteId ]?.find(
		( domain: ResponseDomain ) => domain.domain === purchase.meta
	);

	if (
		! purchase ||
		isDomainTransfer( purchase ) ||
		purchase?.isInAppPurchase ||
		isAkismetFreeProduct( purchase )
	) {
		return null;
	}

	const hideAutoRenew =
		( JETPACK_LEGACY_PLANS.some( ( plan ) => plan === purchase.productSlug ) &&
			! isRenewable( purchase ) ) ||
		is100Year( purchase );

	if ( isRenewable( purchase ) && ! isExpired( purchase ) ) {
		const dateSpan = <span className="manage-purchase__detail-date-span" />;
		// If a jetpack site has been disconnected, the "site" prop will be null here.
		const shouldRenderToggle = ( isCancellableSitelessPurchase || site ) && isProductOwner;

		const autoRenewToggle = shouldRenderToggle ? (
			<AutoRenewToggle
				planName={ site && ! isCancellableSitelessPurchase ? site.plan?.product_name_short : '' }
				siteDomain={ site && ! isCancellableSitelessPurchase ? site.domain : '' }
				siteSlug={ site && ! isCancellableSitelessPurchase ? site.slug : '' }
				purchase={ purchase }
				toggleSource="manage-purchase"
				showLink
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

		if ( is100Year( purchase ) ) {
			subsBillingText = moment( purchase.expiryDate ).format( 'LL' );
		}
		const shouldShowTooltip = () => {
			if ( ! purchase.expiryDate || ! purchase.renewDate || is100Year( purchase ) ) {
				return false;
			}

			if (
				purchase.renewDate !== purchase.expiryDate &&
				( purchase.expiryStatus === 'active' || purchase.expiryStatus === 'auto-renewing' )
			) {
				return true;
			}

			return false;
		};

		const detailLabel = is100Year( purchase )
			? translate( 'Paid until' )
			: translate( 'Subscription Renewal' );

		return (
			<li className="manage-purchase__meta-expiration">
				<em className="manage-purchase__detail-label">{ detailLabel }</em>
				{ ! hideAutoRenew && ! isJetpackPurchaseUsingPrimaryCancellationFlow && (
					<div className="manage-purchase__auto-renew">
						<span className="manage-purchase__detail manage-purchase__auto-renew-text">
							{ subsRenewText }
						</span>
					</div>
				) }
				<span
					className={ clsx( 'manage-purchase__detail', {
						'is-expiring': isCloseToExpiration( purchase ),
					} ) }
				>
					{ subsBillingText }
					{ shouldShowTooltip() && (
						<InfoPopover position="bottom right">
							{ translate(
								'Your subscription is paid through {{dateSpan}}%(expireDate)s{{/dateSpan}}, but will be renewed prior to that date. {{inlineSupportLink}}Learn more{{/inlineSupportLink}}',
								{
									args: {
										expireDate: moment( purchase.expiryDate ).format( 'LL' ),
									},
									components: {
										dateSpan,
										inlineSupportLink: (
											<InlineSupportLink supportContext="autorenewal" showIcon={ false } />
										),
									},
								}
							) }
						</InfoPopover>
					) }
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
				{ renderRenewsOrExpiresOnLabel( { purchase, domainDetails, translate } ) }
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
