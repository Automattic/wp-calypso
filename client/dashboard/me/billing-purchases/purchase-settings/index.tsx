import {
	ProductUpgradeMap,
	AkismetUpgradesProductMap,
	SubscriptionBillPeriod,
	DomainProductSlugs,
	useMyDomainInputMode,
	WPCOM_DIFM_LITE,
	OFFSITE_REDIRECT,
	DomainTransferStatus,
} from '@automattic/api-core';
import {
	domainQuery,
	purchaseQuery,
	userPurchaseSetAutoRenewQuery,
	siteDifmWebsiteContentQuery,
	siteJetpackKeysQuery,
	reinstallMarketplacePluginsQuery,
	siteBySlugQuery,
} from '@automattic/api-queries';
import { domainManagementEdit, domainUseMyDomain } from '@automattic/domains-table/src/utils/paths';
import { formatCurrency } from '@automattic/number-formatters';
import { INCOMING_DOMAIN_TRANSFER_STATUSES_IN_PROGRESS } from '@automattic/urls';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import {
	__experimentalGrid as Grid,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	DropdownMenu,
	MenuGroup,
	MenuItem,
	Card,
	CardBody,
	Button,
	ToggleControl,
	Notice,
	ExternalLink,
} from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { moreVertical, calendar, currencyDollar, commentAuthorAvatar } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { useAnalytics } from '../../../app/analytics';
import { useAuth } from '../../../app/auth';
import Breadcrumbs from '../../../app/breadcrumbs';
import { useLocale } from '../../../app/locale';
import { emailsRoute } from '../../../app/router/emails';
import { purchaseSettingsRoute } from '../../../app/router/me';
import { ActionList } from '../../../components/action-list';
import ClipboardInputControl from '../../../components/clipboard-input-control';
import { useFormattedTime } from '../../../components/formatted-time';
import OverviewCard from '../../../components/overview-card';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import SiteIcon from '../../../components/site-icon';
import { formatDate } from '../../../utils/datetime';
import {
	getBillPeriodLabel,
	getTitleForDisplay,
	getSubtitleForDisplay,
	isExpiring,
	isExpired,
	isRenewing,
	isIncludedWithPlan,
	isOneTimePurchase,
	isMarketplaceTemporarySitePurchase,
	isMarketplacePlugin,
	isJetpackTemporarySitePurchase,
	isAkismetProduct,
	isJetpackCrmProduct,
	isTitanMail,
	isGoogleWorkspace,
	getRenewalUrlFromPurchase,
	isJetpackT1SecurityPlan,
} from '../../../utils/purchase';
import { PurchasePaymentMethod } from '../purchase-payment-method';
import { getPurchaseUrlForId } from '../urls';
import { PurchaseNotice } from './purchase-notice';
import type { User, Purchase } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

import './style.scss';

function renewPurchase( purchase: Purchase ): void {
	window.location.href = getRenewalUrlFromPurchase( purchase );
}

function getUpgradeUrl( purchase: Purchase ): string | undefined {
	if ( isAkismetProduct( purchase ) ) {
		// For the first Iteration of Calypso Akismet checkout we are only suggesting
		// for immediate upgrades to the next plan. We will change this in the future
		// with appropriate page.
		const upgradeProductPath = AkismetUpgradesProductMap[ purchase.product_slug ];
		if ( upgradeProductPath ) {
			return upgradeProductPath;
		}
		return undefined;
	}

	const upgradeProductSlug = ProductUpgradeMap[ purchase.product_slug ];
	if ( upgradeProductSlug ) {
		return `/checkout/${ purchase.site_slug }/${ upgradeProductSlug }`;
	}

	if ( purchase.is_jetpack_backup_t1 || isJetpackT1SecurityPlan( purchase ) ) {
		return `/plans/storage/${ purchase.site_slug }`;
	}

	if ( purchase.is_jetpack_plan_or_product ) {
		return `/plans/${ purchase.site_slug }`;
	}

	return getWpcomPlanGridUrl( purchase.site_slug );
}

