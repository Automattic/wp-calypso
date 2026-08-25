import { INCOMING_DOMAIN_TRANSFER, MAP_EXISTING_DOMAIN } from '@automattic/urls';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { backup, envelope, globe, shield, wordpress } from '@wordpress/icons';
import ConnectIcon from '../transfer-or-connect/icons/connect';
import TransferIcon from '../transfer-or-connect/icons/transfer';

const connectIllustration = <Icon icon={ ConnectIcon } />;
const transferIllustration = <Icon icon={ TransferIcon } />;

const optionTitleText = {
	get transfer() {
		return __( 'Transfer your domain name to WordPress.com' );
	},
	get connect() {
		return __( 'Connect your domain name to this site' );
	},
};

const transferSupported = {
	illustration: transferIllustration,
	get titleText() {
		return optionTitleText.transfer;
	},
	get topText() {
		return (
			<>
				<span>
					{ __( 'We become your provider and you can manage everything from one place.' ) }
				</span>
				<span>{ __( 'Takes 5–7 days.' ) }</span>
			</>
		);
	},
	learnMoreLink: INCOMING_DOMAIN_TRANSFER,
	get benefits() {
		return [
			{ icon: backup, text: __( 'Includes a year’s renewal' ) },
			{ icon: wordpress, text: __( 'Manage everything from WordPress.com' ), iconSize: 16 },
			{ icon: shield, text: __( 'Privacy protection and SSL included' ) },
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
		return (
			<>
				<span>
					{ __( 'Your domain name stays with GoDaddy and will just point to your new site.' ) }
				</span>
				<span>{ __( 'Takes a few hours.' ) }</span>
			</>
		);
	},
	learnMoreLink: MAP_EXISTING_DOMAIN,
	get benefits() {
		return [
			{ icon: globe, text: __( 'Keep your current domain registrar' ) },
			{ icon: envelope, text: __( 'Email and other services stay connected' ) },
			{ icon: shield, text: __( 'Privacy protection and SSL included' ) },
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
