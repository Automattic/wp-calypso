import { localizeUrl } from '@automattic/i18n-utils';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { isWooOAuth2Client } from 'calypso/lib/oauth2-clients';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import isWooCommerceCoreProfilerFlow from 'calypso/state/selectors/is-woocommerce-core-profiler-flow';

function SocialAuthToS( props ) {
	if ( props.isWooCoreProfilerFlow ) {
		return (
			<p className="login-form__social-buttons-tos">
				{ props.translate(
					'If you continue with Google or Apple, you agree to our' +
						' {{tosLink}}Terms of Service{{/tosLink}}, and have' +
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

	if ( isWooOAuth2Client( props.oauth2Client ) ) {
		return (
			<p className="auth-form__social-buttons-tos">
				{ props.translate(
					"If you continue with Google or Apple and don't already have a WordPress.com account, you are creating an account and you agree to our {{tosLink}}Terms of Service{{/tosLink}}.",
					{
						components: {
							tosLink: (
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

	return (
		<p className="auth-form__social-buttons-tos">
			{ props.translate(
				'If you continue with Google or Apple, you agree to our' +
					' {{tosLink}}Terms of Service{{/tosLink}}, and have' +
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

export default connect( ( state ) => ( {
	oauth2Client: getCurrentOAuth2Client( state ),
	isWooCoreProfilerFlow: isWooCommerceCoreProfilerFlow( state ),
} ) )( localize( SocialAuthToS ) );
