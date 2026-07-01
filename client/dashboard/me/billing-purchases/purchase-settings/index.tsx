import {
	DomainProductSlugs,
	useMyDomainInputMode,
	WPCOM_DIFM_LITE,
	OFFSITE_REDIRECT,
	DomainTransferStatus,
	SubscriptionBillPeriod,
} from '@automattic/api-core';
import {
	domainQuery,
	purchaseCancelFeaturesQuery,
	purchaseQuery,
	userPurchaseSetAutoRenewQuery,
	siteDifmWebsiteContentQuery,
	siteJetpackKeysQuery,
	reinstallMarketplacePluginsQuery,
	siteBySlugQuery,
} from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { domainManagementEdit, domainUseMyDomain } from '@automattic/domains-table/src/utils/paths';
import { formatCurrency } from '@automattic/number-formatters';
import { INCOMING_DOMAIN_TRANSFER_STATUSES_IN_PROGRESS } from '@automattic/urls';
import { useQuery, useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import {
	__experimentalGrid as Grid,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	DropdownMenu,
	MenuGroup,
	MenuItem,
	Button,
	ToggleControl,
	Notice,
	ExternalLink,
	Icon,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { DataForm } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, _n, _x, sprintf } from '@wordpress/i18n';
import {
	moreVertical,
	calendar,
	currencyDollar,
	commentAuthorAvatar,
	layout,
	info,
	check,
} from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { useAnalytics } from '../../../app/analytics';
import { useAuth } from '../../../app/auth';
import Breadcrumbs from '../../../app/breadcrumbs';
import { useLocale } from '../../../app/locale';
import { domainRoute } from '../../../app/router/domains';
import { emailsRoute } from '../../../app/router/emails';
import {
	cancelPurchaseRoute,
	changePaymentMethodRoute,
	purchaseSettingsRoute,
} from '../../../app/router/me';
import { getCurrentDashboard } from '../../../app/routing';
import { ActionList } from '../../../components/action-list';
import { Card, CardBody } from '../../../components/card';
import ClipboardInputControl from '../../../components/clipboard-input-control';
import { useFormattedTime } from '../../../components/formatted-time';
import { MetadataList, MetadataItem } from '../../../components/metadata-list';
import OverviewCard from '../../../components/overview-card';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import SiteIcon from '../../../components/site-icon';
import SiteBandwidthStat from '../../../sites/overview-plan-card/site-bandwidth-stat';
import SiteStorageStat from '../../../sites/overview-plan-card/site-storage-stat';
import { formatDate } from '../../../utils/datetime';
import { redirectToDashboardLink, wpcomLink } from '../../../utils/link';
import {
	getBillPeriodLabel,
	getTitleForDisplay,
	getSubtitleForDisplay,
	isExpiring,
	isExpired,
	isRenewing,
	isIncludedWithPlan,
	isOneTimePurchase,
	isMarketplaceHoldingSitePurchase,
	isMarketplacePlugin,
	isAkismetProduct,
	isJetpackCrmProduct,
	isTitanMail,
	isGoogleWorkspace,
	isDomainTransfer,
	isDotcomPlan,
	getRenewalUrlFromPurchase,
	isJetpackT1SecurityPlan,
	isWpcomFlexSubscription,
	isAkismetFreeProduct,
	isInExpirationGracePeriod,
	isWithinRefundWindowDowngradeEligible,
	isA4ABillingDragonPurchase,
	isCentennialPurchase,
	hasAmountAvailableToRefund,
} from '../../../utils/purchase';
import {
	getChangedPlanRedirectUrl,
	getSitePurchaseUpgradeUrl,
	getUpgradedPurchaseRedirectUrl,
} from '../../../utils/site-url';
import BillingFlexUsageCard from '../../billing-flex-usage';
import { useIsSplitCancelRemoveEnabled } from '../cancel-purchase/use-is-split-cancel-remove-enabled';
import { PurchasePaymentMethod } from '../purchase-payment-method';
import AkismetApiKeyCard from './akismet-api-key-card';
import { classifyPurchaseForCopy } from './classify-purchase-for-copy';
import {
	AddMailboxesActionItem,
	EmailPlanMailboxCard,
	EmailPlanPriceCard,
	isEmailPlanManagementEnabled,
} from './email-plan';
import { getCancelButtonCopy, getRemoveButtonCopy } from './get-cancel-remove-copy';
import JetpackLicenseKeyCard from './jetpack-license-key-card';
import { PurchaseNotice } from './purchase-notice';
import type { User, Purchase, Site, CancellationFeature } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

import './style.scss';

const SPACING = {
	DEFAULT: 6,
	SMALL: 4,
};

function renewPurchase( purchase: Purchase ): void {
	window.location.href = getRenewalUrlFromPurchase( purchase );
}

function getExpiredNewPlanUrl( purchase: Purchase ): string {
	if ( purchase.is_jetpack_backup_t1 || isJetpackT1SecurityPlan( purchase ) ) {
		return wpcomLink( `/plans/storage/${ purchase.site_slug }` );
	}

	if ( purchase.is_jetpack_plan_or_product ) {
		return wpcomLink( `/plans/${ purchase.site_slug }` );
	}

	if ( purchase.is_plan ) {
		return getWpcomPlanGridUrl( purchase );
	}

	return wpcomLink( `/plans/${ purchase.site_slug }` );
}

// Map the purchase's billing term to the plans grid's `intervalType` param so the
// grid opens on the same term as the current plan. Downgrades only work within the
// same term, and the grid hides the term selector in the downgrade flow.
function getPlanGridIntervalType( purchase: Purchase ): string | undefined {
	switch ( purchase.bill_period_days ) {
		case SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD:
			return 'monthly';
		case SubscriptionBillPeriod.PLAN_ANNUAL_PERIOD:
			return 'yearly';
		case SubscriptionBillPeriod.PLAN_BIENNIAL_PERIOD:
			return '2yearly';
		case SubscriptionBillPeriod.PLAN_TRIENNIAL_PERIOD:
			return '3yearly';
		default:
			return undefined;
	}
}

function getWpcomPlanGridUrl( purchase: Purchase ): string {
	const backUrl = redirectToDashboardLink();
	const siteSlug = purchase.site_slug;
	const intervalType = getPlanGridIntervalType( purchase );
	return addQueryArgs( wpcomLink( '/setup/plan-upgrade' ), {
		...( siteSlug && { siteSlug } ),
		...( intervalType && { intervalType } ),
		cancel_to: backUrl,
		dashboard: getCurrentDashboard(),
		redirect_to: getChangedPlanRedirectUrl(),
		allow_downgrade: 'true',
	} );
}

function isAutoRenewToggleDisabled(
	purchase: Purchase,
	user: User,
	isSplitCancelRemoveEnabled: boolean
): boolean {
	if ( String( user.ID ) !== String( purchase.user_id ) ) {
		return true;
	}
	if ( isExpired( purchase ) && shouldAllowExpiredAutoRenewToggle( purchase ) ) {
		// Special case!
		return false;
	}
	// Under the split-cancel-remove experiment, keep the toggle active in both
	// directions — matches legacy Calypso. The server's `can_disable_auto_renew`
	// and `can_reenable_auto_renewal` go false during pending-renewal retries,
	// but the actual disable/re-enable endpoints accept the call (verified in
	// wpcom-billing backend trace). Off-experiment we preserve trunk's behavior of
	// trusting the server flags.
	if ( ! isSplitCancelRemoveEnabled ) {
		if ( purchase.is_auto_renew_enabled && ! purchase.can_disable_auto_renew ) {
			return true;
		}
		if ( ! purchase.is_auto_renew_enabled && ! purchase.can_reenable_auto_renewal ) {
			return true;
		}
	}
	return false;
}

/**
 * Sometimes the auto-renew toggle will read "Re-activate subscription" in
 * which case we should allow toggling it even if the subscription has expired.
 */
function shouldAllowExpiredAutoRenewToggle( purchase: Purchase ): boolean {
	if ( ! purchase.is_auto_renew_enabled ) {
		return false;
	}
	if ( ! purchase.is_jetpack_plan_or_product ) {
		return false;
	}
	if ( purchase.is_renewable ) {
		return true;
	}
	if ( ! purchase.is_jetpack_plan_or_product ) {
		return true;
	}
	return false;
}

function upgradePurchase( upgradeUrl: string ): void {
	window.location.href = upgradeUrl;
}

function ProductLink( { purchase }: { purchase: Purchase } ) {
	if (
		( purchase.is_domain || purchase.product_slug === OFFSITE_REDIRECT ) &&
		purchase.site_slug &&
		purchase.meta
	) {
		const text = __( 'Domain settings' );
		return (
			<MetadataItem>
				<Link to={ domainRoute.to } params={ { domainName: purchase.meta } }>
					{ text }
				</Link>
			</MetadataItem>
		);
	}

	if ( isGoogleWorkspace( purchase ) || isTitanMail( purchase ) ) {
		const text = __( 'Email settings' );
		return (
			<MetadataItem>
				<Link to={ emailsRoute.to }>{ text }</Link>
			</MetadataItem>
		);
	}

	return null;
}

function PurchaseActionMenu( { purchase }: { purchase: Purchase } ) {
	const { user } = useAuth();
	const isOwner = String( user.ID ) === String( purchase.user_id );
	const canBeRenewed = purchase.can_explicit_renew && isOwner;
	const upgradeUrl = getSitePurchaseUpgradeUrl( purchase, getUpgradedPurchaseRedirectUrl() );
	const { recordTracksEvent } = useAnalytics();
	const menuItems = [
		canUpgradePurchase( purchase ) && upgradeUrl && isOwner && (
			<MenuItem
				onClick={ () => {
					recordTracksEvent( 'calypso_purchases_upgrade_plan', {
						status: isExpired( purchase ) ? 'expired' : 'active',
						plan: purchase.product_name,
					} );
					upgradePurchase( upgradeUrl );
				} }
			>
				{ _x( 'Upgrade', 'Change to a plan with more features.' ) }
			</MenuItem>
		),
		canBeRenewed && (
			<MenuItem
				onClick={ () => {
					recordTracksEvent( 'calypso_purchases_renew_now_click', {
						product_slug: purchase.product_slug,
					} );
					renewPurchase( purchase );
				} }
			>
				{ _x(
					'Renew',
					'Immediately pay for and receive another term of the subscription, extending the expiration date by another term.'
				) }
			</MenuItem>
		),
	].filter( Boolean );

	if ( menuItems.length === 0 ) {
		return null;
	}

	return (
		<DropdownMenu icon={ moreVertical } label={ __( 'Quick actions' ) }>
			{ () => <MenuGroup>{ menuItems }</MenuGroup> }
		</DropdownMenu>
	);
}

function CancelOrRemoveActionButton( { purchase }: { purchase: Purchase } ) {
	const { user } = useAuth();
	const navigate = useNavigate();
	const locale = useLocale();
	const isSplitEnabled = useIsSplitCancelRemoveEnabled();

	if ( String( user.ID ) !== String( purchase.user_id ) ) {
		return null;
	}

	// WordAds and non-primary domain warnings are shown inline on the confirmation screen
	// under purchases/split-cancel-remove (see cancellation-main-content.tsx).
	// FIXME: render "Domain transfers can take anywhere from five to seven days to complete." next to cancel button (see domainTransferDuration)

	const goToCancel = ( intent?: 'cancel' | 'remove' ) =>
		navigate( {
			to: cancelPurchaseRoute.fullPath,
			params: { purchaseId: purchase.ID },
			...( intent ? { search: { intent } } : {} ),
		} );

	if ( isSplitEnabled ) {
		const hasRefund = hasAmountAvailableToRefund( purchase );
		const autoRenewOn = purchase.is_auto_renew_enabled;
		// Domain transfer gate: non-refundable transfers can't be cancelled without
		// support intervention (preserves legacy behavior on classic; adds it to
		// dashboard). Remove button is unaffected — a completed transfer with
		// auto-renew off can still be removed below.
		const isTransferNonRefundable = isDomainTransfer( purchase ) && ! hasRefund;
		// Visibility is driven purely by what the user controls:
		// - Cancel: auto-renew is on (stopping it halts any upcoming retry too).
		// - Remove: auto-renew is already off (cancelled subscriptions awaiting
		//   removal, expired-grace, etc.).
		// When a refund is available with auto-renew still on, the refund path is
		// surfaced inside the cancel flow via RefundEligibilityNotice instead of
		// a second CTA here.
		// Verified against wpcom-billing backend — cancel / disable-auto-renew /
		// delete endpoints all accept the call in pending-renewal state, so we
		// don't need to special-case it.
		const showCancel = autoRenewOn && ! isTransferNonRefundable;
		const showRemove = ! autoRenewOn;

		if ( ! showCancel && ! showRemove ) {
			return null;
		}

		// Use non-breaking spaces in the date so it doesn't wrap mid-date
		// (e.g. "April\n16, 2027") in narrow viewports.
		const expiryDateFormatted = purchase.expiry_date
			? formatDate( new Date( purchase.expiry_date ), locale, {
					dateStyle: 'long',
			  } ).replace( / /g, '\u00A0' )
			: '';

		const category = classifyPurchaseForCopy( purchase );
		const cancelCopy = showCancel
			? getCancelButtonCopy( {
					category,
					productName: purchase.product_name,
					expiryDateFormatted,
			  } )
			: null;
		const removeCopy = showRemove
			? getRemoveButtonCopy( { category, productName: purchase.product_name, hasRefund } )
			: null;

		return (
			<>
				{ cancelCopy && (
					<ActionList.ActionItem
						title={ cancelCopy.label }
						description={ cancelCopy.description }
						actions={
							<Button
								variant="secondary"
								// When Remove is shown alongside Cancel, keep Cancel neutral so
								// the destructive emphasis goes to Remove only. When Cancel is
								// the lone destructive action, make it red.
								isDestructive={ ! showRemove }
								size="compact"
								onClick={ () => goToCancel( 'cancel' ) }
							>
								{ _x( 'Cancel', 'Stop the subscription from automatically charging and renewing' ) }
							</Button>
						}
					/>
				) }
				{ removeCopy && (
					<ActionList.ActionItem
						title={ removeCopy.label }
						description={ removeCopy.description }
						actions={
							<Button
								variant="secondary"
								isDestructive
								size="compact"
								onClick={ () => goToCancel( 'remove' ) }
							>
								{ _x(
									'Remove',
									'Remove the cancelled or expired subscription from the list of active purchases.'
								) }
							</Button>
						}
					/>
				) }
			</>
		);
	}

	if ( purchase.is_cancelable ) {
		return (
			<ActionList.ActionItem
				title={ __( 'Cancel subscription' ) }
				description={ __( 'We’ll be sorry to see you go!' ) }
				actions={
					<Button
						variant="secondary"
						isDestructive
						size="compact"
						onClick={ () =>
							navigate( {
								to: cancelPurchaseRoute.fullPath,
								params: { purchaseId: purchase.ID },
							} )
						}
					>
						{ _x( 'Cancel', 'Stop the subscription from automatically charging and renewing' ) }
					</Button>
				}
			/>
		);
	}
	if ( purchase.is_removable ) {
		return (
			<ActionList.ActionItem
				title={ __( 'Remove subscription' ) }
				description={ __( 'We’ll be sorry to see you go!' ) }
				actions={
					<Button
						variant="secondary"
						isDestructive
						size="compact"
						onClick={ () =>
							navigate( {
								to: cancelPurchaseRoute.fullPath,
								params: { purchaseId: purchase.ID },
							} )
						}
					>
						{ _x(
							'Remove',
							'Remove the cancelled or expired subscription from the list of active purchases.'
						) }
					</Button>
				}
			/>
		);
	}
	return null;
}

/**
 * Whether the "Change plan" action should be offered for this purchase. Covers
 * three downgrade flows, each gated by its own flag:
 *   - past expiry (downgrade-to-checkout) — `plans/expired-downgrade`
 *   - within refund window (instant downgrade) — `plans/expired-downgrade`
 *   - active downgradable plan (delayed downgrade) — `plans/delayed-downgrade`
 */
function shouldShowChangePlan( purchase: Purchase ): boolean {
	if ( ! purchase.is_plan || ! purchase.is_plan_type_downgradable ) {
		return false;
	}
	const expiredOrRefundDowngrade =
		config.isEnabled( 'plans/expired-downgrade' ) &&
		( purchase.is_past_expiry_date || isWithinRefundWindowDowngradeEligible( purchase ) );
	const delayedDowngrade = config.isEnabled( 'plans/delayed-downgrade' );
	return expiredOrRefundDowngrade || delayedDowngrade;
}

// Titan email upgrades route through the flag-gated tier grid; without the flag the
// upgrade URL would fall through to the wrong (site plan) page, so hide the action.
function canUpgradePurchase( purchase: Purchase ): boolean {
	if ( ! purchase.is_upgradable ) {
		return false;
	}
	if ( isTitanMail( purchase ) && ! config.isEnabled( 'emails/titan-tiers' ) ) {
		return false;
	}
	return true;
}

function UpgradeActionButton( { purchase }: { purchase: Purchase } ) {
	const { user } = useAuth();
	const { recordTracksEvent } = useAnalytics();
	if ( String( user.ID ) !== String( purchase.user_id ) ) {
		return null;
	}
	if ( ! canUpgradePurchase( purchase ) ) {
		return null;
	}
	// When "Change plan" is offered (downgrade-eligible), it supersedes the
	// upgrade action — matching the classic purchases page.
	if ( shouldShowChangePlan( purchase ) ) {
		return null;
	}
	const upgradeUrl = getSitePurchaseUpgradeUrl( purchase, getUpgradedPurchaseRedirectUrl() );
	if ( ! upgradeUrl ) {
		return null;
	}
	return (
		<ActionList.ActionItem
			title={ __( 'Upgrade subscription' ) }
			description={ __( 'Find the best fit for your needs.' ) }
			actions={
				<Button
					variant="secondary"
					size="compact"
					onClick={ () => {
						recordTracksEvent( 'calypso_purchases_upgrade_plan', {
							status: isExpired( purchase ) ? 'expired' : 'active',
							plan: purchase.product_name,
						} );
						upgradePurchase( upgradeUrl );
					} }
				>
					{ _x( 'Upgrade', 'Change to a plan with more features.' ) }
				</Button>
			}
		/>
	);
}

function ReSubscribeActionButton( { purchase }: { purchase: Purchase } ) {
	const { recordTracksEvent } = useAnalytics();
	if ( ! isExpired( purchase ) ) {
		return null;
	}
	return (
		<ActionList.ActionItem
			title={ purchase.is_plan ? __( 'Pick another plan' ) : __( 'Pick another product' ) }
			description={ __( 'Find the best fit for your needs.' ) }
			actions={
				<Button
					variant="secondary"
					size="compact"
					onClick={ () => {
						recordTracksEvent( 'calypso_purchases_upgrade_plan', {
							status: isExpired( purchase ) ? 'expired' : 'active',
							plan: purchase.product_name,
						} );
						window.location.href = getExpiredNewPlanUrl( purchase );
					} }
				>
					{ purchase.is_plan ? __( 'Pick another plan' ) : __( 'Pick another product' ) }
				</Button>
			}
		/>
	);
}

function RenewActionButton( { purchase }: { purchase: Purchase } ) {
	const { user } = useAuth();
	const canBeRenewed =
		purchase.can_explicit_renew && String( user.ID ) === String( purchase.user_id );
	const { recordTracksEvent } = useAnalytics();
	if ( ! canBeRenewed ) {
		return null;
	}

	return (
		<ActionList.ActionItem
			title={ __( 'Renew now' ) }
			description={ __( 'Renew your subscription manually.' ) }
			actions={
				<Button
					variant="secondary"
					size="compact"
					onClick={ () => {
						recordTracksEvent( 'calypso_purchases_renew_now_click', {
							product_slug: purchase.product_slug,
						} );
						renewPurchase( purchase );
					} }
				>
					{ _x(
						'Renew',
						'Immediately pay for and receive another term of the subscription, extending the expiration date by another term.'
					) }
				</Button>
			}
		/>
	);
}

function JetpackCRMDownloadsButton( { purchase }: { purchase: Purchase } ) {
	const { recordTracksEvent } = useAnalytics();

	// Only show for Jetpack CRM Products
	if ( ! isJetpackCrmProduct( purchase.product_slug ) ) {
		return null;
	}

	// We'll pass the purchase ID in the URL, and the CRM Downloads component will fetch the actual license key
	const path = wpcomLink( `/purchases/crm-downloads/${ purchase.ID }` );

	return (
		<ActionList.ActionItem
			title={ __( 'CRM Downloads' ) }
			actions={
				<Button
					variant="secondary"
					size="compact"
					onClick={ () => {
						recordTracksEvent( 'calypso_purchases_crm_downloads_click', {
							product_slug: purchase.product_slug,
						} );
						window.location.href = path;
					} }
				>
					{ __( 'CRM Downloads' ) }
				</Button>
			}
		/>
	);
}

function ReinstallButton( { purchase }: { purchase: Purchase } ) {
	const { mutate: reinstallPlugins, isPending: isMutationPending } = useMutation( {
		...reinstallMarketplacePluginsQuery( purchase.blog_id ),
		meta: {
			snackbar: {
				success: __( 'Plugins reinstalled.' ),
				error: __( 'Failed to reinstall plugins.' ),
			},
		},
	} );
	if ( ! isMarketplacePlugin( purchase ) ) {
		return null;
	}
	if ( isMarketplaceHoldingSitePurchase( purchase ) ) {
		return null;
	}

	return (
		<ActionList.ActionItem
			title={ __( 'Reinstall plugins' ) }
			actions={
				<>
					<Button
						variant="secondary"
						size="compact"
						disabled={ isMutationPending }
						onClick={ () => {
							reinstallPlugins();
						} }
					>
						{ __( 'Reinstall plugins' ) }
					</Button>
				</>
			}
		/>
	);
}

function ChangePlanActionItem( { purchase }: { purchase: Purchase } ) {
	const { user } = useAuth();
	const { recordTracksEvent } = useAnalytics();

	if ( String( user.ID ) !== String( purchase.user_id ) ) {
		return null;
	}
	if ( ! shouldShowChangePlan( purchase ) ) {
		return null;
	}

	const isPastExpiryDowngrade = purchase.is_past_expiry_date && purchase.is_plan;
	const mode = ( () => {
		if ( isPastExpiryDowngrade ) {
			return 'expired';
		}
		if ( isWithinRefundWindowDowngradeEligible( purchase ) ) {
			return 'refund-window';
		}
		return 'delayed-downgrade';
	} )();

	return (
		<ActionList.ActionItem
			title={ __( 'Change plan' ) }
			description={ __( 'Upgrade or downgrade to a plan that works for you.' ) }
			actions={
				<Button
					variant="secondary"
					size="compact"
					onClick={ () => {
						recordTracksEvent( 'calypso_purchases_change_plan_click', {
							product_slug: purchase.product_slug,
							mode,
						} );
						window.location.href = getExpiredNewPlanUrl( purchase );
					} }
				>
					{ __( 'View plans' ) }
				</Button>
			}
		/>
	);
}

function PurchaseSettingsActions( { purchase }: { purchase: Purchase } ) {
	const { user } = useAuth();
	const isOwner = String( user.ID ) === String( purchase.user_id );
	const hasProductAction =
		( isMarketplacePlugin( purchase ) && ! isMarketplaceHoldingSitePurchase( purchase ) ) ||
		isJetpackCrmProduct( purchase.product_slug );

	// 100-year plans and domains have no self-serve actions (no upgrade, no
	// renew, no cancel/remove). Skip the card entirely so we don't render an
	// empty shell.
	if ( isCentennialPurchase( purchase ) ) {
		return null;
	}

	if ( ! isOwner && ( isExpired( purchase ) || ! hasProductAction ) ) {
		return null;
	}

	// Expired purchases get only the "Pick another plan/product" CTA — the
	// other actions (reinstall, upgrade, renew, cancel/remove) don't apply
	// once the purchase has lapsed.
	if ( isExpired( purchase ) ) {
		return (
			<VStack spacing={ 4 }>
				<ActionList>
					<ChangePlanActionItem purchase={ purchase } />
					<ReSubscribeActionButton purchase={ purchase } />
				</ActionList>
			</VStack>
		);
	}

	return (
		<VStack spacing={ 4 }>
			<ActionList>
				<ReinstallButton purchase={ purchase } />
				<JetpackCRMDownloadsButton purchase={ purchase } />
				<UpgradeActionButton purchase={ purchase } />
				{ isEmailPlanManagementEnabled( purchase ) && (
					<AddMailboxesActionItem purchase={ purchase } />
				) }
				<ReSubscribeActionButton purchase={ purchase } />
				<ChangePlanActionItem purchase={ purchase } />
				<RenewActionButton purchase={ purchase } />
				<CancelOrRemoveActionButton purchase={ purchase } />
			</ActionList>
		</VStack>
	);
}

function PurchaseFeatureItems( { features }: { features: CancellationFeature[] } ) {
	return (
		<VStack spacing={ 4 }>
			<Text weight="bold">{ __( 'What you get' ) }</Text>
			<VStack as="ul" spacing={ 1 } className="purchase-settings__feature-list">
				{ features.map( ( feature ) => (
					<HStack key={ feature.feature_id } as="li" justify="flex-start" spacing={ 3 }>
						<Icon icon={ check } size={ 24 } className="purchase-settings__feature-icon" />
						<Text>{ feature.title }</Text>
					</HStack>
				) ) }
			</VStack>
		</VStack>
	);
}

function WPComResourceMeters( {
	purchase,
	site,
	features,
}: {
	purchase: Purchase;
	site?: Site;
	features: CancellationFeature[] | null;
} ) {
	const showStorage = isDotcomPlan( purchase ) && Boolean( site );
	const hasFeatures = features && features.length > 0;

	if ( ! showStorage && ! hasFeatures ) {
		return null;
	}

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					{ hasFeatures && <PurchaseFeatureItems features={ features } /> }
					{ hasFeatures && showStorage && <hr className="purchase-settings__divider" /> }
					{ showStorage && site && (
						<>
							<SiteStorageStat site={ site } />
							<SiteBandwidthStat site={ site } />
						</>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}

function getFields( {
	isMutationPending,
	user,
}: {
	isMutationPending?: boolean;
	user: User;
} ): Field< Purchase >[] {
	return [
		{
			id: 'is_auto_renew_enabled',
			label: __( 'Enable auto-renew' ),
			Edit: ( { field, data: purchase, onChange } ) => {
				const locale = useLocale();
				const navigate = useNavigate();
				const isSplitCancelRemoveEnabled = useIsSplitCancelRemoveEnabled();
				const { getValue } = field;
				const helpText = ( () => {
					if (
						purchase.is_auto_renew_enabled &&
						Boolean( purchase.renew_date ) &&
						isRenewing( purchase )
					) {
						if ( isInExpirationGracePeriod( purchase ) ) {
							return __( 'Pending renewal' );
						}
						// translators: %(date)s is a formatted date string
						return sprintf( __( 'You will be billed on %(date)s' ), {
							date: formatDate( new Date( purchase.renew_date ), locale, { dateStyle: 'long' } ),
						} );
					}
					if ( ! purchase.is_auto_renew_enabled && purchase.expiry_date ) {
						const date = formatDate( new Date( purchase.expiry_date ), locale, {
							dateStyle: 'long',
						} );
						if ( isExpired( purchase ) || isInExpirationGracePeriod( purchase ) ) {
							return sprintf(
								// translators: %(date)s is a formatted expiry date
								__( 'Expired on %(date)s.' ),
								{ date }
							);
						}
						return sprintf(
							// translators: %(date)s is a formatted expiry date
							__( 'Expires on %(date)s.' ),
							{ date }
						);
					}
					return undefined;
				} )();
				if ( purchase.is_auto_renew_enabled && ! purchase.is_rechargeable ) {
					if ( String( user.ID ) !== String( purchase.user_id ) ) {
						return null;
					}
					return (
						<div className="purchase-settings__action-item-standalone">
							<ActionList.ActionItem
								title={ __( 'Enable auto-renew' ) }
								description={ __( 'Auto-renew needs a payment method.' ) }
								actions={
									<Button
										variant="secondary"
										size="compact"
										onClick={ () =>
											navigate( {
												to: changePaymentMethodRoute.fullPath,
												params: { purchaseId: purchase.ID },
											} )
										}
									>
										{ __( 'Add payment method' ) }
									</Button>
								}
							/>
						</div>
					);
				}
				return (
					<ToggleControl
						__nextHasNoMarginBottom
						className="purchase-settings__toggle-control"
						label={
							! purchase.is_auto_renew_enabled &&
							isExpired( purchase ) &&
							purchase.is_jetpack_plan_or_product
								? __( 'Re-activate subscription' )
								: field.label
						}
						checked={ getValue( { item: purchase } ) }
						disabled={
							isMutationPending ||
							isAutoRenewToggleDisabled( purchase, user, isSplitCancelRemoveEnabled )
						}
						onChange={ ( value: boolean ) => onChange( { is_auto_renew_enabled: value } ) }
						help={ helpText }
					/>
				);
			},
		},
		{
			id: 'purchase_payment_method',
			isVisible: ( item ) => item.is_auto_renew_enabled && item.is_rechargeable,
			Edit: ( { data: purchase } ) => {
				return <PurchasePaymentMethod purchase={ purchase } showUpdateButton />;
			},
		},
	];
}

const form = {
	layout: {
		type: 'regular' as const,
	},
	fields: [
		{
			id: 'autoRenew',
			label: __( 'Manage subscription' ),
			children: [ 'is_auto_renew_enabled', 'purchase_payment_method' ],
		},
	],
};

function ManageSubscriptionCard( { purchase }: { purchase: Purchase } ) {
	const {
		mutate: setAutoRenew,
		error,
		isPending: isMutationPending,
	} = useMutation( userPurchaseSetAutoRenewQuery() );
	const { user } = useAuth();
	const navigate = useNavigate();
	const isSplitCancelRemoveEnabled = useIsSplitCancelRemoveEnabled();

	if ( String( user.ID ) !== String( purchase.user_id ) || isIncludedWithPlan( purchase ) ) {
		return null;
	}

	return (
		<Card>
			<CardBody>
				<DataForm< Purchase >
					data={ purchase }
					fields={ getFields( { isMutationPending, user } ) }
					form={ form }
					onChange={ ( newData ) => {
						if ( newData.is_auto_renew_enabled !== purchase.is_auto_renew_enabled ) {
							if ( ! newData.is_auto_renew_enabled && isSplitCancelRemoveEnabled ) {
								navigate( {
									to: cancelPurchaseRoute.fullPath,
									params: { purchaseId: purchase.ID },
									search: { intent: 'auto-renew' as const },
								} );
								return;
							}
							setAutoRenew( { purchaseId: purchase.ID, autoRenew: newData.is_auto_renew_enabled } );
						}
					} }
				/>

				{ error && (
					<Notice status="error" isDismissible={ false }>
						{ error.message }
					</Notice>
				) }
			</CardBody>
		</Card>
	);
}

function PurchasePriceCard( { purchase }: { purchase: Purchase } ) {
	const isCentennial = isCentennialPurchase( purchase );
	// Email plans are billed per mailbox; show the per-mailbox renewal price.
	if (
		isEmailPlanManagementEnabled( purchase ) &&
		! isExpired( purchase ) &&
		! purchase.is_trial_plan
	) {
		return <EmailPlanPriceCard purchase={ purchase } />;
	}
	if ( isCentennial ) {
		return (
			<OverviewCard
				icon={ currencyDollar }
				title={ __( 'Price' ) }
				heading={ formatCurrency( purchase.price_integer, purchase.currency_code, {
					isSmallestUnit: true,
				} ) }
			/>
		);
	}
	if ( isExpired( purchase ) ) {
		return (
			<OverviewCard
				icon={ currencyDollar }
				title={ __( 'Price' ) }
				heading={ formatCurrency( purchase.price_integer, purchase.currency_code, {
					isSmallestUnit: true,
				} ) }
			/>
		);
	}
	if ( purchase.partner_name && ! isA4ABillingDragonPurchase( purchase ) ) {
		return null;
	}
	if ( purchase.is_trial_plan ) {
		return (
			<OverviewCard
				icon={ currencyDollar }
				title={ __( 'Price' ) }
				heading={ __( 'Free Trial' ) }
			/>
		);
	}
	if ( isOneTimePurchase( purchase ) ) {
		return (
			<OverviewCard
				icon={ currencyDollar }
				title={ __( 'Price' ) }
				heading={ formatCurrency( purchase.regular_price_integer, purchase.currency_code, {
					isSmallestUnit: true,
				} ) }
				description={ __( 'Excludes taxes.' ) }
			/>
		);
	}
	const isOffer = purchase.regular_price_integer !== purchase.price_integer;
	const offerText = isOffer
		? /* translators: %(regularPrice)s is a monetary amount that the customer will be charged after this offer ends */
		  sprintf( __( 'After the offer ends, the subscription price will be %(regularPrice)s.' ), {
				regularPrice: formatCurrency( purchase.regular_price_integer, purchase.currency_code, {
					isSmallestUnit: true,
					stripZeros: true,
				} ),
		  } )
		: '';
	return (
		<OverviewCard
			icon={ currencyDollar }
			title={ __( 'Renewal price' ) }
			heading={ formatCurrency( purchase.price_integer, purchase.currency_code, {
				isSmallestUnit: true,
			} ) }
			description={
				getBillPeriodLabel( purchase ) + ' ' + __( 'Excludes taxes.' ) + ' ' + offerText
			}
		/>
	);
}

function DomainRegistrationAgreement( { purchase }: { purchase: Purchase } ) {
	if ( ! purchase.domain_registration_agreement_url ) {
		return null;
	}
	return (
		<MetadataItem>
			<ExternalLink rel="noreferrer" href={ purchase.domain_registration_agreement_url }>
				{ __( 'Domain Registration Agreement' ) }
			</ExternalLink>
		</MetadataItem>
	);
}

function getPluginLabel( pluginSlug: string ) {
	switch ( pluginSlug ) {
		case 'vaultpress':
			return __( 'Backups and security scanning API key' );
		case 'akismet':
			return __( 'Akismet Anti-spam API key' );
		default:
			return pluginSlug;
	}
}

function PluginList( { purchase }: { purchase: Purchase } ) {
	const { data: pluginList } = useQuery( siteJetpackKeysQuery( purchase.blog_id ) );
	if ( ! pluginList?.length ) {
		return null;
	}
	return (
		<div>
			{ pluginList.map( ( plugin ) => {
				return (
					<div key={ plugin.slug }>
						<ClipboardInputControl
							label={ getPluginLabel( plugin.slug ) }
							value={ plugin.key }
							readOnly
							__next40pxDefaultSize
						/>
					</div>
				);
			} ) }
		</div>
	);
}

function BBEPurchaseDescription( { purchase }: { purchase: Purchase } ) {
	const { data: isSubmitted } = useQuery( {
		...siteDifmWebsiteContentQuery( purchase.blog_id ),
		select: ( data ) => data.is_website_content_submitted,
	} );
	if ( purchase.product_slug !== WPCOM_DIFM_LITE ) {
		return null;
	}
	if ( ! purchase.site_slug ) {
		return null;
	}
	if ( purchase.price_tier_list.length === 0 || ! purchase.renewal_price_tier_usage_quantity ) {
		return null;
	}

	const [ tier0 ] = purchase.price_tier_list;
	if ( ! tier0.maximum_units ) {
		return null;
	}
	const extraPageCount = purchase.renewal_price_tier_usage_quantity - tier0.maximum_units;

	const BBESupportLink = (
		<a
			href={ `mailto:services+express@wordpress.com?subject=${ encodeURIComponent(
				`I have a question about my project: ${ purchase.site_slug }`
			) }` }
		>
			{ __( 'Contact us' ) }
		</a>
	);

	return (
		<div>
			<div>
				{ tier0.maximum_units === 1
					? __( 'A professionally built single page website in 4 business days or less.' )
					: sprintf(
							// translators: numberOfIncludedPages is a number of pages
							__(
								'A professionally built %(numberOfIncludedPages)s-page website in 4 business days or less.'
							),
							{
								numberOfIncludedPages: String( tier0.maximum_units ),
							}
					  ) }{ ' ' }
				{ extraPageCount > 0 &&
					sprintf(
						// translators: %(numberOfPages)d is a number of pages
						_n(
							'This purchase includes %(numberOfPages)d extra page.',
							'This purchase includes %(numberOfPages)d extra pages.',
							extraPageCount ?? 0
						),
						{
							numberOfPages: extraPageCount,
						}
					) }
			</div>
			<div>
				{ isSubmitted
					? createInterpolateElement(
							// translators: ContactUs is a link to send an email to support
							__( '<ContactUs /> with any questions or inquiries about your project.' ),
							{
								ContactUs: BBESupportLink,
							}
					  )
					: createInterpolateElement(
							// translators: ContactUs is a link to send an email to support and SubmitContent is a link to the signup flow for site creation
							__(
								'<SubmitContent /> for your website build or <ContactUs /> with any questions about your project.'
							),
							{
								SubmitContent: (
									<a
										href={ wpcomLink(
											`/start/site-content-collection/website-content?siteSlug=${ purchase.site_slug }`
										) }
									>
										{ __( 'Submit content' ) }
									</a>
								),
								ContactUs: BBESupportLink,
							}
					  ) }
			</div>
		</div>
	);
}

function DomainTransferInfo( { purchase }: { purchase: Purchase } ) {
	const locale = useLocale();
	const { data: domain } = useQuery( {
		...domainQuery( purchase?.meta ?? '' ),
		enabled: Boolean( purchase.meta ),
	} );
	if ( purchase.product_slug !== DomainProductSlugs.TRANSFER_IN ) {
		return null;
	}
	if ( ! domain ) {
		return null;
	}

	let transferEndDate = null;
	if ( domain.transfer_start_date ) {
		transferEndDate = new Date( domain.transfer_start_date );
		transferEndDate.setDate( transferEndDate.getDate() + 7 ); // Add 7 days.
		transferEndDate = transferEndDate.toISOString();
	}

	if ( domain.last_transfer_error && purchase.site_slug ) {
		return (
			<Text>
				{ createInterpolateElement(
					__(
						'There was an error when initiating your domain transfer. Please <a>see the details or retry</a>.'
					),
					{
						a: <a href={ domainManagementEdit( purchase.site_slug, domain.domain, null ) } />,
					}
				) }
			</Text>
		);
	}

	if (
		domain.transfer_status === DomainTransferStatus.PENDING_START &&
		purchase.site_slug &&
		purchase.meta
	) {
		return (
			<Text>
				{ createInterpolateElement(
					__( 'You need to <a>start the domain transfer</a> for your domain.' ),
					{
						a: (
							<a
								href={ domainUseMyDomain(
									purchase.site_slug,
									purchase.meta,
									useMyDomainInputMode.startPendingTransfer
								) }
							/>
						),
					}
				) }
			</Text>
		);
	}

	if ( domain.transfer_status === DomainTransferStatus.CANCELLED ) {
		return (
			<Text>
				{ createInterpolateElement( __( 'Transfer failed. Learn the possible <ReasonsWhy />.' ), {
					LearnMore: (
						<ExternalLink
							href={ INCOMING_DOMAIN_TRANSFER_STATUSES_IN_PROGRESS }
							rel="noopener noreferrer"
						>
							{ __( 'reasons why' ) }
						</ExternalLink>
					),
				} ) }
			</Text>
		);
	}

	if ( domain.transfer_status === DomainTransferStatus.PENDING_REGISTRY && transferEndDate ) {
		return (
			<Text>
				{ createInterpolateElement(
					__(
						'The transfer should complete by <TransferFinishDate />. We are waiting for authorization from your current domain provider to proceed. <LearnMore />'
					),
					{
						TransferFinishDate: (
							<strong>
								{ formatDate( new Date( transferEndDate ), locale, { dateStyle: 'long' } ) }
							</strong>
						),
						LearnMore: (
							<ExternalLink
								href={ INCOMING_DOMAIN_TRANSFER_STATUSES_IN_PROGRESS }
								rel="noopener noreferrer"
							>
								{ __( 'Learn more' ) }
							</ExternalLink>
						),
					}
				) }
			</Text>
		);
	}

	if ( domain.transfer_status === DomainTransferStatus.PENDING_REGISTRY ) {
		return (
			<Text>
				{ createInterpolateElement(
					__(
						'We are waiting for authorization from your current domain provider to proceed. <LearnMore />'
					),
					{
						LearnMore: (
							<ExternalLink
								href={ INCOMING_DOMAIN_TRANSFER_STATUSES_IN_PROGRESS }
								rel="noopener noreferrer"
							>
								{ __( 'Learn more' ) }
							</ExternalLink>
						),
					}
				) }
			</Text>
		);
	}

	if ( transferEndDate ) {
		return (
			<Text>
				{ createInterpolateElement(
					__( 'The transfer should complete by <TransferFinishDate />. <LearnMore />' ),
					{
						TransferFinishDate: (
							<strong>
								{ formatDate( new Date( transferEndDate ), locale, { dateStyle: 'long' } ) }
							</strong>
						),
						LearnMore: (
							<ExternalLink
								href={ INCOMING_DOMAIN_TRANSFER_STATUSES_IN_PROGRESS }
								rel="noopener noreferrer"
							>
								{ __( 'Learn more' ) }
							</ExternalLink>
						),
					}
				) }
			</Text>
		);
	}

	return null;
}

function PurchaseSecondSubtitle( {
	purchase,
	site,
	features,
}: {
	purchase: Purchase;
	site?: Site;
	features: CancellationFeature[] | null;
} ) {
	if ( purchase.is_domain ) {
		if ( site?.options?.is_domain_only ) {
			return null;
		}

		if ( isCentennialPurchase( purchase ) ) {
			return null;
		}

		if ( features && features.length > 0 ) {
			return null;
		}

		return (
			<Text variant="muted">
				{ createInterpolateElement(
					// translators: SiteUrl is the URL of the site and Domain is the domain name of the site.
					__(
						"When used with a paid plan, your custom domain can replace your site's free address, <SiteUrl />, with <Domain />, making it easier to remember and easier to share."
					),
					{
						SiteUrl: <strong>{ purchase.domain }</strong>,
						Domain: <strong>{ purchase.meta }</strong>,
					}
				) }
			</Text>
		);
	}

	if ( purchase.product_slug === DomainProductSlugs.TRANSFER_IN ) {
		return (
			<Text variant="muted">
				{ __(
					'Transfers an existing domain from another provider to WordPress.com, helping you manage your site and domain in one place.'
				) }
			</Text>
		);
	}

	if ( isGoogleWorkspace( purchase ) || isTitanMail( purchase ) ) {
		const description = isTitanMail( purchase )
			? __(
					'Integrated email solution with powerful features. Manage your email and more on any device.'
			  )
			: __(
					'Business email with Gmail. Includes other collaboration and productivity tools from Google.'
			  );

		if ( purchase.renewal_price_tier_usage_quantity ) {
			return (
				<Text variant="muted">
					{ description }{ ' ' }
					{ sprintf(
						// translators: %(numberOfMailboxes)d is a number of mailboxes and %(domain)s is a domain name
						_n(
							'This purchase is for %(numberOfMailboxes)d mailbox for the domain %(domain)s.',
							'This purchase is for %(numberOfMailboxes)d mailboxes for the domain %(domain)s.',
							purchase.renewal_price_tier_usage_quantity
						),
						{
							numberOfMailboxes: purchase.renewal_price_tier_usage_quantity,
							domain: purchase.meta ?? '',
						}
					) }
				</Text>
			);
		}
		return description;
	}

	if ( purchase.product_slug === WPCOM_DIFM_LITE ) {
		return <BBEPurchaseDescription purchase={ purchase } />;
	}
	return null;
}

function PurchaseSubtitle( { purchase }: { purchase: Purchase } ) {
	if ( purchase.is_domain && isCentennialPurchase( purchase ) && purchase.meta ) {
		return <MetadataItem title={ getTitleForDisplay( purchase ) } />;
	}

	const subtitle = getSubtitleForDisplay( purchase );
	if ( ! subtitle ) {
		return null;
	}

	if ( purchase.partner_name && ! isA4ABillingDragonPurchase( purchase ) ) {
		return (
			<MetadataItem
				title={ sprintf(
					// translators: %(subtitle)s is the type of purchase (e.g. "Host Managed Plan"), %(partnerName)s is the name of the business partner
					__( '%(subtitle)s. Please contact %(partnerName)s for details.' ),
					{ subtitle, partnerName: purchase.partner_name }
				) }
			/>
		);
	}

	return <MetadataItem title={ subtitle } />;
}

export default function PurchaseSettings() {
	const { user } = useAuth();
	const params = purchaseSettingsRoute.useParams();
	const purchaseId = params.purchaseId;
	const { data: purchase } = useSuspenseQuery( purchaseQuery( parseInt( purchaseId ) ) );
	const { data: site } = useQuery( {
		...siteBySlugQuery( purchase.site_slug ?? '' ),
		enabled: Boolean( purchase.site_slug ) && ! purchase.is_attached_to_holding_site,
	} );
	const { data: domain } = useQuery( {
		...domainQuery( purchase.meta ?? '' ),
		enabled: Boolean( purchase.meta ) && purchase.is_domain,
	} );
	const isIncluded = isIncludedWithPlan( purchase ) && Boolean( purchase.attached_to_purchase_id );
	const { data: parentPurchase } = useQuery( {
		...purchaseQuery( purchase.attached_to_purchase_id ?? 0 ),
		enabled: isIncluded,
	} );
	const formattedExpiry = useFormattedTime( purchase.expiry_date ?? '' );
	const formattedRenewal = useFormattedTime( purchase.renew_date ?? '' );
	const formattedParentExpiry = useFormattedTime( parentPurchase?.expiry_date ?? '' );
	const formattedParentRenewal = useFormattedTime( parentPurchase?.renew_date ?? '' );
	const upgradeUrl = getSitePurchaseUpgradeUrl( purchase, getUpgradedPurchaseRedirectUrl() );
	const willRenew = Boolean(
		! isExpired( purchase ) && purchase.renew_date && ! isExpiring( purchase )
	);
	const parentWillRenew = parentPurchase
		? Boolean(
				parentPurchase.is_auto_renew_enabled &&
					parentPurchase.renew_date &&
					! isExpiring( parentPurchase )
		  )
		: undefined;
	const expiryDateTitle = ( () => {
		if ( isIncluded && parentPurchase ) {
			return parentWillRenew ? __( 'Renews' ) : __( 'Expires' );
		}
		if ( isExpired( purchase ) ) {
			return __( 'Expired' );
		}
		if ( isInExpirationGracePeriod( purchase ) ) {
			return __( 'Expired' );
		}
		if ( isCentennialPurchase( purchase ) ) {
			return __( 'Paid until' );
		}
		if ( willRenew ) {
			return __( 'Renews' );
		}
		return __( 'Expires' );
	} )();

	const isCentennial = isCentennialPurchase( purchase );
	const isSplitEnabled = useIsSplitCancelRemoveEnabled();
	const { data: cancelFeaturesResponse } = useQuery( {
		...purchaseCancelFeaturesQuery( purchase.ID, 'treatment' ),
		enabled: isSplitEnabled,
	} );
	const features = isSplitEnabled ? cancelFeaturesResponse?.features ?? null : null;
	const hasExpiryInfo = ! purchase.partner_name || isA4ABillingDragonPurchase( purchase );

	const isSmallViewport = useViewportMatch( 'medium', '<' );
	const columns = isSmallViewport ? 1 : 2;
	const spacing = isSmallViewport ? SPACING.SMALL : SPACING.DEFAULT;
	const isCurrentPurchaseOwner = String( user.ID ) === String( purchase.user_id );
	const canHeaderUpgrade = canUpgradePurchase( purchase ) && Boolean( upgradeUrl );
	const shouldShowHeaderUpgradeAction = canHeaderUpgrade && isCurrentPurchaseOwner;
	const shouldShowHeaderActionMenu =
		isCurrentPurchaseOwner && ( canHeaderUpgrade || purchase.can_explicit_renew );
	const shouldShowHeaderActions =
		site?.options?.admin_url &&
		! isCentennial &&
		( shouldShowHeaderUpgradeAction || shouldShowHeaderActionMenu );

	// Email plans order the overview cards as Renews, Renewal price, Mailbox, Site;
	// every other purchase keeps Site, Owner, Renews, Price. Extract the two cards
	// that move so they can be rendered before or after the price card.
	const isEmailPlan = isEmailPlanManagementEnabled( purchase );
	const siteCard =
		site &&
		( site.options?.is_domain_only &&
		purchase.is_domain &&
		purchase.product_slug !== DomainProductSlugs.TRANSFER_IN &&
		domain?.can_transfer_to_other_site ? (
			<OverviewCard
				icon={ <Icon icon={ layout } /> }
				title={ __( 'Attach to a site' ) }
				heading={ __( 'No site attached' ) }
				description={ __( 'Attach this domain name to an existing site.' ) }
				link={ `/domains/${ purchase.meta }/transfer/other-site` }
				intent="upsell"
			/>
		) : (
			<OverviewCard
				icon={ <SiteIcon site={ site } /> }
				title={ __( 'Site' ) }
				heading={ site.name }
				description={ purchase.site_slug }
				link={ `/sites/${ purchase.site_slug }` }
			/>
		) );
	const ownerOrMailboxCard = isEmailPlan ? (
		<EmailPlanMailboxCard purchase={ purchase } />
	) : (
		<OverviewCard
			icon={ commentAuthorAvatar }
			title={ __( 'Owner' ) }
			heading={
				String( user.ID ) === String( purchase.user_id )
					? user.display_name
					: __( 'Owned by a different user' )
			}
			description={ String( user.ID ) === String( purchase.user_id ) ? user.email : undefined }
		/>
	);

	return (
		<PageLayout
			size="small"
			header={
				<VStack>
					<PageHeader
						prefix={ <Breadcrumbs length={ 3 } /> }
						title={
							purchase.is_domain && isCentennial && purchase.meta
								? purchase.meta
								: getTitleForDisplay( purchase )
						}
						actions={
							shouldShowHeaderActions && (
								<HStack justify="space-between">
									{ shouldShowHeaderUpgradeAction && upgradeUrl && (
										<Button __next40pxDefaultSize variant="primary" href={ upgradeUrl }>
											{ _x( 'Upgrade', 'Change to a plan with more features.' ) }
										</Button>
									) }
									{ /* Email plans surface every action in the list below, so the
									     quick-actions menu would only duplicate them. */ }
									{ shouldShowHeaderActionMenu && ! isEmailPlanManagementEnabled( purchase ) && (
										<PageHeader.ActionMenu>
											<PurchaseActionMenu purchase={ purchase } />
										</PageHeader.ActionMenu>
									) }
								</HStack>
							)
						}
						description={
							<MetadataList>
								<PurchaseSubtitle purchase={ purchase } />
								<ProductLink purchase={ purchase } />
								<DomainRegistrationAgreement purchase={ purchase } />
							</MetadataList>
						}
					/>

					<PurchaseSecondSubtitle purchase={ purchase } site={ site } features={ features } />

					{ purchase.product_slug === DomainProductSlugs.TRANSFER_IN && (
						<DomainTransferInfo purchase={ purchase } />
					) }
					{ ! purchase.partner_name && <PluginList purchase={ purchase } /> }
				</VStack>
			}
		>
			<VStack spacing={ 6 }>
				<PurchaseNotice purchase={ purchase } />
				<Grid
					columns={ columns }
					gap={ spacing }
					className={ isEmailPlan ? 'purchase-settings__email-overview-cards' : undefined }
				>
					{ ! isEmailPlan && siteCard }
					{ ! isEmailPlan && ownerOrMailboxCard }
					{ hasExpiryInfo &&
						( isExpired( purchase ) ? (
							<OverviewCard icon={ info } title={ __( 'Status' ) } heading={ __( 'Removed' ) } />
						) : (
							<OverviewCard
								icon={ calendar }
								title={ expiryDateTitle }
								heading={ ( () => {
									if ( isIncluded && parentPurchase ) {
										return parentWillRenew ? formattedParentRenewal : formattedParentExpiry;
									}
									if ( isOneTimePurchase( purchase ) || isAkismetFreeProduct( purchase ) ) {
										return __( 'Never expires' );
									}
									if ( isInExpirationGracePeriod( purchase ) ) {
										return formattedExpiry;
									}
									if ( willRenew ) {
										return formattedRenewal;
									}
									if ( purchase.subscription_status !== 'active' ) {
										return __( 'Inactive' );
									}
									return formattedExpiry;
								} )() }
								description={ ( () => {
									if ( isCentennial ) {
										return undefined;
									}
									if ( purchase.is_auto_renew_enabled && isInExpirationGracePeriod( purchase ) ) {
										return __( 'Pending renewal' );
									}
									if ( purchase.is_auto_renew_enabled && isRenewing( purchase ) ) {
										return __( 'Auto-renew is enabled' );
									}
									if ( isIncluded && purchase.attached_to_purchase_id ) {
										return (
											<Link
												to={ purchaseSettingsRoute.fullPath }
												params={ { purchaseId: purchase.attached_to_purchase_id } }
											>
												{ parentPurchase && ! parentWillRenew
													? __( 'Expires with plan' )
													: __( 'Renews with plan' ) }
											</Link>
										);
									}
									if ( purchase.is_trial_plan || isAkismetFreeProduct( purchase ) ) {
										return undefined;
									}
									if ( purchase.is_auto_renew_enabled ) {
										return __( 'Will not auto-renew because there is no payment method' );
									}
									return __( 'Auto-renew is disabled' );
								} )() }
							/>
						) ) }
					<PurchasePriceCard purchase={ purchase } />
					{ isEmailPlan && ownerOrMailboxCard }
					{ isEmailPlan && siteCard }
					{ purchase.is_jetpack_plan_or_product && (
						<JetpackLicenseKeyCard purchaseId={ purchase.ID } />
					) }
					{ isAkismetProduct( purchase ) && purchase.is_attached_to_holding_site && (
						<AkismetApiKeyCard />
					) }
				</Grid>
				{ ( ( site && purchase.subscription_status === 'active' ) ||
					( features && features.length > 0 ) ) && (
					<WPComResourceMeters purchase={ purchase } site={ site } features={ features } />
				) }
				{ isWpcomFlexSubscription( purchase ) && (
					<BillingFlexUsageCard purchaseId={ purchase.ID } />
				) }
				{ ! purchase.is_trial_plan &&
					! isCentennial &&
					purchase.subscription_status === 'active' && (
						<ManageSubscriptionCard purchase={ purchase } />
					) }
				<PurchaseSettingsActions purchase={ purchase } />
			</VStack>
		</PageLayout>
	);
}
