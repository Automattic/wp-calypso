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

export const getPartnerOffers = ( links: PartnerOfferLinks ): PartnerOffer[] => [
	{
		id: 'wordpress-com-hosting-refer',
		offerType: 'refer',
		product: 'wordpress',
		productType: 'hosting',
		logo: <img src={ WordPressDotComLogo } alt="WordPress.com" />,
		title: __( '20% recurring commission' ),
		description: __(
			"Refer WordPress.com's world-class hosting to your clients. Ideal for agencies that build and hand off to clients."
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
		title: __( '20% recurring commission' ),
		description: __(
			'Refer Pressable’s best-in-class hosting to your clients. Ideal for agencies that build and continue to maintain sites or stores.'
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
		title: __( '20% recurring commission' ),
		description: __(
			'Refer Pressable Premium to your clients. Ideal for mission-critical sites that demand extra attention and resources.'
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
		title: __( 'Up to 20% one-time commission' ),
		description: __( 'Refer WordPress VIP’s enterprise-grade hosting to your clients.' ),
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
		title: __( '50% recurring commission' ),
		description: __( 'Refer Woo extensions to your clients.' ),
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
		title: __( '50% recurring commission' ),
		description: __(
			'Refer any of Jetpack’s security, performance, and growth products to your clients.'
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
		title: __( 'Up to 66% off' ),
		description: __(
			'Buy WordPress.com’s world-class hosting in bulk and resell to clients. Ideal for agencies that build and hand off to clients.'
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
		title: __( 'Up to 75% off' ),
		description: __(
			'Buy Pressable’s best-in-class hosting in bulk and resell to clients. Ideal for agencies that build and continue to maintain sites or stores.'
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
		title: __( 'Up to 50% off' ),
		description: __( 'Purchase Woo extensions in bulk and resell to your clients.' ),
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
		offerType: 'revenue-share',
		badge: __( 'Revenue share' ),
		product: 'woocommerce',
		productType: 'extension',
		logo: (
			<img
				className="exclusive-offers-card-logo-compact"
				src={ WooPaymentsLogo }
				alt="WooPayments"
			/>
		),
		title: __( 'Up to 5 bps on all TPV' ),
		description: __(
			'Earn a revenue share of up to 5 basis points (bps) on all Total Payments Volume (TPV) processed on client stores you onboard or migrate to WooPayments.'
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
		badge: __( 'Shipping' ),
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
		badge: __( 'Shipping' ),
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
		badge: __( 'Buyer protection' ),
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
		badge: __( 'Tax compliance' ),
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
