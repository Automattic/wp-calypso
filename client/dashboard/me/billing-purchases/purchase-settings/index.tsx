import { formatCurrency } from '@automattic/number-formatters';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter, Link } from '@tanstack/react-router';
import {
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
	DropdownMenu,
	MenuGroup,
	MenuItem,
	Card,
	CardBody,
	Button,
	Icon,
	ToggleControl,
	Notice,
} from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { __, isRTL, sprintf } from '@wordpress/i18n';
import {
	moreVertical,
	chevronLeft,
	chevronRight,
	calendar,
	currencyDollar,
	siteLogo,
	commentAuthorAvatar,
} from '@wordpress/icons';
import { useAnalytics } from '../../../app/analytics';
import { useAuth } from '../../../app/auth';
import { useLocale } from '../../../app/locale';
import { purchaseQuery, userPurchaseSetAutoRenewQuery } from '../../../app/queries/me-purchases';
import { siteBySlugQuery } from '../../../app/queries/site';
import { purchaseSettingsRoute } from '../../../app/router/me';
import { ActionList } from '../../../components/action-list';
import { useFormattedTime } from '../../../components/formatted-time';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { ProductUpgradeMap, AkismetUpgradesProductMap } from '../../../data/constants';
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
	isAkismetProduct,
} from '../../../utils/purchase';
import { encodeProductForUrl } from '../../../utils/wpcom-checkout';
import { getPurchaseUrlForId } from '../urls';
import type { Purchase } from '../../../data/purchase';
import type { Field } from '@wordpress/dataviews';
import type { ReactNode, ReactElement } from 'react';

import './style.scss';

function getServicePathForCheckoutFromPurchase( purchase: Purchase ): string {
	if ( isAkismetProduct( purchase ) ) {
		return 'akismet/';
	}
	if ( isMarketplaceTemporarySitePurchase( purchase ) ) {
		return 'marketplace/';
	}
	return '';
}

function getRenewalUrlFromPurchase( purchase: Purchase ): string {
	const productSlug = encodeProductForUrl( purchase.product_slug );
	const productDomain = purchase.meta ? encodeProductForUrl( purchase.meta ) : undefined;
	const checkoutProductSlug = productDomain ? `${ productSlug }:${ productDomain }` : productSlug;
	const checkoutSiteSlug = purchase.site_slug || '';
	const servicePath = getServicePathForCheckoutFromPurchase( purchase );
	return `/checkout/${ servicePath }${ checkoutProductSlug }/renew/${ purchase.ID }/${ checkoutSiteSlug }`;
}

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

	if ( purchase.is_jetpack_backup_t1 ) {
		return `/plans/storage/${ purchase.site_slug }`;
	}

	return `/plans/${ purchase.site_slug }`;
}

function getExpiredNewPlanUrl( purchase: Purchase ): string {
	if ( purchase.is_jetpack_backup_t1 ) {
		return `/plans/storage/${ purchase.site_slug }`;
	}
	return `/plans/${ purchase.site_slug }`;
}

function upgradePurchase( upgradeUrl: string ): void {
	window.location.href = upgradeUrl;
}

const BackButton = () => {
	const router = useRouter();

	return (
		<Button
			className="dashboard-page-header__back-button"
			icon={ isRTL() ? chevronRight : chevronLeft }
			onClick={ () => {
				router.navigate( {
					to: '/me/billing/purchases',
				} );
			} }
		>
			{ __( 'Purchases' ) }
		</Button>
	);
};

