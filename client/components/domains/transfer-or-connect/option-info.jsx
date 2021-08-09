/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { INCOMING_DOMAIN_TRANSFER, MAP_EXISTING_DOMAIN } from 'calypso/lib/url/support';

/**
 * Image dependencies
 */
import transferIllustration from 'calypso/assets/images/customer-home/illustration-webinars.svg';
// TODO: replace this illustration with `client/assets/images/illustrations/domain-connected.svg` once #54685 is merged
import connectIllustration from 'calypso/assets/images/customer-home/disconnected.svg';

const titleText = {
	transfer: __( 'Transfer your domain' ),
	connect: __( 'Connect your domain' ),
};

const pricingText = __( 'No additional charge with your plan' );

export const optionInfo = {
	transferSupported: {
		illustration: transferIllustration,
		titleText: titleText.transfer,
		topText: __( 'Manage your domain directly on WordPress.com' ),
		recommended: true,
		learnMoreLink: INCOMING_DOMAIN_TRANSFER,
		benefits: [
			__( 'Manage everything you need in one place' ),
			__( "We'll renew your domain for another year" ),
			__( 'Private domain registration and SSL certificate included for free' ),
		],
		pricing: {
			color: 'green',
			text: __( 'Free transfer with your plan' ),
			cost: '$18/year renewal',
		},
		onSelect: () => {},
	},
	connectSupported: {
		illustration: connectIllustration,
		titleText: titleText.connect,
		topText: __( 'Keep your domain with your current provider and point it to WordPress.com' ),
		learnMoreLink: MAP_EXISTING_DOMAIN,
		benefits: [ __( 'Keep your current provider' ), __( 'SSL certificate included for free' ) ],
		pricing: {
			text: pricingText,
		},
		onSelect: () => {},
	},
};

export const availabilityState = {
	MAPPABLE_AND_TRANSFERABLE: {
		mappable: 'mappable',
		status: 'transferrable',
		optionContent: [
			{ primary: true, ...optionInfo.transferSupported },
			{ primary: false, ...optionInfo.connectSupported },
		],
	},
	MAPPABLE_AND_UNSUPPORTED_TLD: {
		mappable: 'mappable',
		status: 'tld_not_supported',
	},
	MAPPABLE_AND_NOT_TRANSFERABLE: {},
	AVAILABLE: {},
};