function getExpiredNewPlanUrl( purchase: Purchase ): string {
	if ( purchase.is_jetpack_backup_t1 || isJetpackT1SecurityPlan( purchase ) ) {
		return `/plans/storage/${ purchase.site_slug }`;
	}

	if ( purchase.is_jetpack_plan_or_product ) {
		return `/plans/${ purchase.site_slug }`;
	}

	if ( purchase.is_plan ) {
		return getWpcomPlanGridUrl( purchase.site_slug );
	}

	return `/plans/${ purchase.site_slug }`;
}

function getWpcomPlanGridUrl( siteSlug: string | undefined ): string {
	const backUrl = window.location.href.replace( window.location.origin, '' );
	return addQueryArgs( '/setup/plan-upgrade', {
		...( siteSlug && { siteSlug } ),
		redirect_to: backUrl,
		cancel_to: backUrl,
	} );
}

function canPurchaseBeUpgraded( purchase: Purchase ): boolean {
	return Boolean(
		purchase.is_upgradable &&
			getUpgradeUrl( purchase ) &&
			! isJetpackTemporarySitePurchase( purchase )
	);
}

function isAutoRenewToggleDisabled( purchase: Purchase, user: User ): boolean {
	if ( String( user.ID ) !== String( purchase.user_id ) ) {
		return true;
	}
	if ( isExpired( purchase ) && shouldAllowExpiredAutoRenewToggle( purchase ) ) {
		// Special case!
		return false;
	}
	if ( purchase.is_auto_renew_enabled && ! purchase.can_disable_auto_renew ) {
		return true;
	}
	if ( ! purchase.is_auto_renew_enabled && ! purchase.can_reenable_auto_renewal ) {
		return true;
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
	if ( purchase.is_plan && purchase.site_slug ) {
		const url = '/plans/my-plan/' + purchase.site_slug;
		const text = __( 'Plan features' );
		return <a href={ url }>{ text }</a>;
	}

	if (
		( purchase.is_domain || purchase.product_slug === OFFSITE_REDIRECT ) &&
		purchase.site_slug &&
		purchase.meta
	) {
		const url = domainManagementEdit( purchase.site_slug, purchase.meta );
		const text = __( 'Domain settings' );
		return <a href={ url }>{ text }</a>;
	}

	if ( isGoogleWorkspace( purchase ) || isTitanMail( purchase ) ) {
		const text = __( 'Email settings' );
		return <Link to={ emailsRoute.to }>{ text }</Link>;
	}

	return null;
}

function PurchaseActionMenu( { purchase }: { purchase: Purchase } ) {
	const { user } = useAuth();
	const canBeRenewed =
		purchase.can_explicit_renew && String( user.ID ) === String( purchase.user_id );
	const upgradeUrl = getUpgradeUrl( purchase );
	const { recordTracksEvent } = useAnalytics();
	return (
		<DropdownMenu icon={ moreVertical } label={ __( 'Quick actions' ) }>
			{ () => (
				<MenuGroup>
					{ canPurchaseBeUpgraded( purchase ) && upgradeUrl && (
						<MenuItem
							onClick={ () => {
								recordTracksEvent( 'calypso_purchases_upgrade_plan', {
									status: isExpired( purchase ) ? 'expired' : 'active',
									plan: purchase.product_name,
								} );
								upgradePurchase( upgradeUrl );
							} }
						>
							{ __( 'Upgrade' ) }
						</MenuItem>
					) }
					{ canBeRenewed && (
						<MenuItem
							onClick={ () => {
								recordTracksEvent( 'calypso_purchases_renew_now_click', {
									product_slug: purchase.product_slug,
								} );
								renewPurchase( purchase );
							} }
						>
							{ __( 'Renew' ) }
						</MenuItem>
					) }
				</MenuGroup>
			) }
		</DropdownMenu>
	);
}

function CancelOrRemoveActionButton( { purchase }: { purchase: Purchase } ) {
	// FIXME: render renderWordAdsEligibilityWarningDialog for refund/cancel
	// FIXME: render renderNonPrimaryDomainWarningDialog for refund/cancel
	// FIXME: render "Domain transfers can take anywhere from five to seven days to complete." next to cancel button (see domainTransferDuration)
	if ( purchase.is_cancelable ) {
		return (
			<ActionList.ActionItem
				title={ __( 'Downgrade or cancel your subscription' ) }
				description={ __( 'We’ll be sorry to see you go!' ) }
				actions={
					<Button
						variant="secondary"
						size="compact"
						onClick={ () => ( {
							// FIXME: add refund, cancel, and downgrade action
						} ) }
					>
						{ __( 'Downgrade or cancel' ) }
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
						size="compact"
						onClick={ () => ( {
							// FIXME: add remove action
						} ) }
					>
						{ __( 'Remove subscription' ) }
					</Button>
				}
			/>
		);
	}
	return null;
}

function UpgradeActionButton( { purchase }: { purchase: Purchase } ) {
	const { recordTracksEvent } = useAnalytics();
	if ( ! canPurchaseBeUpgraded( purchase ) ) {
		return null;
	}
	const upgradeUrl = getUpgradeUrl( purchase );
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
					{ __( 'Upgrade subscription' ) }
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
					{ __( 'Renew' ) }
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
	const path = `/purchases/crm-downloads/${ purchase.ID }`;

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
	if ( isMarketplaceTemporarySitePurchase( purchase ) ) {
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

function PurchaseSettingsActions( { purchase }: { purchase: Purchase } ) {
	return (
		<VStack spacing={ 4 }>
			<ActionList>
				<ReinstallButton purchase={ purchase } />
				<JetpackCRMDownloadsButton purchase={ purchase } />
				<UpgradeActionButton purchase={ purchase } />
				<ReSubscribeActionButton purchase={ purchase } />
				<RenewActionButton purchase={ purchase } />
				<CancelOrRemoveActionButton purchase={ purchase } />
			</ActionList>
		</VStack>
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
				const { getValue } = field;
				const helpText = ( () => {
					if (
						purchase.is_auto_renew_enabled &&
						Boolean( purchase.renew_date ) &&
						isRenewing( purchase )
					) {
						// translators: date is a formatted date string
						return sprintf( __( 'You will be billed on %(date)s' ), {
							date: formatDate( new Date( purchase.renew_date ), locale, { dateStyle: 'long' } ),
						} );
					}
					if ( isIncludedWithPlan( purchase ) && purchase.attached_to_purchase_id ) {
						return (
							<Link to={ getPurchaseUrlForId( purchase.attached_to_purchase_id ) }>
								{ __( 'Renews with plan' ) }
							</Link>
						);
					}
					if ( purchase.is_auto_renew_enabled ) {
						return __( 'Will not auto-renew because there is no payment method' );
					}
					return undefined;
				} )();
				return (
					<ToggleControl
						__nextHasNoMarginBottom
						label={
							shouldAllowExpiredAutoRenewToggle( purchase )
								? __( 'Re-activate subscription' )
								: field.label
						}
						checked={ getValue( { item: purchase } ) }
						disabled={ isMutationPending || isAutoRenewToggleDisabled( purchase, user ) }
						onChange={ ( value: boolean ) => onChange( { is_auto_renew_enabled: value } ) }
						help={ helpText }
					/>
				);
			},
		},
	];
}

const form = {
	type: 'regular' as const,
	labelPosition: 'top' as const,
	fields: [
		{
			id: 'autoRenew',
			label: __( 'Manage subscription' ),
			children: [ 'is_auto_renew_enabled' ],
		},
	],
};

function ManageSubscriptionCard( { purchase }: { purchase: Purchase } ) {
	const {
		mutate: setAutoRenew,
		error,
		isPending: isMutationPending,
	} = useMutation( userPurchaseSetAutoRenewQuery( purchase.ID ) );
	const { user } = useAuth();
	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 } alignment="left">
					<DataForm< Purchase >
						data={ purchase }
						fields={ getFields( { isMutationPending, user } ) }
						form={ form }
						onChange={ ( newData ) => {
							if ( newData.is_auto_renew_enabled !== purchase.is_auto_renew_enabled ) {
								setAutoRenew( newData.is_auto_renew_enabled );
							}
						} }
					/>

					{ error && (
						<Notice status="error" isDismissible={ false }>
							{ error.message }
						</Notice>
					) }

					<PurchasePaymentMethod purchase={ purchase } showUpdateButton />
				</VStack>
			</CardBody>
		</Card>
	);
}

