import { __experimentalText as Text, __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import {
	A4A_MARKETPLACE_HOSTING_WPCOM_LINK,
	A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK,
	A4A_MARKETPLACE_HOSTING_REFER_PRESSABLE_PREMIUM_PLAN_LINK,
	A4A_MARKETPLACE_HOSTING_REFER_ENTERPRISE_LINK,
	A4A_MARKETPLACE_PRODUCTS_LINK,
	A4A_WOOPAYMENTS_OVERVIEW_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import {
	PRODUCT_BRAND_FILTER_JETPACK,
	PRODUCT_BRAND_FILTER_WOOCOMMERCE,
} from 'calypso/a8c-for-agencies/sections/marketplace/constants';
import {
	MARKETPLACE_TYPE_REFERRAL,
	MARKETPLACE_TYPE_REGULAR,
} from 'calypso/a8c-for-agencies/sections/marketplace/hoc/with-marketplace-type';
import JetpackLogo from './images/jetpack.svg';
import PressableLogo from './images/pressable.svg';
import VIPLogo from './images/vip.svg';
import WooLogo from './images/woo.svg';
import WooPaymentsLogo from './images/woopayments.svg';
import WordPressDotComLogo from './images/wordpressdotcom.svg';
import type { PartnerOffer } from './types';

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
