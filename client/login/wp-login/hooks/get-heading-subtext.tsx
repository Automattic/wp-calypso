import { localizeUrl } from '@automattic/i18n-utils';
import { type LocalizeProps } from 'i18n-calypso';
import { getLoginCopy } from 'calypso/jetpack-connect/connection-content';
import type { PartnerConfig } from 'calypso/lib/partner-branding';

interface Props {
	isSocialFirst: boolean;
	twoFactorAuthType: string;
	action?: string;
	isWooJPC?: boolean;
	partnerConfig?: PartnerConfig | null;
	isFromJetpackConnector?: boolean;
	connectorPlugins?: string[];
	translate: LocalizeProps[ 'translate' ];
}

/**
 * TODO This will be replaced by a hook in the future.
 */
const getHeadingSubText = ( {
	isSocialFirst,
	twoFactorAuthType,
	action,
	translate,
	isWooJPC,
	partnerConfig,
	isFromJetpackConnector,
	connectorPlugins,
}: Props ) => {
	if ( ! isSocialFirst || twoFactorAuthType ) {
		return null;
	}

	const tos = (
		<span className="wp-login__one-login-layout-tos">
			{ partnerConfig
				? translate(
						'By continuing with any of the options below, you agree to our {{tosLink}}Terms of Service{{/tosLink}} and have read our {{privacyLink}}Privacy Policy{{/privacyLink}}. WordPress.com is used to manage your account.',
						{
							components: {
								tosLink: (
									<a
										href={ localizeUrl( 'https://wordpress.com/tos/' ) }
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
								privacyLink: (
									<a
										href={ localizeUrl( 'https://automattic.com/privacy/' ) }
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
						}
				  )
				: translate(
						'By continuing with any of the options below, you agree to our {{tosLink}}Terms of Service{{/tosLink}} and have read our {{privacyLink}}Privacy Policy{{/privacyLink}}.',
						{
							components: {
								tosLink: (
									<a
										href={ localizeUrl( 'https://wordpress.com/tos/' ) }
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
								privacyLink: (
									<a
										href={ localizeUrl( 'https://automattic.com/privacy/' ) }
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
						}
				  ) }
		</span>
	);

	// Unified connection flow (jetpack-connector): a prominent, dotcom-styled
	// subtitle sourced from the shared resolver sits between the H1 and the
	// existing ToS line. The resolver returns the family-driven benefit
	// clause for the active plugin set; the ToS keeps its established
	// subtle styling underneath. Lostpassword keeps the standard
	// reset-instructions copy.
	if ( isFromJetpackConnector && 'lostpassword' !== action ) {
		return {
			primary: getLoginCopy( connectorPlugins ).subtitle,
			secondary: tos,
		};
	}

	const primary = isWooJPC
		? translate(
				"To access all of the features and functionality of the extensions you've chosen, you'll first need to connect your store to an account."
		  )
		: tos;

	const secondary = isWooJPC && 'lostpassword' !== action ? tos : null;

	return {
		primary:
			'lostpassword' === action
				? translate(
						"Please enter your username or email address. You'll receive a link to create a new password via email."
				  )
				: primary,
		secondary,
	};
};

export default getHeadingSubText;
