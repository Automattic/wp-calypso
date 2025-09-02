import { JETPACK_CONTACT_SUPPORT } from '@automattic/urls';
import { Link, useNavigate } from '@tanstack/react-router';
import { Popover, Icon } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { info } from '@wordpress/icons';
import { useState, useMemo } from 'react';
import akismetIcon from 'calypso/assets/images/icons/akismet-icon.svg';
import jetpackIcon from 'calypso/assets/images/icons/jetpack-icon.svg';
import passportIcon from 'calypso/assets/images/icons/passport-icon.svg';
import { useAuth } from '../../app/auth';
import { PurchaseExpiryStatus } from '../../components/purchase-expiry-status';
import SiteIcon from '../../sites/site-icon';
import {
	isRenewing,
	isTransferredOwnership,
	isAkismetTemporarySitePurchase,
	isMarketplaceTemporarySitePurchase,
	getTitleForDisplay,
} from '../../utils/purchase';
import { PurchasePaymentMethod } from './purchase-payment-method';
import { PurchaseProduct } from './purchase-product';
import { getPurchaseUrl, getAddPaymentMethodUrlFor } from './urls';
import type { StoredPaymentMethod, Purchase, Site } from '@automattic/api-core';
import type { SortDirection, View, Fields } from '@wordpress/dataviews';
import type { ReactNode } from 'react';

import './style.scss';

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
	search: '',
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

function InfoPopover( { children }: { children: ReactNode } ) {
	const [ isTooltipVisible, setIsTooltipVisible ] = useState( false );
	return (
		<span>
			<Icon icon={ info } onClick={ () => setIsTooltipVisible( ( val ) => ! val ) } />
			{ isTooltipVisible && <Popover>{ children }</Popover> }
		</span>
	);
}