function PurchaseActionMenu( { purchase }: { purchase: Purchase } ) {
	const canBeRenewed = purchase.can_explicit_renew;
	const upgradeUrl = getUpgradeUrl( purchase );
	const { recordTracksEvent } = useAnalytics();
	return (
		<DropdownMenu icon={ moreVertical } label={ __( 'Quick actions' ) }>
			{ () => (
				<MenuGroup>
					{ purchase.is_upgradable && upgradeUrl && (
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

function PurchaseSettingsCardLinkWrapper( {
	link,
	children,
}: {
	link?: string;
	children: ReactNode;
} ) {
	if ( link ) {
		return (
			<Link to={ link } className="purchase-settings-card__link">
				{ children }
			</Link>
		);
	}
	return children;
}

function PurchaseSettingsActions( {
	purchase,
	upgradeUrl,
}: {
	purchase: Purchase;
	upgradeUrl: string | undefined;
} ) {
	const canBeRemoved = ! isExpired( purchase ) && ! isIncludedWithPlan( purchase );
	const canBeRenewed = purchase.can_explicit_renew;
	const canCancel = purchase.is_cancelable;
	const { recordTracksEvent } = useAnalytics();
	// FIXME: prevent renew if purchase.isLocked
	// FIXME: prevent renew if not product owner
	// FIXME: prevent rendering upgrade button if Jetpack temp site
	return (
		<VStack spacing={ 4 }>
			<ActionList>
				{ purchase.is_upgradable && upgradeUrl && (
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
				) }
				{ isExpired( purchase ) && (
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
				) }
				{ canBeRenewed && (
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
				) }
				{ canCancel && (
					<ActionList.ActionItem
						title={ __( 'Downgrade or cancel your subscription' ) }
						description={ __( "We'll be sorry to see you go!" ) }
						actions={
							<Button
								variant="secondary"
								size="compact"
								onClick={ () => ( {
									// FIXME
								} ) }
							>
								{ __( 'Downgrade or cancel' ) }
							</Button>
						}
					/>
				) }
				{ ! canCancel && canBeRemoved && (
					<ActionList.ActionItem
						title={ __( 'Remove subscription' ) }
						description={ __( 'Remove this product.' ) }
						actions={
							<Button
								variant="secondary"
								size="compact"
								onClick={ () => ( {
									// FIXME
								} ) }
							>
								{ __( 'Remove subscription' ) }
							</Button>
						}
					/>
				) }
			</ActionList>
		</VStack>
	);
}

function PurchaseSettingsCard( {
	icon,
	title,
	heading,
	description,
	link,
}: {
	icon?: ReactElement;
	title: ReactNode;
	heading?: ReactNode;
	description?: ReactNode;
	link?: string;
} ) {
	// FIXME: Add "Please contact partnerName" for partner purchase
	return (
		<PurchaseSettingsCardLinkWrapper link={ link }>
			<Card className="purchase-settings-card">
				<CardBody>
					<VStack>
						<HStack justify="space-between">
							<HStack spacing={ 2 } justify="flex-start" alignment="center">
								{ icon && <Icon className="dashboard-overview-card__icon" icon={ icon } /> }
								<Text
									className="dashboard-overview-card__title"
									variant="muted"
									lineHeight="16px"
									size={ 11 }
									weight={ 500 }
									upperCase
								>
									{ title }
								</Text>
							</HStack>
							{ link && (
								<Icon className="dashboard-overview-card__link-icon" icon={ chevronRight } />
							) }
						</HStack>
						<HStack spacing={ 2 } justify="flex-start" alignment="center">
							<VStack>
								{ heading && (
									<Heading level={ 2 } size={ 20 } weight={ 500 }>
										{ heading }
									</Heading>
								) }
								{ description && (
									<Text variant="muted" lineHeight="16px" size={ 12 }>
										{ description }
									</Text>
								) }
							</VStack>
						</HStack>
					</VStack>
				</CardBody>
			</Card>
		</PurchaseSettingsCardLinkWrapper>
	);
}

function getFields( { isMutationPending }: { isMutationPending?: boolean } ): Field< Purchase >[] {
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
						label={ field.label }
						checked={ getValue( { item: purchase } ) }
						disabled={
							isMutationPending ||
							isOneTimePurchase( purchase ) ||
							isExpired( purchase ) ||
							isIncludedWithPlan( purchase )
						}
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
	} = useMutation( userPurchaseSetAutoRenewQuery( parseInt( purchase.ID ) ) );
	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 } alignment="left">
					<DataForm< Purchase >
						data={ purchase }
						fields={ getFields( { isMutationPending } ) }
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
				</VStack>
			</CardBody>
		</Card>
	);
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
	if ( ! purchase || ! site ) {
		return null;
	}
	const upgradeUrl = getUpgradeUrl( purchase );
	const subtitle = getSubtitleForDisplay( purchase );
	// FIXME: add edit payment method button
	// FIXME: add Jetpack CRM downloads link
	// FIXME: render reinstall button
	// FIXME: render "Domain transfers can take anywhere from five to seven days to complete."
	// FIXME: render 'Domain Registration Agreement' and link
	// FIXME: render DIFM content
	// FIXME: render renderWordAdsEligibilityWarningDialog for refund/cancel
	// FIXME: render renderNonPrimaryDomainWarningDialog for refund/cancel
	// FIXME: render "X cheaper than monthly" upsell button

	return (
		<PageLayout
			size="small"
			header={
				<VStack>
					<PageHeader
						prefix={ <BackButton /> }
						title={ getTitleForDisplay( purchase ) }
						actions={
							site?.options?.admin_url && (
								<>
									{ purchase.is_upgradable && upgradeUrl && (
										<Button __next40pxDefaultSize variant="primary" href={ upgradeUrl }>
											{ __( 'Upgrade' ) }
										</Button>
									) }
									<PurchaseActionMenu purchase={ purchase } />
								</>
							)
						}
					/>
					{ subtitle && <Text variant="muted">{ subtitle }</Text> }
				</VStack>
			}
		>
			<VStack spacing={ 6 }>
				<HStack spacing={ 6 } justify="flex-start" alignment="center">
					<PurchaseSettingsCard
						icon={ calendar }
						title={
							purchase.renew_date && ! isExpiring( purchase ) ? __( 'Renews' ) : __( 'Expires' )
						}
						heading={ ( () => {
							if ( isOneTimePurchase( purchase ) ) {
								return __( 'Never expires' );
							}
							if ( purchase.renew_date && ! isExpiring( purchase ) ) {
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
					<PurchaseSettingsCard
						icon={ currencyDollar }
						title={ __( 'Renewal price' ) }
						heading={ formatCurrency( purchase.price_integer, purchase.currency_code, {
							isSmallestUnit: true,
						} ) }
						description={ getBillPeriodLabel( purchase ) + ' ' + __( 'Excludes taxes.' ) }
					/>
				</HStack>
				<HStack spacing={ 6 } justify="flex-start" alignment="center">
					<PurchaseSettingsCard
						icon={ siteLogo }
						title={ __( 'Site' ) }
						heading={ site.name }
						description={ purchase.site_slug }
						link={ `/v2/sites/${ purchase.site_slug }` }
					/>
					<PurchaseSettingsCard
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
				</HStack>
				<ManageSubscriptionCard purchase={ purchase } />
				<PurchaseSettingsActions purchase={ purchase } upgradeUrl={ upgradeUrl } />
			</VStack>
		</PageLayout>
	);
}
