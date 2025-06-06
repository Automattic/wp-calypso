import page from '@automattic/calypso-router';
import { Purchases, SiteDetails } from '@automattic/data-stores';
import { Button } from '@wordpress/components';
import { Fields } from '@wordpress/dataviews';
import { LocalizeProps } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { StoredPaymentMethod } from 'calypso/lib/checkout/payment-methods';
import { getDisplayName, isExpired, isRenewing, purchaseType } from 'calypso/lib/purchases';
import { MembershipSubscription } from 'calypso/lib/purchases/types';
import { useSelector } from 'calypso/state';
import { getSite } from 'calypso/state/sites/selectors';
import { Icon, MembershipType, MembershipTerms } from '../membership-item';
import {
	PurchaseItemSiteIcon,
	PurchaseItemProduct,
	PurchaseItemStatus,
	PurchaseItemPaymentMethod,
	BackupPaymentMethodNotice,
} from '../purchase-item';
import OwnerInfo from '../purchase-item/owner-info';

function PurchaseItemRowProduct( props: {
	purchase: Purchases.Purchase;
	translate: LocalizeProps[ 'translate' ];
} ) {
	const { purchase, translate } = props;
	const site = useSelector( ( state ) => getSite( state, purchase.siteId ?? 0 ) );
	const slug = site?.domain ?? undefined;
	return (
		<PurchaseItemProduct
			purchase={ purchase }
			site={ site }
			translate={ translate }
			slug={ slug }
			showSite
			isDisconnectedSite={ ! site }
		/>
	);
}

function PurchaseItemRowStatus( props: {
	purchase: Purchases.Purchase;
	translate: LocalizeProps[ 'translate' ];
	moment: ReturnType< typeof useLocalizedMoment >;
	isJetpack?: boolean;
	isDisconnectedSite?: boolean;
} ) {
	const { purchase, translate, moment, isJetpack, isDisconnectedSite } = props;

	return (
		<div className="purchase-item__status purchases-layout__status">
			<PurchaseItemStatus
				purchase={ purchase }
				translate={ translate }
				moment={ moment }
				isJetpack={ isJetpack }
				isDisconnectedSite={ isDisconnectedSite }
			/>
		</div>
	);
}

