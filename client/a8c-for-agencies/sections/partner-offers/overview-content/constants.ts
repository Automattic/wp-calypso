import { __ } from '@wordpress/i18n';
import {
	A4A_MARKETPLACE_HOSTING_WPCOM_LINK,
	A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import PressableLogo from 'calypso/assets/images/a8c-for-agencies/pressable-logo.svg';
import WPCOMLogo from 'calypso/assets/images/a8c-for-agencies/wpcom-logo.svg';
import type { PartnerOffer } from './types';

export const filterOptions = {
	offerTypes: [
		{ value: 'referral', label: __( 'Referral' ) },
		{ value: 'reseller', label: __( 'Reseller' ) },
	],
	products: [
		{ value: 'wordpress', label: __( 'WordPress.com' ) },
		{ value: 'pressable', label: __( 'Pressable' ) },
	],
	productTypes: [ { value: 'hosting', label: __( 'Hosting' ) } ],
	categories: [
		{ value: 'hosting', label: __( 'Hosting' ) },
		{ value: 'payments', label: __( 'Payments' ) },
	],
};

export const partnerOffers: PartnerOffer[] = [
	{
		id: 'wordpress-com-hosting-referral',
		offerType: 'referral',
		product: 'wordpress',
		productType: 'hosting',
		category: 'hosting',
		logo: WPCOMLogo,
		title: __( 'Earn a 20% recurring commission' ),
		description: __(
			"Earn a 20% recurring commission when you refer WordPress.com's world-class hosting to your clients. Ideal for agencies that build and hand off to clients."
		),
		cta: {
			label: __( 'Refer WordPress.com' ),
			url: A4A_MARKETPLACE_HOSTING_WPCOM_LINK,
		},
	},
	{
		id: 'pressable-hosting-referral',
		offerType: 'referral',
		product: 'pressable',
		productType: 'hosting',
		category: 'hosting',
		logo: PressableLogo,
		title: __( 'Earn a 20% recurring commission' ),
		description: __(
			'Earn a 20% recurring commission when you refer Pressable’s best-in-class hosting to your clients. Ideal for agencies that build and continue to maintain sites or stores.'
		),
		cta: {
			label: __( 'Refer Pressable' ),
			url: A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK,
		},
	},
];
