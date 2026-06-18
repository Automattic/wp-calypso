import { __experimentalText as Text, __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import AvalaraLogo from './images/avalara.svg';
import JetpackLogo from './images/jetpack.svg';
import PressableLogo from './images/pressable.svg';
import VIPLogo from './images/vip.svg';
import WooLogo from './images/woo.svg';
import WooPaymentsLogo from './images/woopayments.svg';
import WordPressDotComLogo from './images/wordpressdotcom.svg';
import type { PartnerOffer } from './types';

// Marketplace constant values inlined from client/a8c-for-agencies so the
// dashboard has no dependency on the classic A4A app. These CTA links resolve
// in the classic A4A marketplace until a dashboard Marketplace exists.
const MARKETPLACE_TYPE_REFERRAL = 'referral';
const MARKETPLACE_TYPE_REGULAR = 'regular';
const PRODUCT_BRAND_FILTER_WOOCOMMERCE = 'woocommerce';
const PRODUCT_BRAND_FILTER_JETPACK = 'jetpack';
const A4A_MARKETPLACE_HOSTING_WPCOM_LINK = '/marketplace/hosting/wpcom';
const A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK = '/marketplace/hosting/pressable';
const A4A_MARKETPLACE_HOSTING_REFER_PRESSABLE_PREMIUM_PLAN_LINK =
	'/marketplace/hosting/refer-pressable-premium-plan';
const A4A_MARKETPLACE_HOSTING_REFER_ENTERPRISE_LINK =
	'/marketplace/hosting/refer-enterprise-hosting';
const A4A_MARKETPLACE_PRODUCTS_LINK = '/marketplace/products';
const A4A_WOOPAYMENTS_OVERVIEW_LINK = '/woopayments/overview';

export const filterOptions = {
	offerTypes: [
		{ value: 'refer', label: __( 'Refer' ) },
		{ value: 'resell', label: __( 'Resell' ) },
	],
	products: [
		{ value: 'wordpress', label: __( 'WordPress.com' ) },
		{ value: 'pressable', label: __( 'Pressable' ) },
		{ value: 'jetpack', label: __( 'Jetpack' ) },
		{ value: 'woocommerce', label: __( 'WooCommerce' ) },
	],
	productTypes: [
		{ value: 'hosting', label: __( 'Hosting' ) },
		{ value: 'extension', label: __( 'Extension' ) },
	],
};

export const partnerOffers: PartnerOffer[] = [
	{
		id: 'wordpress-com-hosting-refer',
		offerType: 'refer',
		product: 'wordpress',
		productType: 'hosting',
		logo: (
			<img
				src={ WordPressDotComLogo }
				alt="WordPress.com"
				style={ { width: 'auto', height: '16px' } }
			/>
		),
		title: __( 'Earn a 20% recurring commission' ),
		description: __(
			"Earn a 20% recurring commission when you refer WordPress.com's world-class hosting to your clients. Ideal for agencies that build and hand off to clients."
		),
		cta: {
			label: __( 'Refer WordPress.com' ),
			url: A4A_MARKETPLACE_HOSTING_WPCOM_LINK,
			purchase_type: MARKETPLACE_TYPE_REFERRAL,
		},
	},
	{
		id: 'pressable-hosting-refer',
		offerType: 'refer',
		product: 'pressable',
		productType: 'hosting',
		logo: <img src={ PressableLogo } alt="Pressable" style={ { width: 'auto', height: '16px' } } />,
		title: __( 'Earn a 20% recurring commission' ),
		description: __(
			'Earn a 20% recurring commission when you refer Pressable’s best-in-class hosting to your clients. Ideal for agencies that build and continue to maintain sites or stores.'
		),
		cta: {
			label: __( 'Refer Pressable' ),
			url: A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK,
			purchase_type: MARKETPLACE_TYPE_REFERRAL,
		},
	},
	{
		id: 'pressable-premium-hosting-refer',
		offerType: 'refer',
		product: 'pressable',
		productType: 'hosting',
		logo: (
			<HStack
				spacing={ 1 }
				justify="flex-start"
				alignment="center"
				style={ { width: 'fit-content' } }
			>
				<img src={ PressableLogo } alt="Pressable" style={ { width: 'auto', height: '16px' } } />
				<Text weight={ 500 } size={ 13 }>
					{ __( 'Premium' ) }
				</Text>
			</HStack>
		),
		title: __( 'Earn a 20% recurring commission' ),
		description: __(
			'For mission-critical sites that demand extra attention and resources. Earn a 20% recurring commission when you refer Pressable Premium to your clients.'
		),
		cta: {
			label: __( 'Refer Pressable' ),
			url: A4A_MARKETPLACE_HOSTING_REFER_PRESSABLE_PREMIUM_PLAN_LINK,
		},
	},
	{
		id: 'vip-hosting-refer',
		offerType: 'refer',
		product: 'wordpress',
		productType: 'hosting',
		logo: <img src={ VIPLogo } alt="WordPress VIP" style={ { width: 'auto', height: '16px' } } />,
		title: __( 'Earn up to a 20% one-time commission' ),
		description: __(
			'Earn up to a 20% one-time commission when you refer WordPress VIP’s enterprise-grade hosting to your clients.'
		),
		cta: {
			label: __( 'Refer WordPress VIP' ),
			url: A4A_MARKETPLACE_HOSTING_REFER_ENTERPRISE_LINK,
		},
	},
	{
		id: 'woo-products-refer',
		offerType: 'refer',
		product: 'woocommerce',
		productType: 'extension',
		logo: <img src={ WooLogo } alt="WooCommerce" style={ { width: 'auto', height: '16px' } } />,
		title: __( 'Earn a 50% recurring commission' ),
		description: __(
			'Earn a 50% recurring commission when you refer Woo extensions to your clients.'
		),
		cta: {
			label: __( 'Refer Woo' ),
			url: addQueryArgs( A4A_MARKETPLACE_PRODUCTS_LINK, {
				category: PRODUCT_BRAND_FILTER_WOOCOMMERCE,
			} ),
			purchase_type: MARKETPLACE_TYPE_REFERRAL,
		},
	},
	{
		id: 'jetpack-products-refer',
		offerType: 'refer',
		product: 'jetpack',
		logo: <img src={ JetpackLogo } alt="Jetpack" style={ { width: 'auto', height: '16px' } } />,
		title: __( 'Earn a 50% recurring commission' ),
		description: __(
			'Earn a 50% recurring commission when you refer any of Jetpack’s security, performance, and growth products to your clients.'
		),
		cta: {
			label: __( 'Refer Jetpack' ),
			url: addQueryArgs( A4A_MARKETPLACE_PRODUCTS_LINK, {
				category: PRODUCT_BRAND_FILTER_JETPACK,
			} ),
			purchase_type: MARKETPLACE_TYPE_REFERRAL,
		},
	},
	{
		id: 'avalara-partner-program-refer',
		offerType: 'refer',
		logo: <img src={ AvalaraLogo } alt="Avalara" style={ { width: 'auto', height: '16px' } } />,
		title: __( 'Join the Avalara Partner Program and unlock new revenue streams' ),
		description: __(
			'Help clients navigate tax complexity with a trusted partner—while unlocking new revenue opportunities for your business.'
		),
		termsUrl: 'https://legal.avalara.com/partner.legal.center#generalpartnerterms',
		cta: {
			label: __( 'Join the partner program' ),
			url: 'https://www.avalara.com/us/en/partners/partner-programs.html',
			external: true,
		},
	},
	{
		id: 'wordpress-com-hosting-resell',
		offerType: 'resell',
		product: 'wordpress',
		productType: 'hosting',
		logo: (
			<img
				src={ WordPressDotComLogo }
				alt="WordPress.com"
				style={ { width: 'auto', height: '16px' } }
			/>
		),
		title: __( 'Get up to 66% off' ),
		description: __(
			'Get up to 66% off WordPress.com’s world-class hosting when you buy in bulk and resell to clients. Ideal for agencies that build and hand off to clients.'
		),
		cta: {
			label: __( 'Save on WordPress.com' ),
			url: A4A_MARKETPLACE_HOSTING_WPCOM_LINK,
			purchase_type: MARKETPLACE_TYPE_REGULAR,
		},
	},
	{
		id: 'pressable-hosting-resell',
		offerType: 'resell',
		product: 'pressable',
		productType: 'hosting',
		logo: <img src={ PressableLogo } alt="Pressable" style={ { width: 'auto', height: '16px' } } />,
		title: __( 'Get up to 75% off' ),
		description: __(
			'Get up to 75% off Pressable’s best-in-class hosting when you buy in bulk and resell to clients. Ideal for agencies that build and continue to maintain sites or stores.'
		),
		cta: {
			label: __( 'Save on Pressable' ),
			url: A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK,
			purchase_type: MARKETPLACE_TYPE_REGULAR,
		},
	},
	{
		id: 'woo-products-resell',
		offerType: 'resell',
		product: 'woocommerce',
		productType: 'extension',
		logo: <img src={ WooLogo } alt="WooCommerce" style={ { width: 'auto', height: '16px' } } />,
		title: __( 'Get up to 50% off' ),
		description: __(
			'Get up to 50% off when you purchase Woo extensions in bulk and resell to your clients.'
		),
		cta: {
			label: __( 'Save on Woo' ),
			url: addQueryArgs( A4A_MARKETPLACE_PRODUCTS_LINK, {
				category: PRODUCT_BRAND_FILTER_WOOCOMMERCE,
			} ),
			purchase_type: MARKETPLACE_TYPE_REGULAR,
		},
	},
	{
		id: 'jetpack-products-resell',
		offerType: 'resell',
		product: 'jetpack',
		logo: <img src={ JetpackLogo } alt="Jetpack" style={ { width: 'auto', height: '16px' } } />,
		title: __( 'Get up to 80% off' ),
		description: __(
			'Get up to 80% off Jetpack’s security, performance, and growth products when you buy in bulk and resell to your clients.'
		),
		cta: {
			label: __( 'Save on Jetpack' ),
			url: addQueryArgs( A4A_MARKETPLACE_PRODUCTS_LINK, {
				category: PRODUCT_BRAND_FILTER_JETPACK,
			} ),
			purchase_type: MARKETPLACE_TYPE_REGULAR,
		},
	},
	{
		id: 'woopayments-resell',
		offerType: 'resell',
		product: 'woocommerce',
		productType: 'extension',
		logo: (
			<img src={ WooPaymentsLogo } alt="WooPayments" style={ { width: 'auto', height: '16px' } } />
		),
		title: __( 'Earn up to 5 bps on all TPV' ),
		description: __(
			'Earn up to a 5 basis points (bps) revenue share on all Total Payments Volume (TPV) processed on client stores you onboard or migrate to WooPayments.'
		),
		cta: {
			label: __( 'Earn with WooPayments' ),
			url: A4A_WOOPAYMENTS_OVERVIEW_LINK,
		},
	},
];