export function getPurchasesFieldDefinitions( {
	translate,
	moment,
	paymentMethods,
	sites,
	fieldIds,
}: {
	translate: LocalizeProps[ 'translate' ];
	moment: ReturnType< typeof useLocalizedMoment >;
	paymentMethods: Array< StoredPaymentMethod >;
	sites: SiteDetails[];
	fieldIds?: string[];
} ): Fields< Purchases.Purchase > {
	const backupPaymentMethods = paymentMethods.filter(
		( paymentMethod ) => paymentMethod.is_backup === true
	);

	const goToPurchase = ( item: Purchases.Purchase ) => {
		const siteUrl = item.domain;
		const subscriptionId = item.id;
		if ( ! siteUrl ) {
			// eslint-disable-next-line no-console
			console.error( 'Cannot display manage purchase page for subscription without site' );
			return;
		}
		if ( ! subscriptionId ) {
			// eslint-disable-next-line no-console
			console.error( 'Cannot display manage purchase page for subscription without ID' );
			return;
		}
		page( `/me/purchases/${ siteUrl }/${ subscriptionId }` );
	};

	const fields: Fields< Purchases.Purchase > = [
		{
			id: 'purchase-id',
			label: 'Purchase ID',
			type: 'text',
			enableGlobalSearch: false,
			enableSorting: false,
			enableHiding: false,
			getValue: ( { item }: { item: Purchases.Purchase } ) => {
				// getValue must return a string because the DataViews search feature calls `trim()` on it.
				return String( item.id );
			},
		},
		{
			id: 'site',
			label: translate( 'Site' ),
			type: 'text',
			enableGlobalSearch: true,
			enableSorting: true,
			enableHiding: false,
			elements: ( () => {
				if ( sites.length < 2 ) {
					// No point in having a filter if there's only one site.
					return undefined;
				}
				return sites.map( ( site ) => {
					return { value: String( site.ID ), label: `${ site.name } (${ site.domain })` };
				} );
			} )(),
			filterBy: { operators: [ 'is' ] },
			getValue: ( { item }: { item: Purchases.Purchase } ) => {
				// getValue must return a string because the DataViews search feature calls `trim()` on it.
				return String( item.siteId );
			},
			// Render the site icon
			render: ( { item }: { item: Purchases.Purchase } ) => {
				const site = { ID: item.siteId };
				return (
					<Button
						variant="link"
						title={ translate( 'Manage purchase', { textOnly: true } ) }
						label={ translate( 'Manage purchase', { textOnly: true } ) }
						onClick={ () => goToPurchase( item ) }
					>
						<PurchaseItemSiteIcon site={ site } purchase={ item } />
					</Button>
				);
			},
		},
		{
			id: 'product',
			label: translate( 'Product' ),
			type: 'text',
			enableGlobalSearch: true,
			enableSorting: true,
			enableHiding: false,
			getValue: ( { item }: { item: Purchases.Purchase } ) => {
				// Render a bunch of things to make this easily searchable.
				const site = sites.find( ( site ) => site.ID === item.siteId );
				return (
					getDisplayName( item ) +
					' ' +
					purchaseType( item ) +
					' ' +
					item.siteName +
					' ' +
					item.domain +
					' ' +
					site?.URL
				);
			},
			render: ( { item }: { item: Purchases.Purchase } ) => {
				return (
					<div className="purchase-item__information purchases-layout__information">
						<div className="purchase-item__title">
							<Button
								variant="link"
								title={ translate( 'Manage purchase', { textOnly: true } ) }
								label={ translate( 'Manage purchase', { textOnly: true } ) }
								onClick={ () => goToPurchase( item ) }
							>
								{ getDisplayName( item ) }
							</Button>
							&nbsp;
							<OwnerInfo purchase={ item } />
						</div>
						<div className="purchase-item__purchase-type">
							<PurchaseItemRowProduct purchase={ item } translate={ translate } />
						</div>
					</div>
				);
			},
		},
		{
			id: 'type',
			label: translate( 'Type' ),
			type: 'text',
			elements: [
				{ value: 'domain', label: translate( 'Domains' ) },
				{ value: 'plan', label: translate( 'Plan' ) },
				{ value: 'other', label: translate( 'Other' ) },
			],
			filterBy: { operators: [ 'is' ] },
			getValue: ( { item } ) => {
				if ( item.isDomain || item.isDomainRegistration ) {
					return 'domain';
				}
				if ( item.productType === 'bundle' ) {
					return 'plan';
				}
				return 'other';
			},
		},
		{
			id: 'expring-soon',
			label: translate( 'Expiring soon' ),
			type: 'text',
			elements: [
				{ value: 'expiring-soon', label: translate( 'Expiring soon' ) },
				{ value: 'not-expiring-soon', label: translate( 'Other' ) },
			],
			filterBy: { operators: [ 'is' ] },
			getValue: ( { item } ) => {
				const expiryDate = Date.parse( item.expiryDate );
				const now = Date.now();
				const msPerDay = 86_400_000;
				// @todo: this should be updated to be product-specific since
				// some products renew 30 days in advance.
				const expireSoonMs = msPerDay * 7;
				if (
					item.isRenewable &&
					expiryDate &&
					expiryDate > now &&
					expiryDate - now < expireSoonMs
				) {
					return 'expiring-soon';
				}
				return 'not-expiring-soon';
			},
		},
		{
			id: 'status',
			label: translate( 'Status' ),
			type: 'text',
			enableGlobalSearch: true,
			enableSorting: true,
			enableHiding: false,
			getValue: ( { item }: { item: Purchases.Purchase } ) => {
				if ( isExpired( item ) ) {
					// Prefix expired items with a z so they sort to the end of the list.
					return 'zzz ' + item.expiryStatus + ' ' + item.expiryDate;
				}
				// Include date in value to sort similar expiries together.
				return item.expiryDate + ' ' + item.expiryStatus;
			},
			render: ( { item }: { item: Purchases.Purchase } ) => {
				return (
					<PurchaseItemRowStatus purchase={ item } translate={ translate } moment={ moment } />
				);
			},
		},
		{
			id: 'payment-method',
			label: translate( 'Payment method' ),
			type: 'text',
			enableGlobalSearch: true,
			enableSorting: true,
			enableHiding: false,
			getValue: ( { item }: { item: Purchases.Purchase } ) => {
				// Allows sorting by card number or payment partner (eg: `type === 'paypal'`).
				return isExpired( item )
					? // Do not return card number for expired purchases because it
					  // will not be displayed so it will look wierd if we sort
					  // expired purchases with active ones that have the same card.
					  'expired'
					: item.payment.creditCard?.number ?? item.payment.type ?? 'no-payment-method';
			},
			render: ( { item }: { item: Purchases.Purchase } ) => {
				let isBackupMethodAvailable = false;

				if ( backupPaymentMethods ) {
					const backupPaymentMethodsWithoutCurrentPurchase = backupPaymentMethods.filter(
						// A payment method is only a back up if it isn't already assigned to the current purchase
						( paymentMethod ) => item.payment.storedDetailsId !== paymentMethod.stored_details_id
					);

					isBackupMethodAvailable = backupPaymentMethodsWithoutCurrentPurchase.length >= 1;
				}

				return (
					<div className="purchase-item__payment-method">
						<PurchaseItemPaymentMethod purchase={ item } translate={ translate } />
						{ isBackupMethodAvailable && isRenewing( item ) && <BackupPaymentMethodNotice /> }
					</div>
				);
			},
		},
	];
	return fields.filter( ( field ) => fieldIds?.includes( field.id ) ?? true );
}

