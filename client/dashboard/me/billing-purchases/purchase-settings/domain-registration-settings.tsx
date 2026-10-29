import { userPurchaseSetAutoRenewQuery, userPurchasesQuery } from '@automattic/api-queries';
import { formatCurrency } from '@automattic/number-formatters';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	ToggleControl,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Notice as UINotice } from '@wordpress/ui';
import { useAnalytics } from '../../../app/analytics';
import { useAuth } from '../../../app/auth';
import { useLocale } from '../../../app/locale';
import { cancelPurchaseRoute, changePaymentMethodRoute } from '../../../app/router/me';
import { ActionList } from '../../../components/action-list';
import Notice from '../../../components/notice';
import RouterLinkButton from '../../../components/router-link-button';
import { SectionHeader } from '../../../components/section-header';
import SiteIcon from '../../../components/site-icon';
import { formatDate } from '../../../utils/datetime';
import {
	getRenewalUrlFromPurchase,
	isAutoRenewToggleDisabled,
	isCentennialPurchase,
	isExpiredWithNoAutoRenewAttemptsLeft,
	isManageableByUser,
	isPurchaseOwner,
	isRemoved,
	isRenewingBeforeExpiration,
} from '../../../utils/purchase';
import { useIsSplitCancelRemoveEnabled } from '../cancel-purchase/use-is-split-cancel-remove-enabled';
import { PurchasePaymentMethod } from '../purchase-payment-method';
import { PurchaseNotice } from './purchase-notice';
import type { Purchase, Site } from '@automattic/api-core';

/**
 * Whether the purchase gets the domain registration layout (Renewal, Details,
 * and Danger zone) instead of the generic purchase settings page.
 */
export function isDomainRegistrationLayout( purchase: Purchase ): boolean {
	return (
		purchase.is_domain_registration &&
		! purchase.is_hundred_year_domain &&
		! isCentennialPurchase( purchase ) &&
		! purchase.is_partner_managed &&
		! purchase.is_iap_purchase &&
		! isRemoved( purchase )
	);
}

function formatRenewalPrice( purchase: Purchase ): string {
	return formatCurrency( purchase.price_integer, purchase.currency_code, {
		isSmallestUnit: true,
		stripZeros: true,
	} );
}

/**
 * The auto-renew state shared by the Renewal card and the "Auto-renew is off"
 * notice. `isEnabled` reports the value being saved while the save is pending,
 * so the toggle moves straight away, and falls back to the stored value if the
 * save fails, with `failedValue` set to what could not be saved.
 */
export function useDomainAutoRenew( purchase: Purchase ) {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const isSplitCancelRemoveEnabled = useIsSplitCancelRemoveEnabled();
	const { mutate, isPending, variables, error, reset } = useMutation( {
		...userPurchaseSetAutoRenewQuery(),
		// Keep the mutation pending until the purchase is refetched, otherwise the
		// toggle snaps back to the old value between the save and the refetch.
		onSuccess: () => queryClient.invalidateQueries( userPurchasesQuery() ),
	} );

	const setAutoRenew = ( autoRenew: boolean ) => {
		if ( ! autoRenew && isSplitCancelRemoveEnabled ) {
			navigate( {
				to: cancelPurchaseRoute.fullPath,
				params: { purchaseId: purchase.ID },
				search: { intent: 'auto-renew' as const },
			} );
			return;
		}
		mutate( { purchaseId: purchase.ID, autoRenew } );
	};

	return {
		setAutoRenew,
		isPending,
		isEnabled: isPending && variables ? variables.autoRenew : purchase.is_auto_renew_enabled,
		failedValue: error ? variables?.autoRenew : undefined,
		dismissError: reset,
	};
}

export type DomainAutoRenew = ReturnType< typeof useDomainAutoRenew >;

function AddPaymentMethodButton( { purchase }: { purchase: Purchase } ) {
	return (
		<RouterLinkButton
			__next40pxDefaultSize
			variant="secondary"
			size="compact"
			to={ changePaymentMethodRoute.fullPath }
			params={ { purchaseId: purchase.ID } }
		>
			{ __( 'Add payment method' ) }
		</RouterLinkButton>
	);
}

function RenewNowLink( { purchase }: { purchase: Purchase } ) {
	const { recordTracksEvent } = useAnalytics();
	return (
		<UINotice.ActionLink
			href={ getRenewalUrlFromPurchase( purchase ) }
			onClick={ () =>
				recordTracksEvent( 'calypso_purchases_renew_now_click', {
					product_slug: purchase.product_slug,
					position: 'purchase-settings-auto-renew-off-notice',
				} )
			}
		>
			{ sprintf(
				// translators: %(price)s is the renewal price, like "$18"
				__( 'Renew now for %(price)s' ),
				{ price: formatRenewalPrice( purchase ) }
			) }
		</UINotice.ActionLink>
	);
}

