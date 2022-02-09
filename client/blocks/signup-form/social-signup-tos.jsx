import { localize } from 'i18n-calypso';
import { localizeUrl } from 'calypso/lib/i18n-utils';

function SocialSignupToS( props ) {
	return (
		<p className="signup-form__social-buttons-tos">
			{ props.translate(
				"If you continue with Google or Apple and don't already have a WordPress.com account, you" +
					' are creating an account and you agree to our' +
					' {{a}}Terms of Service{{/a}}.',
				{
					components: {
						a: (
							<a
								href={ localizeUrl( 'https://wordpress.com/tos/' ) }
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
