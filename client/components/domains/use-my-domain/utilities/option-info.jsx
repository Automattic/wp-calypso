import { INCOMING_DOMAIN_TRANSFER, MAP_EXISTING_DOMAIN } from '@automattic/urls';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import ConnectIcon from '../transfer-or-connect/icons/connect';
import TransferIcon from '../transfer-or-connect/icons/transfer';

const connectIllustration = <Icon icon={ ConnectIcon } />;
const transferIllustration = <Icon icon={ TransferIcon } />;

const optionTitleText = {
	get transfer() {
		return __( 'Transfer your domain' );
	},
	get connect() {
		return __( 'Connect your site address' );
	},
};

const transferSupported = {
	illustration: transferIllustration,
	get titleText() {
		return optionTitleText.transfer;
	},
	get topText() {
		return __( 'Manage everything in one place.' );
	},
	get etaText() {
		return __( 'May take 5–7 days' );
	},
	learnMoreLink: INCOMING_DOMAIN_TRANSFER,
	get benefits() {
		return [
			__( 'Free domain name renewal for 1 year' ),
			__( 'Manage everything from WordPress.com' ),
			__( 'Privacy protection and SSL included' ),
		];
	},
};

const transferNotSupported = {
	illustration: transferIllustration,
	get titleText() {
		return optionTitleText.transfer;
	},
	get topText() {
		return __( 'This domain name cannot be transferred.' );
	},
	learnMoreLink: INCOMING_DOMAIN_TRANSFER,
};

const connectSupported = {
	illustration: connectIllustration,
	get titleText() {
		return optionTitleText.connect;
	},
	get topText() {
		return __( 'Use your existing domain with your site.' );
	},
	get etaText() {
		return __( 'May take up to 72 hours' );
	},
	learnMoreLink: MAP_EXISTING_DOMAIN,
	get benefits() {
		return [
			__( 'Keep your current domain provider' ),
			__( 'Email and other services stay connected' ),
			__( 'Privacy protection and SSL included' ),
		];
	},
};

const connectNotSupported = {
	illustration: connectIllustration,
	get titleText() {
		return optionTitleText.connect;
	},
	get topText() {
		return __( 'This domain name cannot be connected.' );
	},
	learnMoreLink: MAP_EXISTING_DOMAIN,
};
export const optionInfo = {
	transferSupported,
	transferNotSupported,
	connectSupported,
	connectNotSupported,
};
