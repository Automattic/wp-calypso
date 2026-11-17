import { __experimentalText as Text, __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import AvalaraLogo from './images/avalara.svg';
import EasyPostLogo from './images/easypost.svg';
import JetpackLogo from './images/jetpack-descriptor.svg';
import PacklinkLogo from './images/packlink.svg';
import PressableLogo from './images/pressable-descriptor.svg';
import ShipStationLogo from './images/shipstation.svg';
import VIPLogo from './images/vip-descriptor.svg';
import WooLogo from './images/woo-descriptor.svg';
import WooPaymentsLogo from './images/woopayments.svg';
import WordPressDotComLogo from './images/wordpressdotcom-descriptor.svg';
import type { PartnerOffer, PartnerOfferLinks } from './types';

// Marketplace constant values inlined from client/a8c-for-agencies so the
// dashboard has no dependency on the classic A4A app.
const MARKETPLACE_TYPE_REFERRAL = 'referral';
const MARKETPLACE_TYPE_REGULAR = 'regular';
const PRODUCT_BRAND_FILTER_WOOCOMMERCE = 'woocommerce';
const PRODUCT_BRAND_FILTER_JETPACK = 'jetpack';

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

export const getPartnerOffers = ( links: PartnerOfferLinks ): PartnerOffer[] => [
	{
		id: 'wordpress-com-hosting-refer',
		offerType: 'refer',
		product: 'wordpress',
		productType: 'hosting',
		logo: <img src={ WordPressDotComLogo } alt="WordPress.com" />,
		title: __( 'Earn a 20% recurring commission' ),
		description: __(
			"Earn a 20% recurring commission when you refer WordPress.com's world-class hosting to your clients. Ideal for agencies that build and hand off to clients."
		),
		cta: {
			label: __( 'Refer WordPress.com' ),
			url: links.hostingWpcom,
			purchase_type: MARKETPLACE_TYPE_REFERRAL,
		},
	},
	{
		id: 'pressable-hosting-refer',
		offerType: 'refer',
		product: 'pressable',
		productType: 'hosting',
		logo: <img src={ PressableLogo } alt="Pressable" />,
		title: __( 'Earn a 20% recurring commission' ),
		description: __(
			'Earn a 20% recurring commission when you refer Pressable’s best-in-class hosting to your clients. Ideal for agencies that build and continue to maintain sites or stores.'
		),
		cta: {
			label: __( 'Refer Pressable' ),
			url: links.hostingPressable,
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
				<img src={ PressableLogo } alt="Pressable" />
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
			url: links.referPressablePremium,
		},
	},
	{
		id: 'vip-hosting-refer',
		offerType: 'refer',
		product: 'wordpress',
		productType: 'hosting',
		logo: <img src={ VIPLogo } alt="WordPress VIP" />,
		title: __( 'Earn up to a 20% one-time commission' ),
		description: __(
			'Earn up to a 20% one-time commission when you refer WordPress VIP’s enterprise-grade hosting to your clients.'
		),
		cta: {
			label: __( 'Refer WordPress VIP' ),
			url: links.referEnterprise,
		},
	},
	{
		id: 'woo-products-refer',
		offerType: 'refer',
		product: 'woocommerce',
		productType: 'extension',
		logo: <img src={ WooLogo } alt="WooCommerce" />,
		title: __( 'Earn a 50% recurring commission' ),
		description: __(
			'Earn a 50% recurring commission when you refer Woo extensions to your clients.'
		),
		cta: {
			label: __( 'Refer Woo' ),
			url: addQueryArgs( links.products, {
				category: PRODUCT_BRAND_FILTER_WOOCOMMERCE,
			} ),
			purchase_type: MARKETPLACE_TYPE_REFERRAL,
		},
	},
	{
		id: 'jetpack-products-refer',
		offerType: 'refer',
		product: 'jetpack',
		logo: <img src={ JetpackLogo } alt="Jetpack" />,
		title: __( 'Earn a 50% recurring commission' ),
		description: __(
			'Earn a 50% recurring commission when you refer any of Jetpack’s security, performance, and growth products to your clients.'
		),
		cta: {
			label: __( 'Refer Jetpack' ),
			url: addQueryArgs( links.products, {
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
		logo: <img src={ WordPressDotComLogo } alt="WordPress.com" />,
		title: __( 'Get up to 66% off' ),
		description: __(
			'Get up to 66% off WordPress.com’s world-class hosting when you buy in bulk and resell to clients. Ideal for agencies that build and hand off to clients.'
		),
		cta: {
			label: __( 'Save on WordPress.com' ),
			url: links.hostingWpcom,
			purchase_type: MARKETPLACE_TYPE_REGULAR,
		},
	},
	{
		id: 'pressable-hosting-resell',
		offerType: 'resell',
		product: 'pressable',
		productType: 'hosting',
		logo: <img src={ PressableLogo } alt="Pressable" />,
		title: __( 'Get up to 75% off' ),
		description: __(
			'Get up to 75% off Pressable’s best-in-class hosting when you buy in bulk and resell to clients. Ideal for agencies that build and continue to maintain sites or stores.'
		),
		cta: {
			label: __( 'Save on Pressable' ),
			url: links.hostingPressable,
			purchase_type: MARKETPLACE_TYPE_REGULAR,
		},
	},
	{
		id: 'woo-products-resell',
		offerType: 'resell',
		product: 'woocommerce',
		productType: 'extension',
		logo: <img src={ WooLogo } alt="WooCommerce" />,
		title: __( 'Get up to 50% off' ),
		description: __(
			'Get up to 50% off when you purchase Woo extensions in bulk and resell to your clients.'
		),
		cta: {
			label: __( 'Save on Woo' ),
			url: addQueryArgs( links.products, {
				category: PRODUCT_BRAND_FILTER_WOOCOMMERCE,
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
			<img
				className="exclusive-offers-card-logo-compact"
				src={ WooPaymentsLogo }
				alt="WooPayments"
			/>
		),
		title: __( 'Earn up to 5 bps on all TPV' ),
		description: __(
			'Earn up to a 5 basis points (bps) revenue share on all Total Payments Volume (TPV) processed on client stores you onboard or migrate to WooPayments.'
		),
		cta: {
			label: __( 'Earn with WooPayments' ),
			url: links.woopayments,
		},
	},
];

export const getTrustedPartners = (): PartnerOffer[] => [
	{
		id: 'shipstation',
		offerType: 'partner',
		tracksEventName: 'calypso_a4a_exclusive_offers_trusted_partner_shipstation_click',
		logo: <img src={ ShipStationLogo } alt="ShipStation" />,
		title: __( 'Help enhance customer experiences' ),
		description: __(
			'Equip your clients with a best-in-class shipping and fulfillment solution that cuts costs, streamlines operations, and delivers a superior post-purchase experience.'
		),
		cta: {
			label: __( 'Explore ShipStation' ),
			url: 'https://www.shipstation.com/partnership-options/',
			external: true,
		},
	},
	{
		id: 'packlink',
		offerType: 'partner',
		tracksEventName: 'calypso_a4a_exclusive_offers_trusted_partner_packlink_click',
		logo: <img src={ PacklinkLogo } alt="Packlink" />,
		title: __( 'Boost efficiency for better retention' ),
		description: __(
			'Help your customers to get their ship organised - with better rates and automation tools that turn shipping from a cost centre into a growth driver!'
		),
		cta: {
			label: __( 'Explore Packlink PRO' ),
			url: 'https://partners.auctane.com',
			external: true,
		},
	},
	{
		id: 'easypost-norton-shopping-guarantee',
		offerType: 'partner',
		tracksEventName: 'calypso_a4a_exclusive_offers_trusted_partner_easypost_click',
		logo: <img src={ EasyPostLogo } alt="EasyPost" />,
		title: __( 'Build trust and boost conversions' ),
		description: __(
			'Protect every WooCommerce order from cart to delivery with Norton Shopping Guarantee badges, buyer guarantees, and package protection at no extra cost to merchants.'
		),
		cta: {
			label: __( 'Explore Norton' ),
			url: 'https://woocommerce.com/products/norton-shopping-guarantee-with-package-protection',
			external: true,
		},
	},
	{
		id: 'avalara-partner-program-refer',
		offerType: 'partner',
		tracksEventName: 'calypso_a4a_exclusive_offers_trusted_partner_avalara_click',
		logo: <img className="exclusive-offers-card-logo-compact" src={ AvalaraLogo } alt="Avalara" />,
		title: __( 'Join the Avalara Partner Program and unlock new revenue streams' ),
		description: __(
			'Help clients navigate tax complexity with a trusted partner—while unlocking new revenue opportunities for your business.'
		),
		termsUrl: 'https://legal.avalara.com/partner.legal.center#generalpartnerterms',
		cta: {
			label: __( 'Explore Avalara' ),
			url: 'https://www.avalara.com/us/en/partners/partner-programs.html',
			external: true,
		},
	},
];
