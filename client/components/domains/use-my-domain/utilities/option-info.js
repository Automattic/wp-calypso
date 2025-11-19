import config from '@automattic/calypso-config';
import { INCOMING_DOMAIN_TRANSFER, MAP_EXISTING_DOMAIN } from '@automattic/urls';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import connectImage from 'calypso/assets/images/domains/connect.svg';
import transferImage from 'calypso/assets/images/domains/transfer.svg';
import ConnectIcon from '../transfer-or-connect/icons/connect';
import TransferIcon from '../transfer-or-connect/icons/transfer';

const isDomainConnectionRedesign = config.isEnabled( 'domain-connection-redesign' );
const connectIllustration = isDomainConnectionRedesign ? (
	<Icon icon={ ConnectIcon } />
) : (
	connectImage
);
const transferIllustration = isDomainConnectionRedesign ? (
	<Icon icon={ TransferIcon } />
) : (
	transferImage
);

const optionTitleText = {
	get transfer() {
		return isDomainConnectionRedesign
			? __( 'Transfer your domain name' )
			: __( 'Transfer your domain' );
	},
	get connect() {
		return isDomainConnectionRedesign
			? __( 'Connect your site address' )
			: __( 'Connect your domain' );
	},
};

const transferSupported = {
	illustration: transferIllustration,
	get titleText() {
		return optionTitleText.transfer;
	},
	get topText() {
		return isDomainConnectionRedesign
			? __( 'Manage everything in one place, including domain name renewals.' )
			: __( 'Manage your domain directly on WordPress.com' );
	},
	get etaText() {
		return __( 'May take 5–7 days' );
	},
	learnMoreLink: INCOMING_DOMAIN_TRANSFER,
	get benefits() {
		if ( isDomainConnectionRedesign ) {
			return [
				__( 'Free domain name renewal for 1 year' ),
				__( 'Manage everything in one place' ),
				__( 'Private domain registration and SSL included' ),
			];
		}

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
		return isDomainConnectionRedesign
			? __( 'Connect your existing domain name to WordPress.com.' )
			: __( 'Keep your domain with your current provider and point it to WordPress.com' );
	},
	get etaText() {
		return __( 'May take up to 72 hours' );
	},
	learnMoreLink: MAP_EXISTING_DOMAIN,
	get benefits() {
		if ( isDomainConnectionRedesign ) {
			return [
				__( 'Keep your current domain name provider' ),
				__( "Your existing services won't be interrupted" ),
				__( 'Privacy protection and SSL included' ),
			];
		}

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