export function AutoRenewOffNotice( {
	purchase,
	autoRenew,
}: {
	purchase: Purchase;
	autoRenew: DomainAutoRenew;
} ) {
	const locale = useLocale();
	const { user } = useAuth();
	const navigate = useNavigate();
	const canTurnOn = purchase.is_rechargeable && ! isAutoRenewToggleDisabled( purchase, user );

	let primaryAction = null;
	if ( canTurnOn ) {
		primaryAction = (
			<UINotice.ActionButton
				loading={ autoRenew.isPending }
				onClick={ () => autoRenew.setAutoRenew( true ) }
			>
				{ __( 'Turn on auto-renew' ) }
			</UINotice.ActionButton>
		);
	} else if ( ! purchase.is_rechargeable && isPurchaseOwner( purchase, user ) ) {
		primaryAction = (
			<UINotice.ActionButton
				onClick={ () =>
					navigate( {
						to: changePaymentMethodRoute.fullPath,
						params: { purchaseId: purchase.ID },
					} )
				}
			>
				{ __( 'Add payment method' ) }
			</UINotice.ActionButton>
		);
	}

	return (
		<Notice
			variant="warning"
			title={ __( 'Auto-renew is off' ) }
			actions={
				( primaryAction || purchase.can_explicit_renew ) && (
					<>
						{ primaryAction }
						{ purchase.can_explicit_renew && <RenewNowLink purchase={ purchase } /> }
					</>
				)
			}
		>
			{ createInterpolateElement(
				sprintf(
					// translators: %(domain)s is a domain name and %(date)s is a formatted date, like "4 September 2027"
					__(
						'<strong>%(domain)s</strong> expires on %(date)s. After that, anyone can register it.'
					),
					{
						domain: purchase.meta ?? '',
						date: formatDate( new Date( purchase.expiry_date ), locale, { dateStyle: 'long' } ),
					}
				),
				{ strong: <strong /> }
			) }
		</Notice>
	);
}

function useAutoRenewHelp( purchase: Purchase, autoRenew: DomainAutoRenew ): string[] {
	const locale = useLocale();
	const price = formatRenewalPrice( purchase );

	if ( autoRenew.isPending ) {
		return [ __( 'Saving…' ) ];
	}

	if ( ! autoRenew.isEnabled ) {
		return [
			sprintf(
				// translators: %(price)s is the yearly renewal price, like "$18"
				__(
					'Turn on to renew automatically, a month before the domain expires, for %(price)s per year. Excludes taxes.'
				),
				{ price }
			),
		];
	}

	if ( ! purchase.renew_date || ! isRenewingBeforeExpiration( purchase ) ) {
		return [];
	}

	const renews = sprintf(
		// translators: %(date)s is a formatted date, like "4 August 2027", and %(price)s is the renewal price, like "$18"
		__( 'Renews on %(date)s for %(price)s. Excludes taxes.' ),
		{
			date: formatDate( new Date( purchase.renew_date ), locale, { dateStyle: 'long' } ),
			price,
		}
	);
	if ( purchase.renew_date === purchase.expiry_date ) {
		return [ renews ];
	}
	return [
		renews,
		__(
			'We charge a month earlier so the domain never lapses, and each renewal adds a full year.'
		),
	];
}

function AutoRenewToggle( {
	purchase,
	autoRenew,
}: {
	purchase: Purchase;
	autoRenew: DomainAutoRenew;
} ) {
	const { user } = useAuth();
	const { isEnabled, isPending } = autoRenew;
	const help = useAutoRenewHelp( purchase, autoRenew );
	// Turning auto-renew on needs a payment method to charge.
	const needsPaymentMethod = ! purchase.is_rechargeable && ! purchase.is_auto_renew_enabled;

	return (
		<ToggleControl
			__nextHasNoMarginBottom
			label={ isEnabled ? __( 'Auto-renew on' ) : __( 'Auto-renew off' ) }
			checked={ isEnabled }
			disabled={ isPending || needsPaymentMethod || isAutoRenewToggleDisabled( purchase, user ) }
			onChange={ ( value: boolean ) => autoRenew.setAutoRenew( value ) }
			help={
				help.length > 0 && (
					<VStack spacing={ 0 }>
						{ help.map( ( line, index ) => (
							// Keyed by position so the text changes in place while saving.
							// eslint-disable-next-line react/no-array-index-key
							<span key={ index }>{ line }</span>
						) ) }
					</VStack>
				)
			}
		/>
	);
}

