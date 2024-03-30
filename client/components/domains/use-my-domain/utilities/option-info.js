import { INCOMING_DOMAIN_TRANSFER, MAP_EXISTING_DOMAIN } from '@automattic/urls';
import { __ } from '@wordpress/i18n';
import connectIllustration from 'calypso/assets/images/domains/connect.svg';
import transferIllustration from 'calypso/assets/images/domains/transfer.svg';

const optionTitleText = {
	get transfer() {
		return __( 'Transfer your domain' );
	},
	get connect() {
		return __( 'Connect your domain' );
	},
};

const transferSupported = {
	illustration: transferIllustration,
	get titleText() {
		return optionTitleText.transfer;
	},
	get topText() {
		return __( 'Manage your domain directly on WordPress.com' );
	},
	learnMoreLink: INCOMING_DOMAIN_TRANSFER,
	get benefits() {
		return [
			__( "We'll renew your domain for another year" ),
			__( 'Manage everything you need in one place' ),
			__( 'Private domain registration and SSL certificate included for free' ),
		];
	},
};

const transferNotSupported = {
	illustration: transferIllustration,
	get titleText() {
		return optionTitleText.transfer;
	},
	get topText() {
		return __( 'This domain cannot be transfered.' );
	},
	learnMoreLink: INCOMING_DOMAIN_TRANSFER,
};

const connectSupported = {
	illustration: connectIllustration,
	get titleText() {
		return optionTitleText.connect;
	},
	get topText() {
		return __( 'Keep your domain with your current provider and point it to WordPress.com' );
	},
	learnMoreLink: MAP_EXISTING_DOMAIN,
	get benefits() {
		return [ __( 'Keep your current provider' ), __( 'SSL certificate included for free' ) ];
	},
};

const connectNotSupported = {
	illustration: connectIllustration,
	get titleText() {
		return optionTitleText.connect;
	},
	get topText() {
		return __( 'This domain cannot be connected.' );
	},
	learnMoreLink: MAP_EXISTING_DOMAIN,
};
export const optionInfo = {
	transferSupported,
	transferNotSupported,
	connectSupported,
	connectNotSupported,
};
