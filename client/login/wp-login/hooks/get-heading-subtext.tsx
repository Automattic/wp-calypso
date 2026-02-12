import { localizeUrl } from '@automattic/i18n-utils';
import { type LocalizeProps } from 'i18n-calypso';

interface Props {
	isSocialFirst: boolean;
	twoFactorAuthType: string;
	action?: string;
	isWooJPC?: boolean;
	isFromPassport?: boolean;
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
	isFromPassport,
}: Props ) => {
	if ( ! isSocialFirst || twoFactorAuthType ) {
		return null;
	}

	const tosOwner = isFromPassport ? 'WordPress.com\u2019s' : translate( 'our' );
	const privacyOwner = isFromPassport ? translate( 'their' ) : translate( 'our' );

	const tos = (
		<span className="wp-login__one-login-layout-tos">
			{ translate(
				'By continuing with any of the options below, you agree to %(tosOwner)s {{tosLink}}Terms of Service{{/tosLink}} and have read %(privacyOwner)s {{privacyLink}}Privacy Policy{{/privacyLink}}.',
				{
					args: { tosOwner, privacyOwner },
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
