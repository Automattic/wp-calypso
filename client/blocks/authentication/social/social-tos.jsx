import { localizeUrl } from '@automattic/i18n-utils';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getIsBlazePro from 'calypso/state/selectors/get-is-blaze-pro';
import getIsWooPasswordless from 'calypso/state/selectors/get-is-woo-passwordless';

const toSLinks = {
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
};

function getToSComponent( content ) {
	return <p className="auth-form__social-buttons-tos">{ content }</p>;
}

function SocialAuthToS( props ) {
	if ( props.isWooPasswordless ) {
		return getToSComponent(
			props.translate(
				'By continuing with any of the options above, you agree to our {{tosLink}}Terms of Service{{/tosLink}} and have read our {{privacyLink}}Privacy Policy{{/privacyLink}}.',
				toSLinks
			)
		);
	}

	if ( props.isBlazePro ) {
		return getToSComponent(
			<>
				{ props.translate(
					'By continuing with any of the options above, you agree to our {{tosLink}}Terms of Service{{/tosLink}} and acknowledge you have read our {{privacyLink}}Privacy Policy{{/privacyLink}}.',
					toSLinks
				) }
				<br />
				{ props.translate(
					'Blaze Pro uses WordPress.com accounts under the hood. Tumblr, Blaze Pro, and WordPress.com are properties of Automattic, Inc.'
				) }
			</>
		);
	}

	return getToSComponent(
		props.translate(
			'If you continue with Google, Apple or GitHub, you agree to our {{tosLink}}Terms of Service{{/tosLink}}, and have read our {{privacyLink}}Privacy Policy{{/privacyLink}}.',
			toSLinks
		)
	);
}

export default connect( ( state ) => ( {
	oauth2Client: getCurrentOAuth2Client( state ),
	isWooPasswordless: getIsWooPasswordless( state ),
	isBlazePro: getIsBlazePro( state ),
} ) )( localize( SocialAuthToS ) );
