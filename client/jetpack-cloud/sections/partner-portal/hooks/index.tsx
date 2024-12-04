import page from '@automattic/calypso-router';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getQueryArg } from '@wordpress/url';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import ensurePartnerPortalReturnUrl from '../lib/ensure-partner-portal-return-url';

/**
 * Redirect to the partner portal or a present "return" GET parameter given a certain condition.
 * @param {boolean} redirect Whether to execute the redirect.
 * @returns {void}
 */
export function useReturnUrl( redirect: boolean ): void {
	useEffect( () => {
		if ( redirect ) {
			const returnQuery = getQueryArg( window.location.href, 'return' ) as string;
			const returnUrl = ensurePartnerPortalReturnUrl( returnQuery );

			// Avoids redirect attempt if there is no `return` parameter
			if ( ! returnQuery ) {
				return;
			}

			page.redirect( returnUrl );
		}
	}, [ redirect ] );
}

/**
 * Returns the recent payment methods from the Jetpack Stripe account.
 *
 */
export function useRecentPaymentMethodsQuery( {
	enabled = true,
}: Omit< UseQueryOptions, 'queryKey' > = {} ) {
	return useQuery( {
		queryKey: [ 'jetpack-cloud', 'partner-portal', 'recent-cards' ],
		queryFn: () =>
			wpcomJpl.req.get( {
				apiNamespace: 'wpcom/v2',
				path: '/jetpack-licensing/stripe/payment-methods',
			} ),
		enabled: enabled,
	} );
}

/**
 * Returns false; if flag ever becomes true, then returns true from then onwards.
 *
 * Useful to determine if pagination should be shown based on whether flag is or has been true at some point.
 * For example, Stripe responses include a boolean `has_more` pagination value which you can pass as the
 * argument and use the return value to conditionally render your pagination.
 * @param {boolean} flag
 * @returns {boolean}
 */
export function usePermanentFlag( flag: boolean ): boolean {
	const [ wasTrue, setWasTrue ] = useState( false );

	useEffect( () => {
		if ( flag ) {
			setWasTrue( true );
		}
	}, [ flag ] );

	return wasTrue;
}

/**
 * Handle cursor-based pagination.
 * @todo use this in payment method pagination.
 */
export function useCursorPagination(
	enabled: boolean,
	hasMore: boolean,
	onNavigateCallback: ( page: number, direction: 'next' | 'prev' ) => void
): [ number, boolean, ( page: number ) => void ] {
	const [ page, setPage ] = useState( 1 );
	const showPagination = usePermanentFlag( hasMore );
	const onNavigate = useCallback(
		( newPage: number ) => {
			const direction = newPage > page ? 'next' : 'prev';

			if ( ! enabled ) {
				return;
			}

			if ( newPage < 1 ) {
				return;
			}

			if ( direction === 'next' && ! hasMore ) {
				return;
			}

			setPage( newPage );
			onNavigateCallback?.( newPage, direction );
		},
		[ enabled, hasMore, setPage, onNavigateCallback ]
	);

	return [ page, showPagination, onNavigate ];
}

export { default as useAssignLicensesToSite } from './use-assign-licenses-to-site';
export { default as useIssueAndAssignLicenses } from './use-issue-and-assign-licenses';

/**
 * Returns product description and features with given product slug.
 * @param productSlug
 * @returns
 */
