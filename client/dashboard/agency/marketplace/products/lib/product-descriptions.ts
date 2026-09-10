import { __ } from '@wordpress/i18n';

export interface ProductDescription {
	description: string | null;
	features: string[];
}

// Mirrors the classic dashboard's product copy (jetpack-cloud partner-portal
// useProductDescription); the products API carries no descriptions.
export function getProductDescription( productSlug: string ): ProductDescription {
	let description: string | null = null;
	const features: string[] = [];

	if ( productSlug.startsWith( 'pressable-addon-storage-' ) ) {
		description = __( 'Add additional storage capacity to your Pressable plan limit.' );
	}

	if ( productSlug.startsWith( 'pressable-addon-visits-' ) ) {
		description = __( 'Add additional monthly visits capacity to your Pressable plan limit.' );
	}

	if ( productSlug.startsWith( 'pressable-addon-php-memory-' ) ) {
		description = __( 'Add PHP memory for each PHP worker/process on one Pressable site/domain.' );
	}

	switch ( productSlug ) {
		case 'jetpack-complete':
			description = __(
				'Includes all Security products (1TB storage) and the full Jetpack suite.'
			);
			features.push(
				__( 'All Security products' ),
				__( '1TB cloud storage' ),
				__( 'Full Jetpack suite' )
			);
			break;
		case 'jetpack-security-t1':
			description = __( 'Includes VaultPress Backup 10GB, Scan Daily, and Akismet Anti-spam.' );
			features.push(
				__( 'VaultPress Backup 10GB' ),
				__( 'Scan Daily' ),
				__( 'Akismet Anti-spam' )
			);
			break;
		case 'jetpack-security-t2':
			description = __( 'Includes VaultPress Backup 1TB, Scan Daily, and Akismet Anti-spam.' );
			features.push( __( 'VaultPress Backup 1TB' ), __( 'Scan Daily' ), __( 'Akismet Anti-spam' ) );
			break;
		case 'jetpack-growth':
			description = __( 'Grow your audience effortlessly.' );
			features.push( __( 'Stats' ), __( 'Social' ) );
			break;
		case 'jetpack-starter':
			description = __( 'Includes VaultPress Backup 1GB and Akismet Anti-spam.' );
			features.push( __( 'VaultPress Backup 1GB' ), __( 'Akismet Anti-spam' ) );
			break;
		case 'jetpack-anti-spam':
			description = __( 'Automatically clear spam from your comments and forms.' );
			break;
		case 'jetpack-backup-t1':
		case 'jetpack-backup-t2':
			description = __( 'Real-time cloud backups with one-click restores.' );
			break;
		case 'jetpack-backup-addon-storage-10gb-monthly':
		case 'jetpack-backup-addon-storage-100gb-monthly':
		case 'jetpack-backup-addon-storage-1tb-monthly':
		case 'jetpack-backup-addon-storage-3tb-monthly':
		case 'jetpack-backup-addon-storage-5tb-monthly':
			description = __( 'Additional storage for your Jetpack VaultPress Backup plan.' );
			break;
		case 'jetpack-boost':
			description = __( 'Essential tools to speed up your site - no developer required.' );
			break;
		case 'jetpack-scan':
			description = __( 'Automatic malware scanning with one-click fixes.' );
			break;
		case 'jetpack-videopress':
			description = __( 'High-quality, ad-free video built specifically for WordPress.' );
			break;
		case 'jetpack-social-basic':
			description = __( 'Write once, post everywhere.' );
			break;
		case 'jetpack-social-advanced':
			description = __( 'Write once, post everywhere.' );
			break;
		case 'jetpack-social-v1':
			description = __( 'Write once, post everywhere.' );
			break;
		case 'jetpack-search':
			description = __( 'Help your site visitors find answers instantly.' );
			break;
		case 'jetpack-ai':
			description = __( 'Unleash the power of AI to boost your content creation.' );
			break;
		case 'jetpack-monitor':
			description = __(
				'Upgrade Monitor with swift 1-minute monitoring alert intervals, SMS notifications, and multiple email recipients.'
			);
			break;
		case 'woocommerce-bookings':
			description = __(
				'Allow customers to book appointments, make reservations or rent equipment without leaving your site.'
			);
			break;
		case 'woocommerce-subscriptions':
			description = __(
				'Let customers subscribe to your products or services and pay on a weekly, monthly, or annual basis.'
			);
			break;
		case 'woocommerce-product-bundles':
			description = __(
				'Offer personalized product bundles, bulk discount packages, and assembled products.'
			);
			break;
		case 'woocommerce-product-add-ons':
			description = __(
				'Offer add-ons like gift wrapping, special messages, or other special options for your products.'
			);
			break;
		case 'woocommerce-minmax-quantities':
			description = __(
				'Minimum and maximum quantity rules for products, orders, and categories.'
			);
			break;
		case 'woocommerce-automatewoo':
			description = __(
				'Powerful marketing automation for WooCommerce - grow your store and make more money.'
			);
			break;
		case 'woocommerce-advanced-notifications':
			description = __(
				'Easily setup new order and stock email notifications for multiple recipients of your choosing.'
			);
			break;
		case 'woocommerce-all-products-woo-subscriptions':
			description = __(
				'Add subscription plans to your existing products and start capturing residual revenue with All Products for WooCommerce Subscriptions.'
			);
			break;
		case 'woocommerce-automatewoo-birthdays':
			description = __(
				'Delight customers and boost organic sales with a special WooCommerce birthday email (and coupon!) on their special day.'
			);
			break;
		case 'woocommerce-automatewoo-refer-a-friend':
			description = __(
				'Boost your organic sales by adding a customer referral program to your WooCommerce store.'
			);
			break;
		case 'woocommerce-back-in-stock-notifications':
			description = __(
				'Notify customers when your out-of-stock products become available. Recover lost sales, build customer loyalty, and gain deeper insights into your inventory.'
			);
			break;
		case 'woocommerce-bulk-stock-management':
			description = __(
				'Edit product and variation stock levels in bulk via this handy interface.'
			);
			break;
		case 'woocommerce-checkout-field-editor':
			description = __(
				'Optimize your checkout process by adding, removing or editing fields to suit your needs.'
			);
			break;
		case 'woocommerce-composite-products':
			description = __(
				'The definitive product builder plugin for WooCommerce. Create and offer personalized product kits and custom product configurators.'
			);
			break;
		case 'woocommerce-conditional-shipping-payments':
			description = __(
				'Use conditional logic to restrict the shipping methods, payment gateways and shipping countries or states available to customers at checkout.'
			);
			break;
		case 'woocommerce-eu-vat-number':
			description = __(
				'Collect VAT numbers at checkout and remove the VAT charge for eligible EU businesses.'
			);
			break;
		case 'woocommerce-flat-rate-box-shipping':
			description = __( 'Pack items into boxes with pre-defined costs per destination.' );
			break;
		case 'woocommerce-gift-cards':
			description = __(
				'Offer digital prepaid gift cards and e-gift certificates that customers can redeem at your WooCommerce store.'
			);
			break;
		case 'woocommerce-gifting-wc-subscriptions':
			description = __(
				'Offer customers a way to purchase subscriptions for others. A gift that keeps on giving for your customers and your store’s revenue.'
			);
			break;
		case 'woocommerce-per-product-shipping':
			description = __(
				'Define separate shipping costs per product which are combined at checkout to provide a total shipping cost.'
			);
			break;
		case 'woocommerce-product-csv-import-suite':
			description = __(
				'Import, merge, and export products and variations to and from WooCommerce using a CSV file.'
			);
			break;
		case 'woocommerce-product-recommendations':
			description = __(
				'Offer smarter upsells, cross-sells, and frequently bought together recommendations. Use analytics to measure their impact and optimize your strategies.'
			);
			break;
		case 'woocommerce-product-vendors':
			description = __(
				'Turn your store into a multi-vendor marketplace. Allow multiple vendors to sell via your site and in return take a commission on sales.'
			);
			break;
		case 'woocommerce-returns-warranty-requests':
			description = __(
				'Manage the RMA process, add warranties to products, and let customers request and manage returns/exchanges from their account.'
			);
			break;
		case 'woocommerce-subscription-downloads':
			description = __(
				'Offer additional downloads to your subscribers, via downloadable products listed in your store.'
			);
			break;
		case 'woocommerce-shipment-tracking':
			description = __( 'Add shipment tracking information to your orders.' );
			break;
		case 'woocommerce-shipping-multiple-addresses':
			description = __(
				'Allow your customers to ship individual items in a single order to multiple addresses.'
			);
			break;
		case 'woocommerce-storefront-extensions-bundle':
			description = __(
				'All the tools you need to customize your WooCommerce store design. Storefront is our free, intuitive theme for WooCommerce - make it yours without touching code with the Storefront Extensions bundle.'
			);
			break;
		case 'woocommerce-table-rate-shipping':
			description = __(
				'The Table Rate shipping module extends WooCommerce’s default shipping options giving you highly customisable shipping options.'
			);
			break;
		case 'woocommerce-additional-image-variations':
			description = __( 'Unlimited images for your product variations.' );
			break;
		case 'woocommerce-bookings-availability':
			description = __(
				'Sell more bookings by presenting a calendar or schedule of available slots in a page or post.'
			);
			break;
		case 'woocommerce-box-office':
			description = __(
				'Sell tickets for your next event, concert, function, fundraiser or conference directly on your own site.'
			);
			break;
		case 'woocommerce-brands':
			description = __(
				'Create, assign and list brands for products, and allow customers to view by brand.'
			);
			break;
		case 'woocommerce-coupon-campaigns':
			description = __(
				'Categorize coupons within coupon campaigns, making it easier to track the performance of a collection of coupons.'
			);
			break;
		case 'woocommerce-deposits':
			description = __(
				'Enable custom payment schedules with WooCommerce Deposits. Accept payments as deposits, layaway plans, or any desired payment structure.'
			);
			break;
		case 'woocommerce-distance-rate-shipping':
			description = __(
				'WooCommerce Distance Rate shipping allows you to charge shipping rates based on the distance or total travel time to your customers as well as charge based on weight, total value or number of items in cart.'
			);
			break;
		case 'woocommerce-one-page-checkout':
			description = __(
				'Create special pages where customers can choose products, checkout & pay all on the one page.'
			);
			break;
		case 'woocommerce-order-barcodes':
			description = __(
				'Generates a unique barcode for each order on your site perfect for e-tickets, packing slips, reservations and a variety of other uses.'
			);
			break;
		case 'woocommerce-points-and-rewards':
			description = __(
				'Reward your customers for purchases and other actions with points which can be redeemed for discounts.'
			);
			break;
		case 'woocommerce-pre-orders':
			description = __( 'Allow customers to order products before they are available.' );
			break;
		case 'woocommerce-purchase-order-gateway':
			description = __(
				'Seamlessly accept purchase orders as a payment method on your WooCommerce store.'
			);
			break;
		case 'woocommerce-shipping':
			description = __(
				'Print USPS and DHL labels right from your WooCommerce dashboard and instantly save on shipping. WooCommerce Shipping is free to use and saves you time and money.'
			);
			break;
		case 'woocommerce-accommodations-bookings':
			description = __(
				'Book accommodation using WooCommerce and the WooCommerce Bookings extension.'
			);
			break;
		case 'woocommerce-tax':
			description = __(
				'Automatically calculate how much sales tax should be collected for WooCommerce orders — by city, country, or state — at checkout.'
			);
			break;
		case 'woocommerce-woopayments':
			description = __(
				'The only payment solution fully integrated to Woo. Accept credit/debit cards and local payment options with no setup or monthly fees.'
			);
			break;
		case 'woocommerce-product-filters':
			description = __(
				'This is a tool to create ajax product filters that make the process of finding products in your store simple and fast.'
			);
			break;
		case 'woocommerce-constellation':
			description = __(
				'A flexible, WooCommerce memberships platform to support publishers, purchasing clubs, online learning, associations, and more.'
			);
			break;
		case 'woocommerce-rental-products':
			description = __( 'Sell rental products in your store, manage rental orders and more.' );
			break;
		case 'woocommerce-smart-coupons':
			description = __(
				'Boost sales and customer loyalty. Create advanced discounts, sell gift cards, set BOGO deals, give store credits, and all types of rule based dynamic discounts with this all-in-one Smart Coupons plugin for WooCommerce.'
			);
			break;
		case 'woocommerce-dynamic-pricing':
			description = __( 'Bulk discounts, role-based pricing and much more.' );
			break;
		case 'woocommerce-variation-swatches-and-photos':
			description = __(
				'Show color and image swatches instead of dropdowns for variable products.'
			);
			break;
		case 'woocommerce-afterpay':
			description = __(
				'Afterpay allows customers to purchase products and choose to pay in four installments over six weeks or pay monthly (US only).'
			);
			break;
		case 'woocommerce-square':
			description = __(
				'Accepting payments is easy with Square. Clear rates, fast deposits (1–2 business days). Sell online and in person, and sync all payments, items and inventory.'
			);
			break;
		case 'woocommerce-affirm':
			description = __(
				'Buy now, pay later for your business—but smarter. Increase conversions and AOV by offering shoppers flexible payment plans from Affirm.'
			);
			break;
		case 'woocommerce-mollie':
			description = __(
				'Offer global and local payment methods and get onboarded in minutes, with support in your language.'
			);
			break;
		case 'woocommerce-stripe':
			description = __( 'Maximize revenue with the new checkout from Stripe.' );
			break;
		case 'woocommerce-klarna':
			description = __(
				'Grow your business with increased sales and an enhanced shopping experience — at no extra cost.'
			);
			break;
		case 'woocommerce-paypal':
			description = __(
				'PayPal’s brand recognition helps give customers the confidence to buy. PayPal’s all-in-one checkout solution allows you to offer PayPal, Venmo (US), Pay Later, credit and debit cards, country-specific payment options and more.'
			);
			break;
		case 'woocommerce-klaviyo':
			description = __(
				'As Woo’s preferred marketing automation platform, Klaviyo unifies email and SMS marketing, customer analytics, and product reviews to help your brand achieve better marketing ROI.'
			);
			break;
		case 'jetpack-stats':
			description = __( 'Powerful analytics to help you understand your audience.' );
			break;
		case 'jetpack-creator':
			description = __(
				'Craft stunning content, boost your subscriber base, and monetize your online presence.'
			);
			break;
		case 'pressable-addon-sites-1':
			description = __( 'Add an additional site to your Pressable plan limit.' );
			features.push( __( 'Manage an additional site' ) );
			break;
		case 'pressable-addon-sites-5':
			description = __( 'Add an additional 5 sites to your Pressable plan limit.' );
			features.push( __( 'Manage up to 5 additional sites' ) );
			break;
		case 'pressable-addon-sites-10':
			description = __( 'Add an additional 10 sites to your Pressable plan limit.' );
			features.push( __( 'Manage up to 10 additional sites' ) );
			break;
	}

	return { description, features };
}
