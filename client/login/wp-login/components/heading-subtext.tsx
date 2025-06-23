import { localizeUrl } from '@automattic/i18n-utils';
import { fixMe, useTranslate } from 'i18n-calypso';

interface Props {
	isSocialFirst: boolean;
	twoFactorAuthType: string;
	action?: string;
}

const HeadingSubText = ( { isSocialFirst, twoFactorAuthType, action }: Props ) => {
	const translate = useTranslate();

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

	/**
	 * Return a span here because the Step.Heading renders subtext as a p tag.
	 */
	return (
		<span className="wp-login__heading-subtext">
			{ 'lostpassword' === action
				? translate(
						"Please enter your username or email address. You'll receive a link to create a new password via email."
				  )
				: tos }
		</span>
	);
};

export default HeadingSubText;