export function useProductDescription( productSlug: string ): {
	description: TranslateResult | null;
	features: ReadonlyArray< TranslateResult >;
} {
	const translate = useTranslate();

	return useMemo( () => {
		let description = '';
		const features = [];

		switch ( productSlug ) {
			case 'jetpack-complete':
				description = translate( 'Includes all Security 1TB and full Jetpack package.' );
				features.push(
					translate( 'All Security products' ),
					translate( '1TB cloud storage' ),
					translate( 'Full Jetpack package' )
				);
				break;
			case 'jetpack-security-t1':
				description = translate(
					'Includes VaultPress Backup 10GB, Scan Daily and Akismet Anti-spam.'
				);
				features.push(
					translate( 'VaultPress Backup 10GB' ),
					translate( 'Scan Daily' ),
					translate( 'Akismet Anti-spam*' )
				);
				break;
			case 'jetpack-security-t2':
				description = translate(
					'Includes VaultPress Backup 1TB, Scan Daily and Akismet Anti-spam.'
				);
				features.push(
					translate( 'VaultPress Backup 1TB' ),
					translate( 'Scan Daily' ),
					translate( 'Akismet Anti-spam*' )
				);
				break;
			case 'jetpack-growth':
				description = translate( 'Grow your audience effortlessly.' );
				features.push( translate( 'Stats' ), translate( 'Social' ) );
				break;
			case 'jetpack-starter':
				description = translate( 'Includes VaultPress Backup 1GB and Akismet Anti-spam.' );
				features.push( translate( 'VaultPress Backup 1GB' ), translate( 'Akismet Anti-spam*' ) );
				break;
			case 'jetpack-anti-spam':
				description = translate( 'Automatically clear spam from your comments and forms.' );
				break;
			case 'jetpack-backup-t1':
			case 'jetpack-backup-t2':
				description = translate( 'Real-time cloud backups with one-click restores.' );
				break;
			case 'jetpack-backup-addon-storage-10gb-monthly':
			case 'jetpack-backup-addon-storage-100gb-monthly':
			case 'jetpack-backup-addon-storage-1tb-monthly':
			case 'jetpack-backup-addon-storage-3tb-monthly':
			case 'jetpack-backup-addon-storage-5tb-monthly':
				description = translate( 'Additional storage for your Jetpack VaultPress Backup plan.' );
				break;
			case 'jetpack-boost':
				description = translate( 'Essential tools to speed up your site - no developer required.' );
				break;
			case 'jetpack-scan':
				description = translate( 'Automatic malware scanning with one-click fixes.' );
				break;
			case 'jetpack-videopress':
				description = translate( 'High-quality, ad-free video built specifically for WordPress.' );
				break;
			case 'jetpack-social-basic':
				description = translate( 'Write once, post everywhere.' );
				break;
			case 'jetpack-social-advanced':
				description = translate( 'Write once, post everywhere.' );
				break;
			case 'jetpack-social-v1':
				description = translate( 'Write once, post everywhere.' );
				break;
			case 'jetpack-search':
				description = translate( 'Help your site visitors find answers instantly.' );
				break;
			case 'jetpack-ai':
				description = translate( 'Unleash the power of AI to boost your content creation.' );
				break;
			case 'jetpack-monitor':
				description = translate(
					'Upgrade Monitor with swift 1-minute monitoring alert intervals, SMS notifications, and multiple email recipients.'
				);
				break;
			case 'woocommerce-bookings':
				description = translate(
					'Allow customers to book appointments, make reservations or rent equipment without leaving your site.'
				);
				break;
			case 'woocommerce-subscriptions':
				description = translate(
					'Let customers subscribe to your products or services and pay on a weekly, monthly, or annual basis.'
				);
				break;
			case 'woocommerce-product-bundles':
				description = translate(
					'Offer personalized product bundles, bulk discount packages, and assembled products.'
				);
				break;
			case 'woocommerce-product-add-ons':
				description = translate(
					'Offer add-ons like gift wrapping, special messages, or other special options for your products.'
				);
				break;
			case 'woocommerce-minmax-quantities':
				description = translate(
					'Minimum and maximum quantity rules for products, orders, and categories.'
				);
				break;
			case 'woocommerce-automatewoo':
				description = translate(
					'Powerful marketing automation for WooCommerce - grow your store and make more money.'
				);
				break;
			case 'woocommerce-advanced-notifications':
				description = translate(
					'Easily setup new order and stock email notifications for multiple recipients of your choosing.'
				);
				break;
			case 'woocommerce-all-products-woo-subscriptions':
				description = translate(
					'Add subscription plans to your existing products and start capturing residual revenue with All Products for WooCommerce Subscriptions.'
				);
				break;
			case 'woocommerce-automatewoo-birthdays':
				description = translate(
					'Delight customers and boost organic sales with a special WooCommerce birthday email (and coupon!) on their special day.'
				);
				break;
			case 'woocommerce-automatewoo-refer-a-friend':
				description = translate(
					'Boost your organic sales by adding a customer referral program to your WooCommerce store.'
				);
				break;
			case 'woocommerce-back-in-stock-notifications':
				description = translate(
					'Notify customers when your out-of-stock products become available. Recover lost sales, build customer loyalty, and gain deeper insights into your inventory.'
				);
				break;
			case 'woocommerce-bulk-stock-management':
				description = translate(
					'Edit product and variation stock levels in bulk via this handy interface.'
				);
				break;
			case 'woocommerce-checkout-field-editor':
				description = translate(
					'Optimize your checkout process by adding, removing or editing fields to suit your needs.'
				);
				break;
			case 'woocommerce-composite-products':
				description = translate(
					'The definitive product builder plugin for WooCommerce. Create and offer personalized product kits and custom product configurators.'
				);
				break;
			case 'woocommerce-conditional-shipping-payments':
				description = translate(
					'Use conditional logic to restrict the shipping methods, payment gateways and shipping countries or states available to customers at checkout.'
				);
				break;
			case 'woocommerce-eu-vat-number':
				description = translate(
					'Collect VAT numbers at checkout and remove the VAT charge for eligible EU businesses.'
				);
				break;
			case 'woocommerce-flat-rate-box-shipping':
				description = translate( 'Pack items into boxes with pre-defined costs per destination.' );
				break;
			case 'woocommerce-gift-cards':
				description = translate(
					'Offer digital prepaid gift cards and e-gift certificates that customers can redeem at your WooCommerce store.'
				);
				break;
			case 'woocommerce-gifting-wc-subscriptions':
				description = translate(
					"Offer customers a way to purchase subscriptions for others. A gift that keeps on giving for your customers and your store's revenue."
				);
				break;
			case 'woocommerce-per-product-shipping':
				description = translate(
					'Define separate shipping costs per product which are combined at checkout to provide a total shipping cost.'
				);
				break;
			case 'woocommerce-product-csv-import-suite':
				description = translate(
					'Import, merge, and export products and variations to and from WooCommerce using a CSV file.'
				);
				break;
			case 'woocommerce-product-recommendations':
				description = translate(
					'Offer smarter upsells, cross-sells, and frequently bought together recommendations. Use analytics to measure their impact and optimize your strategies.'
				);
				break;
			case 'woocommerce-product-vendors':
				description = translate(
					'Turn your store into a multi-vendor marketplace. Allow multiple vendors to sell via your site and in return take a commission on sales.'
				);
				break;
			case 'woocommerce-returns-warranty-requests':
				description = translate(
					'Manage the RMA process, add warranties to products, and let customers request and manage returns/exchanges from their account.'
				);
				break;
			case 'woocommerce-subscription-downloads':
				description = translate(
					'Offer additional downloads to your subscribers, via downloadable products listed in your store.'
				);
				break;
			case 'woocommerce-shipment-tracking':
				description = translate( 'Add shipment tracking information to your orders.' );
				break;
			case 'woocommerce-shipping-multiple-addresses':
				description = translate(
					'Allow your customers to ship individual items in a single order to multiple addresses.'
				);
				break;
			case 'woocommerce-storefront-extensions-bundle':
				description = translate(
					'All the tools you need to customize your WooCommerce store design. Storefront is our free, intuitive theme for WooCommerce - make it yours without touching code with the Storefront Extensions bundle.'
				);
				break;
			case 'woocommerce-table-rate-shipping':
				description = translate(
					"The Table Rate shipping module extends WooCommerce's default shipping options giving you highly customisable shipping options."
				);
				break;
			case 'woocommerce-additional-image-variations':
				description = translate( 'Unlimited images for your product variations.' );
				break;
			case 'woocommerce-bookings-availability':
				description = translate(
					'Sell more bookings by presenting a calendar or schedule of available slots in a page or post.'
				);
				break;
			case 'woocommerce-box-office':
				description = translate(
					'Sell tickets for your next event, concert, function, fundraiser or conference directly on your own site.'
				);
				break;
			case 'woocommerce-brands':
				description = translate(
					'Create, assign and list brands for products, and allow customers to view by brand.'
				);
				break;
			case 'woocommerce-coupon-campaigns':
				description = translate(
					'Categorize coupons within coupon campaigns, making it easier to track the performance of a collection of coupons.'
				);
				break;
			case 'woocommerce-deposits':
				description = translate(
					'Enable custom payment schedules with WooCommerce Deposits. Accept payments as deposits, layaway plans, or any desired payment structure.'
				);
				break;
			case 'woocommerce-distance-rate-shipping':
				description = translate(
					'WooCommerce Distance Rate shipping allows you to charge shipping rates based on the distance or total travel time to your customers as well as charge based on weight, total value or number of items in cart.'
				);
				break;
			case 'woocommerce-one-page-checkout':
				description = translate(
					'Create special pages where customers can choose products, checkout & pay all on the one page.'
				);
				break;
			case 'woocommerce-order-barcodes':
				description = translate(
					'Generates a unique barcode for each order on your site perfect for e-tickets, packing slips, reservations and a variety of other uses.'
				);
				break;
			case 'woocommerce-points-and-rewards':
				description = translate(
					'Reward your customers for purchases and other actions with points which can be redeemed for discounts.'
				);
				break;
			case 'woocommerce-pre-orders':
				description = translate( 'Allow customers to order products before they are available.' );
				break;
			case 'woocommerce-purchase-order-gateway':
				description = translate(
					'Seamlessly accept purchase orders as a payment method on your WooCommerce store.'
				);
				break;
			case 'woocommerce-shipping':
				description = translate(
					'Print USPS and DHL labels right from your WooCommerce dashboard and instantly save on shipping. WooCommerce Shipping is free to use and saves you time and money.'
				);
				break;
			case 'woocommerce-accommodations-bookings':
				description = translate(
					'Book accommodation using WooCommerce and the WooCommerce Bookings extension.'
				);
				break;
			case 'woocommerce-tax':
				description = translate(
					'Automatically calculate how much sales tax should be collected for WooCommerce orders — by city, country, or state — at checkout.'
				);
				break;
			case 'woocommerce-woopayments':
				description = translate(
					'The only payment solution fully integrated to Woo. Accept credit/debit cards and local payment options with no setup or monthly fees.'
				);
				break;
			case 'woocommerce-product-filters':
				description = translate(
					'This is a tool to create ajax product filters that make the process of finding products in your store simple and fast.'
				);
				break;
			case 'jetpack-stats':
				description = translate( 'Powerful analytics to help you understand your audience.' );
				break;
			case 'jetpack-creator':
				description = translate(
					'Craft stunning content, boost your subscriber base, and monetize your online presence.'
				);
				break;
		}

		return {
			description,
			features,
		};
	}, [ productSlug, translate ] );
}

