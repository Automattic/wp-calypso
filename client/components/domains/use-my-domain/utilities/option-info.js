import { __ } from '@wordpress/i18n';
import transferIllustration from 'calypso/assets/images/customer-home/illustration-webinars.svg';
import connectIllustration from 'calypso/assets/images/illustrations/domain-connected.svg';
import { INCOMING_DOMAIN_TRANSFER, MAP_EXISTING_DOMAIN } from 'calypso/lib/url/support';

const optionTitleText = {
	transfer: __( 'Transfer your domain' ),
	connect: __( 'Connect your domain' ),
};

const transferSupported = {
	illustration: transferIllustration,
	titleText: optionTitleText.transfer,
	topText: __( 'Manage your domain directly on WordPress.com' ),
	learnMoreLink: INCOMING_DOMAIN_TRANSFER,
	benefits: [
		__( "We'll renew your domain for another year" ),
		__( 'Manage everything you need in one place' ),
		__( 'Private domain registration and SSL certificate included for free' ),
	],
};

const transferNotSupported = {
	illustration: transferIllustration,
	titleText: optionTitleText.transfer,
	topText: __( 'This domain cannot be transfered.' ),
	learnMoreLink: INCOMING_DOMAIN_TRANSFER,
};

const connectSupported = {
	illustration: connectIllustration,
	titleText: optionTitleText.connect,
	topText: __( 'Keep your domain with your current provider and point it to WordPress.com' ),
	learnMoreLink: MAP_EXISTING_DOMAIN,
	benefits: [ __( 'Keep your current provider' ), __( 'SSL certificate included for free' ) ],
};

const connectNotSupported = {
	illustration: connectIllustration,
	titleText: optionTitleText.connect,
	topText: __( 'This domain cannot be connected.' ),
	learnMoreLink: MAP_EXISTING_DOMAIN,
};
export const optionInfo = {
	transferSupported,
	transferNotSupported,
	connectSupported,
	connectNotSupported,
};

/**
 * Define properties with translatable strings getters.
 */
Object.defineProperties( optionTitleText, {
	transfer: {
		get: () => __( 'Transfer your domain' ),
	},
	connect: {
		get: () => __( 'Connect your domain' ),
	},
} );
Object.defineProperties( transferSupported, {
	topText: {
		get: () => __( 'Manage your domain directly on WordPress.com' ),
	},
	benefits: {
		get: () => [
			__( "We'll renew your domain for another year" ),
			__( 'Manage everything you need in one place' ),
			__( 'Private domain registration and SSL certificate included for free' ),
		],
	},
	titleText: {
		get: () => optionTitleText.transfer,
	},
} );
Object.defineProperties( transferNotSupported, {
	topText: {
		get: () => __( 'This domain cannot be transfered.' ),
	},
	titleText: {
		get: () => optionTitleText.transfer,
	},
} );
Object.defineProperties( connectSupported, {
	topText: {
		get: () => __( 'Keep your domain with your current provider and point it to WordPress.com' ),
	},
	benefits: {
		get: () => [ __( 'Keep your current provider' ), __( 'SSL certificate included for free' ) ],
	},
	titleText: {
		get: () => optionTitleText.connect,
	},
} );
Object.defineProperties( connectNotSupported, {
	topText: {
		get: () => __( 'This domain cannot be connected.' ),
	},
	titleText: {
		get: () => optionTitleText.connect,
	},
} );
