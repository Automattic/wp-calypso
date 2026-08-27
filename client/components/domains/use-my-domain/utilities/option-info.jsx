import { INCOMING_DOMAIN_TRANSFER, MAP_EXISTING_DOMAIN } from '@automattic/urls';
import { Icon, __experimentalVStack as VStack } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
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
			<VStack as="span" spacing={ 2 }>
				<span>
					{ __( 'We become your provider and you can manage everything from one place.' ) }
				</span>
				<span>
					{ /* translators: how long a domain transfer takes to complete */ }
					{ __( 'Takes 5–7 days.' ) }
				</span>
			</VStack>
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

// `losingRegistrar` comes from the inbound-transfer-status endpoint, which is allowed to fail
// silently, so it is often unavailable — fall back to generic wording when it is.
export function getConnectSupportedTopText( losingRegistrar ) {
	return (
		<VStack as="span" spacing={ 2 }>
			<span>
				{ losingRegistrar
					? sprintf(
							/* translators: %s - the domain registrar the user is currently with (ex.: GoDaddy, Namecheap) */
							__( 'Your domain name stays with %s and will just point to your new site.' ),
							losingRegistrar
					  )
					: __(
							'Your domain name stays with your current registrar and will just point to your new site.'
					  ) }
			</span>
			<span>
				{ /* translators: how long connecting a domain takes to complete */ }
				{ __( 'Takes a few hours.' ) }
			</span>
		</VStack>
	);
}

const connectSupported = {
	illustration: connectIllustration,
	get titleText() {
		return optionTitleText.connect;
	},
	get topText() {
		return getConnectSupportedTopText();
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
