import { formatNumber } from '@automattic/number-formatters';
import { Popover, Icon } from '@wordpress/components';
import { type SortDirection, type View, type Fields } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { info } from '@wordpress/icons';
import { useState, type ReactNode } from 'react';
import { useAuth } from '../../app/auth';
import SiteIcon from '../../sites/site-icon';
import { ActiveSubscriptionDescription } from './active-subscription-description';
import { ActiveSubscriptionExpiry } from './active-subscription-expiry';
import { ActiveSubscriptionPaymentMethod } from './active-subscription-payment-method';
import { isRenewing } from './util';
import type { ActiveSubscription } from '../../data/me-active-subscriptions';
import type { StoredPaymentMethod } from '../../data/me-payment-methods';
import type { Site } from '../../data/site';

const purchasesWideFields = [ 'status', 'payment-method' ];
const purchasesDesktopFields = [ 'status' ];
const purchasesMobileFields: string[] = [];
const defaultPerPage = 10;
const defaultSort = {
	field: 'site',
	direction: 'desc' as SortDirection,
};
export const purchasesDataView: View = {
	type: 'table',
	page: 1,
	perPage: defaultPerPage,
	titleField: 'product',
	showTitle: true,
	mediaField: 'site',
	showMedia: true,
	descriptionField: 'description',
	showDescription: true,
	fields: purchasesDesktopFields,
	sort: defaultSort,
	layout: {},
};

function getDisplayName( item: ActiveSubscription ): string {
	if (
		item.is_jetpack_ai_product &&
		item.renewal_price_tier_usage_quantity &&
		item.price_tier_list?.length
	) {
		// translators: productName is the name of the product and quantity is a number
		return sprintf( __( '%(productName)s (%(quantity)s requests per month)' ), {
			productName: item.product_name,
			quantity: formatNumber( item.renewal_price_tier_usage_quantity ),
		} );
	}

	if (
		item.is_jetpack_stats_product &&
		! item.is_free_jetpack_stats_product &&
		item.renewal_price_tier_usage_quantity &&
		item.price_tier_list?.length
	) {
		// translators: productName is the name of the product and quantity is a number
		return sprintf( __( '%(productName)s (%(quantity)s views per month)' ), {
			productName: item.product_name,
			quantity: formatNumber( item.renewal_price_tier_usage_quantity ),
		} );
	}

	if (
		'wordpress_com_1gb_space_addon_yearly' === item.product_slug &&
		item.renewal_price_tier_usage_quantity
	) {
		// translators: productName is the name of the product and quantity is a number (GB stands for GigaBytes)
		return sprintf( __( '%(productName)s %(quantity)s GB' ), {
			productName: item.product_name,
			quantity: item.renewal_price_tier_usage_quantity,
		} );
	}

	if ( item.meta && ( item.is_domain_registration || item.is_domain ) ) {
		return item.meta;
	}
	return item.product_name;
}

export function getPurchaseUrl( item: ActiveSubscription ) {
	const siteUrl = item.site_slug || item.domain;
	const subscriptionId = item.ID;
	if ( ! siteUrl ) {
		// eslint-disable-next-line no-console
		console.error( 'Cannot display manage purchase page for subscription without site' );
		throw new Error( 'Cannot display manage purchase page for subscription without site' );
	}
	if ( ! subscriptionId ) {
		// eslint-disable-next-line no-console
		console.error( 'Cannot display manage purchase page for subscription without ID' );
		throw new Error( 'Cannot display manage purchase page for subscription without ID' );
	}
	return `/me/purchases/${ siteUrl }/${ subscriptionId }`;
}

function getAddPaymentMethodUrlFor( purchase: ActiveSubscription ): string {
	return `/me/purchases/${ purchase.site_slug ?? 'unknown' }/${ purchase.ID }/payment-method/add`;
}

function getUrlForSiteLevelView( siteId: number | string ): string {
	return `/v2/me/billing/active-subscriptions/${ siteId }`;
}

function InfoPopover( { children }: { children: ReactNode } ) {
	const [ isTooltipVisible, setIsTooltipVisible ] = useState( false );
	return (
		<span>
			<Icon icon={ info } onClick={ () => setIsTooltipVisible( ( val ) => ! val ) } />
			{ isTooltipVisible && <Popover>{ children }</Popover> }
		</span>
	);
}

function BackupPaymentMethodNotice() {
	const noticeText = createInterpolateElement(
		__( 'If the renewal fails, a <link>backup payment method</link> may be used.' ),
		{
			link: <a href="/me/purchases/payment-methods" />,
		}
	);
	return <InfoPopover>{ noticeText }</InfoPopover>;
}