export function RenewalSection( {
	purchase,
	autoRenew,
}: {
	purchase: Purchase;
	autoRenew: DomainAutoRenew;
} ) {
	const { user } = useAuth();

	// Past expiry with no renewal attempts left, auto-renew and the payment
	// method no longer have any effect.
	if ( ! isPurchaseOwner( purchase, user ) || isExpiredWithNoAutoRenewAttemptsLeft( purchase ) ) {
		return null;
	}

	const { failedValue } = autoRenew;

	return (
		<VStack spacing={ 3 }>
			<SectionHeader title={ __( 'Renewal' ) } level={ 3 } />
			{ failedValue !== undefined && (
				<Notice variant="error" onClose={ autoRenew.dismissError }>
					{ failedValue
						? __( 'Auto-renew could not be turned on. Please try again.' )
						: __( 'Auto-renew could not be turned off. Please try again.' ) }
				</Notice>
			) }
			<ActionList>
				<ActionList.ActionItem
					title={ <AutoRenewToggle purchase={ purchase } autoRenew={ autoRenew } /> }
					actions={ null }
				/>
				{ ! purchase.is_rechargeable && (
					<ActionList.ActionItem
						title={ __( 'Auto-renew needs a payment method.' ) }
						actions={ <AddPaymentMethodButton purchase={ purchase } /> }
					/>
				) }
				{ purchase.is_rechargeable && purchase.is_auto_renew_enabled && (
					<ActionList.ActionItem
						title={ __( 'Payment method' ) }
						description={ <PurchasePaymentMethod purchase={ purchase } showUpdateButton /> }
						actions={ null }
					/>
				) }
			</ActionList>
		</VStack>
	);
}

function SiteValue( { site }: { site: Site } ) {
	if ( site.options?.is_domain_only ) {
		return <Text variant="muted">{ __( 'No site attached' ) }</Text>;
	}

	return (
		<HStack spacing={ 2 } expanded={ false }>
			<SiteIcon site={ site } size={ 24 } />
			<Text variant="muted">{ site.name }</Text>
		</HStack>
	);
}

export function DetailsSection( { purchase, site }: { purchase: Purchase; site?: Site } ) {
	const { user } = useAuth();

	return (
		<VStack spacing={ 3 }>
			<SectionHeader title={ __( 'Details' ) } level={ 3 } />
			<ActionList>
				{ site && (
					<ActionList.ActionItem title={ __( 'Site' ) } actions={ <SiteValue site={ site } /> } />
				) }
				<ActionList.ActionItem
					title={ __( 'Owner' ) }
					actions={
						<Text variant="muted">
							{ isPurchaseOwner( purchase, user )
								? user.display_name
								: __( 'Owned by a different user' ) }
						</Text>
					}
				/>
			</ActionList>
		</VStack>
	);
}

export function DangerZoneSection( { purchase }: { purchase: Purchase } ) {
	const { user } = useAuth();
	const navigate = useNavigate();

	if (
		! isPurchaseOwner( purchase, user ) ||
		purchase.is_host_managed ||
		! isManageableByUser( purchase )
	) {
		return null;
	}

	return (
		<VStack spacing={ 3 }>
			<SectionHeader title={ __( 'Danger zone' ) } level={ 3 } />
			<ActionList>
				<ActionList.ActionItem
					title={ __( 'Delete' ) }
					description={ __(
						'Remove this domain name permanently. It becomes available for anyone to register.'
					) }
					actions={
						<Button
							__next40pxDefaultSize
							variant="secondary"
							size="compact"
							isDestructive
							onClick={ () =>
								navigate( {
									to: cancelPurchaseRoute.fullPath,
									params: { purchaseId: purchase.ID },
									search: { intent: 'remove' as const },
								} )
							}
						>
							{ __( 'Delete' ) }
						</Button>
					}
				/>
			</ActionList>
		</VStack>
	);
}

export function DomainRegistrationSettings( {
	purchase,
	site,
}: {
	purchase: Purchase;
	site?: Site;
} ) {
	const autoRenew = useDomainAutoRenew( purchase );

	return (
		<VStack spacing={ 8 }>
			<PurchaseNotice
				purchase={ purchase }
				expiringNotice={ <AutoRenewOffNotice purchase={ purchase } autoRenew={ autoRenew } /> }
			/>
			<RenewalSection purchase={ purchase } autoRenew={ autoRenew } />
			<DetailsSection purchase={ purchase } site={ site } />
			<DangerZoneSection purchase={ purchase } />
		</VStack>
	);
}
