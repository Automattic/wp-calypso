import { localizeUrl } from '@automattic/i18n-utils';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import { connect } from 'react-redux';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';

function SocialLoginTos( props ) {
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

	return (
		<p className="login-form__social-buttons-tos">
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

export default connect( ( state ) => ( {
	isWooCoreProfilerFlow:
		'woocommerce-core-profiler' === get( getCurrentQueryArguments( state ), 'from' ),
} ) )( localize( SocialLoginTos ) );
