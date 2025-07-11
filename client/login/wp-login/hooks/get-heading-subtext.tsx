import { localizeUrl } from '@automattic/i18n-utils';
import { type LocalizeProps, fixMe } from 'i18n-calypso';

interface Props {
	isSocialFirst: boolean;
	twoFactorAuthType: string;
	action?: string;
	translate: LocalizeProps[ 'translate' ];
}

/**
 * TODO This will be replaced by a hook in the future.
 */
const getHeadingSubText = ( { isSocialFirst, twoFactorAuthType, action, translate }: Props ) => {
	if ( ! isSocialFirst || twoFactorAuthType ) {
		return null;
	}

	const tos = fixMe( {
		text: 'Just a little reminder that by continuing with any of the options below, you agree to our {{tosLink}}Terms of Service{{/tosLink}} and {{privacyLink}}Privacy Policy{{/privacyLink}}.',
		newCopy: translate(
			'Just a little reminder that by continuing with any of the options below, you agree to our {{tosLink}}Terms of Service{{/tosLink}} and {{privacyLink}}Privacy Policy{{/privacyLink}}.',
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
		),
		oldCopy: translate(
			'By continuing you agree to our {{tosLink}}Terms of Service{{/tosLink}} and have read our {{privacyLink}}Privacy Policy{{/privacyLink}}.',
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
		),
	} );

	return (
		<>
			{ 'lostpassword' === action ? (
				translate(
					"Please enter your username or email address. You'll receive a link to create a new password via email."
				)
			) : (
				<span className="wp-login__tos">{ tos }</span>
			) }
		</>
	);
};

export default getHeadingSubText;
