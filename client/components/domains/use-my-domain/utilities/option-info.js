/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import transferIllustration from 'calypso/assets/images/customer-home/illustration-webinars.svg';
import connectIllustration from 'calypso/assets/images/illustrations/domain-connected.svg';
import { INCOMING_DOMAIN_TRANSFER, MAP_EXISTING_DOMAIN } from 'calypso/lib/url/support';

const optionTitleText = {
	transfer: __( 'Transfer your domain' ),
	connect: __( 'Connect your domain' ),
};

export const optionInfo = {
	transferSupported: {
		illustration: transferIllustration,
		titleText: optionTitleText.transfer,
		topText: __( 'Manage your domain directly on WordPress.com' ),
		recommended: true,
		learnMoreLink: INCOMING_DOMAIN_TRANSFER,
		benefits: [
			__( 'Manage everything you need in one place' ),
			__( "We'll renew your domain for another year" ),
			__( 'Private domain registration and SSL certificate included for free' ),
		],
		onSelect: () => {},
	},
	transferNotSupported: {
		illustration: transferIllustration,
		titleText: optionTitleText.transfer,
		topText: __( 'This domain cannot be transfered.' ),
		learnMoreLink: INCOMING_DOMAIN_TRANSFER,
	},
	connectSupported: {
		illustration: connectIllustration,
		titleText: optionTitleText.connect,
		topText: __( 'Keep your domain with your current provider and point it to WordPress.com' ),
		learnMoreLink: MAP_EXISTING_DOMAIN,
		benefits: [ __( 'Keep your current provider' ), __( 'SSL certificate included for free' ) ],
		onSelect: () => {},
	},
	connectNotSupported: {
		illustration: connectIllustration,
		titleText: optionTitleText.connect,
		topText: __( 'This domain cannot be connected.' ),
		learnMoreLink: MAP_EXISTING_DOMAIN,
	},
};