type Params = Array< { key: string; value: string } >;

export const useURLQueryParams = (): {
	getParamValue: ( paramKey: string ) => any;
	setParams: ( params: Params ) => void;
	resetParams: ( params: string[] ) => void;
} => {
	const pushState = useCallback( ( queryParams: { toString: () => string } ) => {
		const queryParamString = queryParams.toString();
		const newURL =
			window.location.origin +
			window.location.pathname +
			( queryParamString ? `?${ queryParamString }` : '' );
		window.history.pushState( {}, '', newURL );
	}, [] );

	const setParams = useCallback(
		( params: Params ) => {
			const queryParams = new URLSearchParams( window.location.search );
			params.forEach( ( param ) => {
				queryParams.set( param.key, param.value );
			} );
			pushState( queryParams );
		},
		[ pushState ]
	);

	const resetParams = useCallback(
		( params: string[] ) => {
			const queryParams = new URLSearchParams( window.location.search );
			params.forEach( ( param ) => {
				queryParams.delete( param );
			} );
			pushState( queryParams );
		},
		[ pushState ]
	);

	const getParamValue = useCallback( ( paramKey: string ) => {
		return getQueryArg( window.location.href, paramKey );
	}, [] );

	return {
		getParamValue,
		setParams,
		resetParams,
	};
};
