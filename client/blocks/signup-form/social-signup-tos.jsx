import { localizeUrl } from '@automattic/i18n-utils';
import { localize } from 'i18n-calypso';

function SocialSignupToS( props ) {
	return (
		<p className="signup-form__social-buttons-tos">
			{ props.translate(
				"If you continue with Google or Apple and don't already have a WordPress.com account, you" +
					' are creating an account, you agree to our' +
					' {{tosLink}}Terms of Service{{/tosLink}}, and acknowledge that you have' +
					' read our {{privacyLink}}Privacy Policy{{/privacyLink}}.',
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
		</p>
	);
}

export default localize( SocialSignupToS );