function PurchaseItemSiteIcon( { site, purchase }: { site?: Site; purchase: Purchase } ) {
	const size = 36;

	if (
		purchase.product_type === 'jetpack' ||
		purchase.is_jetpack_ai_product ||
		purchase.is_jetpack_stats_product ||
		purchase.is_free_jetpack_stats_product
	) {
		return (
			<div>
				<img
					src={ jetpackIcon }
					alt="Jetpack icon"
					style={ { width: size, height: size, minWidth: size } }
				/>
			</div>
		);
	}

	if (
		isMarketplaceTemporarySitePurchase( purchase ) &&
		purchase.product_slug.startsWith( 'passport' )
	) {
		return (
			<div>
				<img
					src={ passportIcon }
					alt="Passport icon"
					style={ { width: size, height: size, minWidth: size } }
				/>
			</div>
		);
	}

	if ( isAkismetTemporarySitePurchase( purchase ) ) {
		return (
			<div>
				<img
					src={ akismetIcon }
					alt="Akismet icon"
					style={ { width: size, height: size, minWidth: size } }
				/>
			</div>
		);
	}

	if ( ! site ) {
		return (
			<div>
				<img
					src={ jetpackIcon }
					alt="No site icon"
					style={ { width: size, height: size, minWidth: size } }
				/>
			</div>
		);
	}

	return (
		<div>
			<SiteIcon site={ site } size={ size } />
		</div>
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
	purchase: Purchase;
	isTransferredOwnership?: boolean;
} ) {
	const { user } = useAuth();
	if ( String( user.ID ) === String( purchase.user_id ) ) {
		return null;
	}

	const tooltipContent = isTransferredOwnership ? (
		<span>
			{ createInterpolateElement(
				// translators: domain is a domain name
				__(
					"This license was activated on <domain /> by another user. If you haven't given the license to them on purpose, <link>contact our support team</link> for more assistance."
				),
				{
					domain: <strong>{ purchase.domain || purchase.site_slug || __( 'a site' ) }</strong>,
					link: <a href={ JETPACK_CONTACT_SUPPORT } target="_blank" rel="noopener noreferrer" />,
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
	transferredPurchases,
	filterViewBySite,
}: {
	sites: Site[];
	paymentMethods: Array< StoredPaymentMethod >;
	transferredPurchases: Array< Purchase >;
	filterViewBySite: ( site: Site ) => void;
} ): Fields< Purchase > {
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
			getValue: ( { item }: { item: Purchase } ) => {
				// getValue must return a string because the DataViews search feature calls `trim()` on it.
				return String( item.blog_id );
			},
			// Render the site icon
			render: ( { item }: { item: Purchase } ) => {
				const site = sites.find( ( site ) => site.ID === item.blog_id );
				return (
					<Link to={ getPurchaseUrl( item ) } title={ __( 'Manage purchase' ) }>
						<PurchaseItemSiteIcon purchase={ item } site={ site } />
					</Link>
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
			getValue: ( { item }: { item: Purchase } ) => {
				const site = sites.find( ( site ) => site.ID === item.blog_id );
				// Render a bunch of things to make this easily searchable.
				return (
					getTitleForDisplay( item ) +
					' ' +
					item.blogname +
					' ' +
					( item.site_slug || item.domain ) +
					' ' +
					( site?.URL ?? '' )
				);
			},
			render: ( { item }: { item: Purchase } ) => {
				const isTransferred = isTransferredOwnership( item.ID, transferredPurchases );
				return (
					<div>
						{ isTransferred ? (
							getTitleForDisplay( item ) + '&nbsp;'
						) : (
							<Link to={ getPurchaseUrl( item ) } title={ __( 'Manage purchase' ) }>
								{ getTitleForDisplay( item ) }
							</Link>
						) }
						<OwnerInfo purchase={ item } isTransferredOwnership={ isTransferred } />
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
			getValue: ( { item }: { item: Purchase } ) => {
				// Render a bunch of things to make this easily searchable.
				const site = sites.find( ( site ) => site.ID === item.blog_id );
				return item.blogname + ' ' + ( item.site_slug || item.domain ) + ' ' + ( site?.URL ?? '' );
			},
			render: ( { item }: { item: Purchase } ) => {
				const site = sites.find( ( site ) => site.ID === item.blog_id );
				return (
					<PurchaseProduct purchase={ item } site={ site } filterViewBySite={ filterViewBySite } />
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
			getValue: ( { item }: { item: Purchase } ) => {
				if ( item.expiry_status === 'expired' ) {
					// Prefix expired items with a z so they sort to the end of the list.
					return 'zzz ' + item.expiry_status + ' ' + item.expiry_date;
				}
				// Include date in value to sort similar expiries together.
				return item.expiry_date + ' ' + item.expiry_status;
			},
			render: ( { item }: { item: Purchase } ) => {
				const site = sites.find( ( site ) => site.ID === item.blog_id );
				return (
					<div>
						<PurchaseExpiryStatus purchase={ item } isDisconnectedSite={ ! site } />
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
			getValue: ( { item }: { item: Purchase } ) => {
				// Allows sorting by card number or payment partner (eg: `type === 'paypal'`).
				return item.expiry_status === 'expired'
					? // Do not return card number for expired purchases because it
					  // will not be displayed so it will look wierd if we sort
					  // expired purchases with active ones that have the same card.
					  'expired'
					: item.payment_details ?? item.payment_card_type ?? 'no-payment-method';
			},
			render: ( { item }: { item: Purchase } ) => {
				let isBackupMethodAvailable = false;
				if ( backupPaymentMethods ) {
					const backupPaymentMethodsWithoutCurrentPurchase = backupPaymentMethods.filter(
						// A payment method is only a back up if it isn't already assigned to the current purchase
						( paymentMethod ) => item.stored_details_id !== paymentMethod.stored_details_id
					);
					isBackupMethodAvailable = backupPaymentMethodsWithoutCurrentPurchase.length >= 1;
				}
				const site = sites.find( ( site ) => site.ID === item.blog_id );
				return (
					<div>
						<PurchasePaymentMethod
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

export const getItemId = ( purchase: Purchase ) => {
	return purchase.ID.toString();
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

export function usePurchasesListActions( {
	transferredPurchases,
}: {
	transferredPurchases: Purchase[];
} ) {
	const navigate = useNavigate();
	return useMemo(
		() => [
			{
				id: 'manage-purchase',
				label: __( 'Manage purchase' ),
				isEligible: ( item: Purchase ) => {
					// Hide manage button for transferred ownership purchases
					const hasTransferredOwnership = isTransferredOwnership(
						item.ID,
						transferredPurchases ?? []
					);
					return Boolean( item.domain && item.ID ) && ! hasTransferredOwnership;
				},
				callback: ( items: Purchase[] ) => {
					const item = items[ 0 ];
					navigate( {
						to: getPurchaseUrl( item ),
					} );
				},
			},
		],
		[ transferredPurchases, navigate ]
	);
}
