import { Fields } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { fixMe, LocalizeProps } from 'i18n-calypso';
import akismetIcon from 'calypso/assets/images/icons/akismet-icon.svg';
import jetpackIcon from 'calypso/assets/images/icons/jetpack-icon.svg';
import passportIcon from 'calypso/assets/images/icons/passport-icon.svg';
import { PurchaseExpiryStatus } from 'calypso/dashboard/components/purchase-expiry-status';
import SiteIcon from 'calypso/dashboard/components/site-icon';
import {
	MonetizeSubscriptionIcon,
	MonetizeSubscriptionType,
	MonetizeSubscriptionTerms,
} from 'calypso/dashboard/me/billing-monetize-subscriptions/monetize-item';
import { BillingPurchaseInfoPopover } from 'calypso/dashboard/me/billing-purchases/dataviews';
import { PaymentMethodImage } from 'calypso/dashboard/me/billing-purchases/payment-method-image';
import {
	isExpired,
	isRenewing,
	isTransferredOwnership,
	getTitleForListDisplay,
	getSubtitleForDisplay,
	isAkismetHoldingSitePurchase,
	isMarketplaceHoldingSitePurchase,
} from 'calypso/dashboard/utils/purchase';
import { logToLogstash } from 'calypso/lib/logstash';
import { GetManagePurchaseUrlFor } from 'calypso/lib/purchases/types';
import { useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import type {
	Purchase,
	MonetizeSubscription,
	Site,
	StoredPaymentMethod,
} from '@automattic/api-core';

function PurchaseItemSiteIcon( { site, purchase }: { site?: Site; purchase: Purchase } ) {
	const size = 36;

	if (
		purchase.product_type === 'jetpack' ||
		purchase.is_jetpack_ai_product ||
		purchase.is_jetpack_stats_product ||
		purchase.is_free_jetpack_stats_product
	) {
		return (
			<img
				src={ jetpackIcon }
				alt="Jetpack icon"
				style={ { width: size, height: size, minWidth: size } }
			/>
		);
	}

	if (
		isMarketplaceHoldingSitePurchase( purchase ) &&
		purchase.product_slug.startsWith( 'passport' )
	) {
		return (
			<img
				src={ passportIcon }
				alt="Passport icon"
				style={ { width: size, height: size, minWidth: size } }
			/>
		);
	}

	if ( isAkismetHoldingSitePurchase( purchase ) ) {
		return (
			<img
				src={ akismetIcon }
				alt="Akismet icon"
				style={ { width: size, height: size, minWidth: size } }
			/>
		);
	}

	if ( ! site ) {
		return (
			<img
				src={ jetpackIcon }
				alt="No site icon"
				style={ { width: size, height: size, minWidth: size } }
			/>
		);
	}

	return <SiteIcon site={ site } size={ size } />;
}

function BackupPaymentMethodNotice( { translate }: { translate: LocalizeProps[ 'translate' ] } ) {
	const noticeText = createInterpolateElement(
		String(
			translate( 'If the renewal fails, a <link>backup payment method</link> may be used.' )
		),
		{
			link: <a href="/me/purchases/payment-methods" />,
		}
	);
	return <BillingPurchaseInfoPopover>{ noticeText }</BillingPurchaseInfoPopover>;
}

function OwnerInfo( {
	purchase,
	isTransferredOwnership: isTransferred = false,
	translate,
}: {
	purchase: Purchase;
	isTransferredOwnership?: boolean;
	translate: LocalizeProps[ 'translate' ];
} ) {
	const currentUserId = useSelector( getCurrentUserId );
	if ( String( currentUserId ) === String( purchase.user_id ) ) {
		return null;
	}

	const JETPACK_CONTACT_SUPPORT = 'https://jetpack.com/contact-support/';

	const tooltipContent = isTransferred ? (
		<span>
			{ createInterpolateElement(
				String(
					translate(
						"This license was activated on <domain /> by another user. If you haven't given the license to them on purpose, <link>contact our support team</link> for more assistance."
					)
				),
				{
					domain: (
						<strong>{ purchase.domain || purchase.site_slug || translate( 'a site' ) }</strong>
					),
					link: <a href={ JETPACK_CONTACT_SUPPORT } target="_blank" rel="noopener noreferrer" />,
				}
			) }
		</span>
	) : (
		<span>
			{ translate(
				'To manage this subscription, log in to the WordPress.com account that purchased it or contact the owner.'
			) }
		</span>
	);

	return <BillingPurchaseInfoPopover>{ tooltipContent }</BillingPurchaseInfoPopover>;
}

function PurchaseItemRowProduct( {
	purchase,
	sites,
	translate,
}: {
	purchase: Purchase;
	sites: Site[];
	translate: LocalizeProps[ 'translate' ];
} ) {
	if ( purchase.is_attached_to_holding_site ) {
		return null;
	}

	const site = sites.find( ( s ) => s.ID === purchase.blog_id );
	const productType = purchase.is_domain_registration ? null : getSubtitleForDisplay( purchase );

	if ( site ) {
		if ( productType && site.name && site.slug ) {
			return (
				<div>
					{ translate( '%(purchaseType)s for {{siteName/}} ({{siteDomain/}})', {
						args: { purchaseType: productType },
						components: {
							siteName: (
								<a href={ 'https://' + site.slug } rel="noreferrer">
									{ site.name }
								</a>
							),
							siteDomain: (
								<a href={ 'https://' + site.slug } rel="noreferrer">
									{ site.slug }
								</a>
							),
						},
					} ) }
				</div>
			);
		}

		if ( productType && site.slug ) {
			return (
				<div>
					{ translate( '%(purchaseType)s for {{siteDomain/}}', {
						args: { purchaseType: productType },
						components: {
							siteDomain: (
								<a href={ 'https://' + site.slug } rel="noreferrer">
									{ site.slug }
								</a>
							),
						},
					} ) }
				</div>
			);
		}
	}

	if ( ! site && productType ) {
		return (
			<div>
				{ translate(
					// translators: purchaseType is the product name and siteDomain is the site domain
					'%(purchaseType)s for %(siteDomain)s',
					{
						args: {
							purchaseType: productType,
							siteDomain: purchase.domain,
						},
					}
				) }
			</div>
		);
	}

	return productType ? <div>{ productType }</div> : null;
}

function PurchaseItemPaymentMethod( {
	purchase,
	sites,
	translate,
}: {
	purchase: Purchase;
	sites: Site[];
	translate: LocalizeProps[ 'translate' ];
} ) {
	const site = sites.find( ( s ) => s.ID === purchase.blog_id );
	const isSiteMissing = ! site;

	if ( purchase.expiry_status === 'included' ) {
		return <>{ translate( 'Included with Plan' ) }</>;
	}

	if ( purchase.is_iap_purchase ) {
		return (
			<div>
				<span>{ translate( 'In-App Purchase' ) }</span>
			</div>
		);
	}

	if (
		isExpired( purchase ) ||
		( purchase.partner_name && purchase.meta !== 'is-a4a' ) ||
		purchase.product_slug === 'ak_free_yearly' ||
		( purchase.product_slug === 'ak_ent_yearly' && purchase.amount === 0 ) ||
		( isSiteMissing && ! purchase.is_domain && purchase.meta !== 'is-a4a' )
	) {
		return null;
	}

	if ( ! purchase.is_rechargeable ) {
		return (
			<div>
				<a href={ `/me/purchases/${ purchase.site_slug }/${ purchase.ID }/payment-method/add` }>
					{ translate( 'Add payment method' ) }
				</a>
			</div>
		);
	}

	if ( ! isRenewing( purchase ) ) {
		return null;
	}

	if ( purchase.payment_type === 'credit_card' && purchase.payment_card_id ) {
		const paymentMethodType = purchase.payment_card_display_brand
			? purchase.payment_card_display_brand
			: purchase.payment_card_type || purchase.payment_card_processor || '';

		const maskedCardNumber = translate(
			/** Translators: %s is last four digits of card number */
			'**** **** **** %(last4)s',
			{ args: { last4: purchase.payment_details ?? '' } }
		);

		return (
			<div className="purchase-item__payment-method-wrapper">
				<PaymentMethodImage paymentMethodType={ paymentMethodType } />
				<span>{ maskedCardNumber }</span>
			</div>
		);
	}

	if ( purchase.payment_type === 'paypal' ) {
		return (
			<div className="purchase-item__payment-method-wrapper">
				<PaymentMethodImage paymentMethodType={ purchase.payment_type } />
				<span>PayPal { purchase.payment_name }</span>
			</div>
		);
	}

	if ( purchase.payment_type === 'upi' ) {
		return <PaymentMethodImage paymentMethodType={ purchase.payment_type } />;
	}

	return null;
}

export function getPurchasesFieldDefinitions( {
	translate,
	paymentMethods,
	sites,
	getManagePurchaseUrlFor,
	transferredOwnershipPurchases = [],
}: {
	translate: LocalizeProps[ 'translate' ];
	paymentMethods: StoredPaymentMethod[];
	sites: Site[];
	getManagePurchaseUrlFor: GetManagePurchaseUrlFor;
	transferredOwnershipPurchases?: Purchase[];
} ): Fields< Purchase > {
	const backupPaymentMethods = paymentMethods.filter(
		( paymentMethod ) => paymentMethod.is_backup === true
	);

	const getPurchaseUrl = ( item: Purchase ) => {
		const siteUrl = item.site_slug || item.domain;
		const subscriptionId = item.ID;
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
		return getManagePurchaseUrlFor( siteUrl, subscriptionId );
	};

	// No point in having a filter if there's only one site.
	const shouldAllowSiteFiltering = sites.length > 1;
	const fields: Fields< Purchase > = [
		{
			id: 'site',
			label: translate( 'Site' ),
			type: 'text',
			enableGlobalSearch: true,
			enableSorting: true,
			enableHiding: false,
			elements: shouldAllowSiteFiltering
				? sites.map( ( site ) => ( {
						value: String( site.ID ),
						label: `${ site.name } (${ site.slug })`,
				  } ) )
				: undefined,
			filterBy: shouldAllowSiteFiltering ? { operators: [ 'isAny' ] } : false,
			getValue: ( { item }: { item: Purchase } ) => {
				// getValue must return a string because the DataViews search feature calls `trim()` on it.
				return String( item.blog_id );
			},
			// Render the site icon
			render: ( { item }: { item: Purchase } ) => {
				const site = sites.find( ( s ) => s.ID === item.blog_id );
				return (
					<a
						title={ String( translate( 'Manage purchase', { textOnly: true } ) ) }
						href={ getPurchaseUrl( item ) }
					>
						<PurchaseItemSiteIcon site={ site } purchase={ item } />
					</a>
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
			filterBy: false,
			getValue: ( { item }: { item: Purchase } ) => {
				const site = sites.find( ( s ) => s.ID === item.blog_id );
				// Render a bunch of things to make this easily searchable.
				return (
					getTitleForListDisplay( item ) +
					' ' +
					( getSubtitleForDisplay( item ) || '' ) +
					' ' +
					item.blogname +
					' ' +
					( item.site_slug || item.domain ) +
					' ' +
					( site?.URL ?? '' )
				);
			},
			render: ( { item }: { item: Purchase } ) => {
				const hasTransferred = isTransferredOwnership( item.ID, transferredOwnershipPurchases );
				return (
					<div className="purchase-item__information">
						<div className="purchase-item__title">
							{ hasTransferred ? (
								<div>
									{ getTitleForListDisplay( item ) }
									&nbsp;
									<OwnerInfo
										purchase={ item }
										isTransferredOwnership={ hasTransferred }
										translate={ translate }
									/>
								</div>
							) : (
								<>
									<a
										className="purchase-item__title-link"
										title={ String( translate( 'Manage purchase', { textOnly: true } ) ) }
										href={ getPurchaseUrl( item ) }
									>
										{ getTitleForListDisplay( item ) }
									</a>
									<OwnerInfo purchase={ item } translate={ translate } />
								</>
							) }
						</div>
					</div>
				);
			},
		},
		{
			id: 'description',
			label: translate( 'Description' ),
			type: 'text',
			enableGlobalSearch: true,
			enableSorting: true,
			enableHiding: false,
			filterBy: false,
			getValue: ( { item }: { item: Purchase } ) => {
				const site = sites.find( ( s ) => s.ID === item.blog_id );
				return item.blogname + ' ' + ( item.site_slug || item.domain ) + ' ' + ( site?.URL ?? '' );
			},
			render: ( { item }: { item: Purchase } ) => {
				return (
					<div className="purchase-item__information">
						<div className="purchase-item__purchase-type">
							<PurchaseItemRowProduct purchase={ item } sites={ sites } translate={ translate } />
						</div>
					</div>
				);
			},
		},
		{
			id: 'type',
			label: translate( 'Type' ),
			enableHiding: false,
			enableSorting: true,
			type: 'text',
			elements: [
				{ value: 'domain', label: translate( 'Domains' ) },
				{ value: 'plan', label: translate( 'Plans' ) },
				{ value: 'other', label: translate( 'Other' ) },
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
			label: translate( 'Expiring soon' ),
			type: 'text',
			elements: [
				{
					value: '7',
					label: String(
						translate( 'Expires in %(days)d days', { textOnly: true, args: { days: 7 } } )
					),
				},
				{
					value: '14',
					label: String(
						translate( 'Expires in %(days)d days', { textOnly: true, args: { days: 14 } } )
					),
				},
				{
					value: '30',
					label: String(
						translate( 'Expires in %(days)d days', { textOnly: true, args: { days: 30 } } )
					),
				},
				{
					value: '60',
					label: String(
						translate( 'Expires in %(days)d days', { textOnly: true, args: { days: 60 } } )
					),
				},
				{
					value: '365',
					label: String(
						translate( 'Expires in %(days)d days', { textOnly: true, args: { days: 365 } } )
					),
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
			label: translate( 'Expires/Renews on' ),
			type: 'text',
			enableGlobalSearch: true,
			enableSorting: true,
			enableHiding: false,
			filterBy: false,
			getValue: ( { item }: { item: Purchase } ) => {
				if ( isExpired( item ) ) {
					// Prefix expired items with a z so they sort to the end of the list.
					return 'zzz ' + item.expiry_status + ' ' + item.expiry_date;
				}
				// Include date in value to sort similar expiries together.
				return item.expiry_date + ' ' + item.expiry_status;
			},
			render: ( { item }: { item: Purchase } ) => {
				const site = sites.find( ( s ) => s.ID === item.blog_id );
				return (
					<div className="purchase-item__status purchases-layout__status">
						<PurchaseExpiryStatus purchase={ item } isSiteMissing={ ! site } />
					</div>
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
			filterBy: false,
			getValue: ( { item }: { item: Purchase } ) => {
				// This should not be possible. Investigating a bug:
				// https://linear.app/a8c/issue/SHILL-901/
				if ( ! item?.payment_type && ! item?.payment_details ) {
					logToLogstash( {
						feature: 'calypso_client',
						message: 'Purchase payment method data field getValue got unexpected data',
						severity: 'warning',
						extra: {
							item: JSON.stringify( item ),
						},
					} );
					return 'no-payment-method';
				}
				// Allows sorting by card number or payment partner (eg: `type === 'paypal'`).
				return isExpired( item )
					? // Do not return card number for expired purchases because it
					  // will not be displayed so it will look weird if we sort
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

				return (
					<div className="purchase-item__payment-method">
						<PurchaseItemPaymentMethod purchase={ item } sites={ sites } translate={ translate } />
						{ isBackupMethodAvailable && isRenewing( item ) && (
							<BackupPaymentMethodNotice translate={ translate } />
						) }
					</div>
				);
			},
		},
	];
	return fields;
}

export function getMembershipsFieldDefinitions( {
	translate,
}: {
	translate: LocalizeProps[ 'translate' ];
} ): Fields< MonetizeSubscription > {
	const getPurchaseUrl = ( item: MonetizeSubscription ) => {
		const subscriptionId = item.ID;
		if ( ! subscriptionId ) {
			// eslint-disable-next-line no-console
			console.error( 'Cannot display manage purchase page for subscription without ID' );
			return;
		}
		return `/me/purchases/other/${ subscriptionId }`;
	};

	return [
		{
			id: 'site',
			label: translate( 'Site' ),
			type: 'text',
			enableGlobalSearch: true,
			enableSorting: false,
			enableHiding: false,
			filterBy: false,
			getValue: ( { item }: { item: MonetizeSubscription } ) => {
				return item.site_id + ' ' + item.site_title + ' ' + item.site_url;
			},
			// Render the site icon
			render: ( { item }: { item: MonetizeSubscription } ) => {
				return (
					<a
						title={ String( translate( 'Manage purchase', { textOnly: true } ) ) }
						href={ getPurchaseUrl( item ) }
					>
						<MonetizeSubscriptionIcon subscription={ item } />
					</a>
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
			filterBy: false,
			getValue: ( { item }: { item: MonetizeSubscription } ) => {
				return item.title + ' ' + item.site_title + ' ' + item.site_url;
			},
			render: ( { item }: { item: MonetizeSubscription } ) => {
				return (
					<div className="membership-item__information purchase-item__information">
						<div className="membership-item__title purchase-item__title">
							<a
								title={ String( translate( 'Manage purchase', { textOnly: true } ) ) }
								href={ getPurchaseUrl( item ) }
							>
								{ item.title }
							</a>
						</div>
					</div>
				);
			},
		},
		{
			id: 'description',
			label: String(
				fixMe( {
					text: 'Product Description',
					newCopy: translate( 'Product Description', { textOnly: true } ),
					oldCopy: translate( 'Description', { textOnly: true } ),
				} )
			),
			type: 'text',
			enableGlobalSearch: true,
			enableSorting: true,
			enableHiding: false,
			filterBy: false,
			getValue: ( { item }: { item: MonetizeSubscription } ) => {
				return item.title + ' ' + item.site_title + ' ' + item.site_url;
			},
			render: ( { item }: { item: MonetizeSubscription } ) => {
				return (
					<div className="membership-item__information purchase-item__information">
						<div className="membership-item__purchase-type purchase-item__purchase-type">
							<MonetizeSubscriptionType subscription={ item } />
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
			filterBy: false,
			getValue: ( { item }: { item: MonetizeSubscription } ) => {
				return item.end_date ?? '';
			},
			render: ( { item }: { item: MonetizeSubscription } ) => {
				return (
					<div className="membership-item__status purchase-item__status">
						<MonetizeSubscriptionTerms subscription={ item } />
					</div>
				);
			},
		},
	];
}