function OwnerInfo( {
	purchase,
	isTransferredOwnership = false,
}: {
	purchase: ActiveSubscription;
	isTransferredOwnership?: boolean;
} ) {
	const { user } = useAuth();
	if ( String( user.ID ) === String( purchase.user_id ) ) {
		return null;
	}

	const tooltipContent = isTransferredOwnership ? (
		<span>
			{ createInterpolateElement(
				sprintf(
					// translators: domain is a domain name
					__(
						"This license was activated on <strong>%(domain)s</strong> by another user. If you haven't given the license to them on purpose, <link>contact our support team</link> for more assistance."
					),
					{
						domain: purchase.domain || purchase.site_slug || __( 'a site' ),
					}
				),
				{
					strong: <strong />,
					link: (
						<a
							href="https://jetpack.com/contact-support/?rel=support"
							target="_blank"
							rel="noopener noreferrer"
						/>
					),
				}
			) }
		</span>
	) : (
		<span>
			{ __(
				'To manage this subscription, log in to the WordPress.com account that purchased it or contact the owner.'
			) }
		</span>
	);

	return <InfoPopover>{ tooltipContent }</InfoPopover>;
}

export function getFields( {
	sites,
	paymentMethods,
}: {
	sites: Site[];
	paymentMethods: Array< StoredPaymentMethod >;
} ): Fields< ActiveSubscription > {
	const backupPaymentMethods = paymentMethods.filter(
		( paymentMethod ) => paymentMethod.is_backup === true
	);

	// No point in having a filter if there's only one site.
	const shouldAllowSiteFilter = sites.length > 1;
	return [
		{
			id: 'site',
			label: __( 'Site' ),
			type: 'text',
			enableGlobalSearch: true,
			enableSorting: true,
			enableHiding: false,
			...( shouldAllowSiteFilter
				? {
						elements: sites.map( ( site ) => {
							return { value: String( site.ID ), label: `${ site.name } (${ site.slug })` };
						} ),
						filterBy: { operators: [ 'isAny' ] },
				  }
				: { filterBy: false } ),
			getValue: ( { item }: { item: ActiveSubscription } ) => {
				// getValue must return a string because the DataViews search feature calls `trim()` on it.
				return String( item.blog_id );
			},
			// Render the site icon
			render: ( { item }: { item: ActiveSubscription } ) => {
				const site = sites.find( ( site ) => String( site.ID ) === item.blog_id );
				return (
					<a title={ __( 'Manage purchase' ) } href={ getPurchaseUrl( item ) }>
						{ site ? <SiteIcon site={ site } /> : item.blog_id },
					</a>
				);
			},
		},
		{
			id: 'product',
			label: __( 'Product' ),
			type: 'text',
			enableGlobalSearch: true,
			enableSorting: true,
			enableHiding: false,
			filterBy: false,
			getValue: ( { item }: { item: ActiveSubscription } ) => {
				const site = sites.find( ( site ) => String( site.ID ) === item.blog_id );
				// Render a bunch of things to make this easily searchable.
				return (
					getDisplayName( item ) +
					' ' +
					item.blogname +
					' ' +
					( item.site_slug || item.domain ) +
					' ' +
					( site?.URL ?? '' )
				);
			},
			render: ( { item }: { item: ActiveSubscription } ) => {
				// FIXME: handle transferred purchases
				const isTransferredOwnership = false;
				return (
					<div>
						{ isTransferredOwnership ? (
							getDisplayName( item ) + '&nbsp;'
						) : (
							<a title={ __( 'Manage purchase' ) } href={ getPurchaseUrl( item ) }>
								{ getDisplayName( item ) }
							</a>
						) }
						<OwnerInfo purchase={ item } isTransferredOwnership={ isTransferredOwnership } />
					</div>
				);
			},
		},
		{
			id: 'description',
			label: __( 'Description' ),
			type: 'text',
			enableGlobalSearch: true,
			enableSorting: true,
			enableHiding: false,
			filterBy: false,
			getValue: ( { item }: { item: ActiveSubscription } ) => {
				// Render a bunch of things to make this easily searchable.
				const site = sites.find( ( site ) => String( site.ID ) === item.blog_id );
				return item.blogname + ' ' + ( item.site_slug || item.domain ) + ' ' + ( site?.URL ?? '' );
			},
			render: ( { item }: { item: ActiveSubscription } ) => {
				const site = sites.find( ( site ) => String( site.ID ) === item.blog_id );
				return (
					<ActiveSubscriptionDescription
						purchase={ item }
						site={ site }
						getUrlForSiteLevelView={ getUrlForSiteLevelView }
					/>
				);
			},
		},
		{
			id: 'type',
			label: __( 'Type' ),
			enableHiding: false,
			enableSorting: true,
			type: 'text',
			elements: [
				{ value: 'domain', label: __( 'Domains' ) },
				{ value: 'plan', label: __( 'Plans' ) },
				{ value: 'other', label: __( 'Other' ) },
			],
			filterBy: { operators: [ 'is' ] },
			getValue: ( { item } ) => {
				if ( item.is_domain || item.is_domain_registration ) {
					return 'domain';
				}
				if ( item.product_type === 'bundle' ) {
					return 'plan';
				}
				return 'other';
			},
		},
		{
			id: 'expiring-soon',
			enableHiding: false,
			enableSorting: true,
			label: __( 'Expiring soon' ),
			type: 'text',
			elements: [
				{
					value: '7',
					// translators: %s: number of days
					label: sprintf( __( 'Expires in %(days)d days' ), { days: 7 } ),
				},
				{
					value: '14',
					// translators: %s: number of days
					label: sprintf( __( 'Expires in %(days)d days' ), { days: 14 } ),
				},
				{
					value: '30',
					// translators: %s: number of days
					label: sprintf( __( 'Expires in %(days)d days' ), { days: 30 } ),
				},
				{
					value: '60',
					// translators: %s: number of days
					label: sprintf( __( 'Expires in %(days)d days' ), { days: 60 } ),
				},
				{
					value: '365',
					// translators: %s: number of days
					label: sprintf( __( 'Expires in %(days)d days' ), { days: 365 } ),
				},
			],
			filterBy: { operators: [ 'is' ] },
			getValue: ( { item } ) => {
				const now = Date.now();
				const expiryDate = Date.parse( item.expiry_date );
				if ( ! item.is_renewable || ! expiryDate || expiryDate < now ) {
					return 'not-expiring-soon';
				}
				const msPerDay = 86_400_000;
				const msTilExpiry = expiryDate - now;
				if ( msTilExpiry <= 7 * msPerDay ) {
					return '7';
				}
				if ( msTilExpiry <= 14 * msPerDay ) {
					return '14';
				}
				if ( msTilExpiry <= 30 * msPerDay ) {
					return '30';
				}
				if ( msTilExpiry <= 60 * msPerDay ) {
					return '60';
				}
				if ( msTilExpiry <= 365 * msPerDay ) {
					return '365';
				}
				return 'not-expiring-soon';
			},
		},
		{
			id: 'status',
			label: __( 'Expires/Renews on' ),
			type: 'text',
			enableGlobalSearch: true,
			enableSorting: true,
			enableHiding: false,
			filterBy: false,
			getValue: ( { item }: { item: ActiveSubscription } ) => {
				if ( item.expiry_status === 'expired' ) {
					// Prefix expired items with a z so they sort to the end of the list.
					return 'zzz ' + item.expiry_status + ' ' + item.expiry_date;
				}
				// Include date in value to sort similar expiries together.
				return item.expiry_date + ' ' + item.expiry_status;
			},
			render: ( { item }: { item: ActiveSubscription } ) => {
				const site = sites.find( ( site ) => String( site.ID ) === item.blog_id );
				return (
					<div>
						<ActiveSubscriptionExpiry purchase={ item } isDisconnectedSite={ ! site } />
					</div>
				);
			},
		},
		{
			id: 'payment-method',
			label: __( 'Payment method' ),
			type: 'text',
			enableGlobalSearch: true,
			enableSorting: true,
			enableHiding: false,
			filterBy: false,
			getValue: ( { item }: { item: ActiveSubscription } ) => {
				// Allows sorting by card number or payment partner (eg: `type === 'paypal'`).
				return item.expiry_status === 'expired'
					? // Do not return card number for expired purchases because it
					  // will not be displayed so it will look wierd if we sort
					  // expired purchases with active ones that have the same card.
					  'expired'
					: item.payment_details ?? item.payment_card_type ?? 'no-payment-method';
			},
			render: ( { item }: { item: ActiveSubscription } ) => {
				let isBackupMethodAvailable = false;
				if ( backupPaymentMethods ) {
					const backupPaymentMethodsWithoutCurrentPurchase = backupPaymentMethods.filter(
						// A payment method is only a back up if it isn't already assigned to the current purchase
						( paymentMethod ) => item.stored_details_id !== paymentMethod.stored_details_id
					);
					isBackupMethodAvailable = backupPaymentMethodsWithoutCurrentPurchase.length >= 1;
				}
				const site = sites.find( ( site ) => String( site.ID ) === item.blog_id );
				return (
					<div>
						<ActiveSubscriptionPaymentMethod
							purchase={ item }
							isDisconnectedSite={ ! site }
							getAddPaymentMethodUrlFor={ getAddPaymentMethodUrlFor }
						/>
						{ isBackupMethodAvailable && isRenewing( item ) && <BackupPaymentMethodNotice /> }
					</div>
				);
			},
		},
	];
}

export const getItemId = ( item: ActiveSubscription ) => {
	return item.ID.toString();
};

export function adjustViewFieldsForWidth(
	width: number,
	setView: ( setter: View | ( ( view: View ) => View ) ) => void
): void {
	if ( width >= 1280 ) {
		setView( ( view ) => {
			if ( view.fields?.length !== purchasesWideFields.length ) {
				return {
					...view,
					fields: purchasesWideFields,
				};
			}
			return view;
		} );
		return;
	}
	if ( width >= 960 ) {
		setView( ( view ) => {
			if ( view.fields?.length !== purchasesDesktopFields.length ) {
				return {
					...view,
					fields: purchasesDesktopFields,
				};
			}
			return view;
		} );
		return;
	}
	if ( width < 960 ) {
		setView( ( view ) => {
			if ( view.fields?.length !== purchasesMobileFields.length ) {
				return {
					...view,
					fields: purchasesMobileFields,
				};
			}
			return view;
		} );
		return;
	}
}