function PurchasePriceCard( { purchase }: { purchase: Purchase } ) {
	if ( purchase.partner_name ) {
		return (
			<OverviewCard
				icon={ currencyDollar }
				title={
					// translators: partnerName is the name of a business partner through which this product was sold
					sprintf( __( 'Please contact %(partnerName)s for details' ), {
						partnerName: purchase.partner_name,
					} )
				}
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
	return (
		<OverviewCard
			icon={ currencyDollar }
			title={ __( 'Renewal price' ) }
			heading={ formatCurrency( purchase.price_integer, purchase.currency_code, {
				isSmallestUnit: true,
			} ) }
			description={ getBillPeriodLabel( purchase ) + ' ' + __( 'Excludes taxes.' ) }
		/>
	);
}

function DomainRegistrationAgreement( { purchase }: { purchase: Purchase } ) {
	if ( ! purchase.domain_registration_agreement_url ) {
		return null;
	}
	return (
		<ExternalLink rel="noreferrer" href={ purchase.domain_registration_agreement_url }>
			{ __( 'Domain Registration Agreement' ) }
		</ExternalLink>
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
								numberOfIncludedPages: tier0.maximum_units,
							}
					  ) }{ ' ' }
				{ extraPageCount > 0 &&
					sprintf(
						// translators: numberofPages is a number of pages
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
										href={ `/start/site-content-collection/website-content?siteSlug=${ purchase.site_slug }` }
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

function PurchaseSecondSubtitle( { purchase }: { purchase: Purchase } ) {
	if ( purchase.is_domain ) {
		if ( purchase.bill_period_days === SubscriptionBillPeriod.PLAN_CENTENNIAL_PERIOD ) {
			return (
				<Text variant="muted">
					{ __(
						'Your stories, achievements, and memories preserved for generations to come. One payment. One hundred years of legacy.'
					) }
				</Text>
			);
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
						// translators: numberOfMailboxes is a number and domain is a domain name
						_n(
							'This purchase is for %(numberOfMailboxes)d mailbox for the domain %(domain)s.',
							'This purchase is for %(numberOfMailboxes)d mailboxes for the domain %(domain)s.',
							purchase.renewal_price_tier_usage_quantity
						),
						{
							numberOfMailboxes: purchase.renewal_price_tier_usage_quantity,
							domain: purchase.meta,
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
	const subtitle = getSubtitleForDisplay( purchase );
	if ( ! subtitle ) {
		return null;
	}
	return <Text variant="muted">{ subtitle }</Text>;
}

export default function PurchaseSettings() {
	const { user } = useAuth();
	const params = purchaseSettingsRoute.useParams();
	const purchaseId = params.purchaseId;
	const { data: purchase } = useQuery( {
		...purchaseQuery( parseInt( purchaseId ) ),
		enabled: Boolean( purchaseId ),
	} );
	const { data: site } = useQuery( {
		...siteBySlugQuery( purchase?.site_slug ?? '' ),
		enabled: Boolean( purchase?.site_slug ),
	} );
	const formattedExpiry = useFormattedTime( purchase?.expiry_date ?? '' );
	const formattedRenewal = useFormattedTime( purchase?.renew_date ?? '' );
	if ( ! purchase ) {
		return null;
	}
	const upgradeUrl = getUpgradeUrl( purchase );
	const willRenew = Boolean( purchase.renew_date && ! isExpiring( purchase ) );
	const expiryDateTitle = ( () => {
		if ( purchase.bill_period_days === SubscriptionBillPeriod.PLAN_CENTENNIAL_PERIOD ) {
			return __( 'Paid until' );
		}
		if ( willRenew ) {
			return __( 'Renews' );
		}
		return __( 'Expires' );
	} )();

	return (
		<PageLayout
			size="small"
			header={
				<VStack>
					<PageHeader
						prefix={ <Breadcrumbs length={ 3 } /> }
						title={ getTitleForDisplay( purchase ) }
						actions={
							site?.options?.admin_url && (
								<>
									{ canPurchaseBeUpgraded( purchase ) && upgradeUrl && (
										<Button __next40pxDefaultSize variant="primary" href={ upgradeUrl }>
											{ __( 'Upgrade' ) }
										</Button>
									) }
									<PurchaseActionMenu purchase={ purchase } />
								</>
							)
						}
					/>
					<PurchaseSubtitle purchase={ purchase } />
					<PurchaseSecondSubtitle purchase={ purchase } />

					{ purchase.product_slug === DomainProductSlugs.TRANSFER_IN && (
						<DomainTransferInfo purchase={ purchase } />
					) }
					<ProductLink purchase={ purchase } />
					<DomainRegistrationAgreement purchase={ purchase } />
					{ ! purchase.partner_name && <PluginList purchase={ purchase } /> }
				</VStack>
			}
		>
			<VStack spacing={ 6 }>
				<PurchaseNotice purchase={ purchase } />
				<Grid columns={ 2 } rows={ 2 } gap={ 6 }>
					<OverviewCard
						icon={ calendar }
						title={ expiryDateTitle }
						heading={ ( () => {
							if ( isOneTimePurchase( purchase ) ) {
								return __( 'Never expires' );
							}
							if ( willRenew ) {
								return formattedRenewal;
							}
							return formattedExpiry;
						} )() }
						description={ ( () => {
							if ( purchase.is_auto_renew_enabled && isRenewing( purchase ) ) {
								return __( 'Auto-renew is enabled' );
							}
							if ( isIncludedWithPlan( purchase ) && purchase.attached_to_purchase_id ) {
								return (
									<Link to={ getPurchaseUrlForId( purchase.attached_to_purchase_id ) }>
										{ __( 'Renews with plan' ) }
									</Link>
								);
							}
							if ( purchase.is_auto_renew_enabled ) {
								return __( 'Will not auto-renew because there is no payment method' );
							}
							return __( 'Auto-renew is disabled' );
						} )() }
					/>
					<PurchasePriceCard purchase={ purchase } />
					{ site && (
						<OverviewCard
							icon={ <SiteIcon site={ site } /> }
							title={ __( 'Site' ) }
							heading={ site.name }
							description={ purchase.site_slug }
							link={ `/v2/sites/${ purchase.site_slug }` }
						/>
					) }
					<OverviewCard
						icon={ commentAuthorAvatar }
						title={ __( 'Owner' ) }
						heading={
							String( user.ID ) === String( purchase.user_id )
								? user.display_name
								: __( 'Owned by a different user' )
						}
						description={
							String( user.ID ) === String( purchase.user_id ) ? user.email : undefined
						}
					/>
				</Grid>
				<ManageSubscriptionCard purchase={ purchase } />
				<PurchaseSettingsActions purchase={ purchase } />
			</VStack>
		</PageLayout>
	);
}