export function getMembershipsFieldDefinitions( {
	translate,
}: {
	translate: LocalizeProps[ 'translate' ];
} ): Fields< MembershipSubscription > {
	return [
		{
			id: 'site',
			label: translate( 'Site' ),
			type: 'text',
			enableGlobalSearch: true,
			enableSorting: false,
			enableHiding: false,
			getValue: ( { item }: { item: MembershipSubscription } ) => {
				return item.site_id + ' ' + item.site_title + ' ' + item.site_url;
			},
			// Render the site icon
			render: ( { item }: { item: MembershipSubscription } ) => {
				return (
					<div className="membership-item__site purchases-layout__site">
						<Icon subscription={ item } />
					</div>
				);
			},
		},
		{
			id: 'product',
			label: translate( 'Product' ),
			type: 'text',
			enableGlobalSearch: true,
			enableSorting: true,
			enableHiding: false,
			getValue: ( { item }: { item: MembershipSubscription } ) => {
				return item.title + ' ' + item.site_title + ' ' + item.site_url;
			},
			render: ( { item }: { item: MembershipSubscription } ) => {
				return (
					<div className="membership-item__information purchase-item__information purchases-layout__information">
						<div className="membership-item__title purchase-item__title">{ item.title }</div>
						<div className="membership-item__purchase-type purchase-item__purchase-type">
							<MembershipType subscription={ item } />
						</div>
					</div>
				);
			},
		},
		{
			id: 'status',
			label: translate( 'Status' ),
			type: 'text',
			enableGlobalSearch: true,
			enableSorting: false,
			enableHiding: false,
			getValue: ( { item }: { item: MembershipSubscription } ) => {
				return item.end_date ?? '';
			},
			render: ( { item }: { item: MembershipSubscription } ) => {
				return (
					<div className="membership-item__status purchase-item__status purchases-layout__status">
						<MembershipTerms subscription={ item } />
					</div>
				);
			},
		},
	];
}
