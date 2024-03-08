import { localizeUrl } from '@automattic/i18n-utils';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';

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
	const content = props.translate(
		'If you continue with Google, Apple or GitHub, you agree to our {{tosLink}}Terms of Service{{/tosLink}}, and have read our {{privacyLink}}Privacy Policy{{/privacyLink}}.',
		toSLinks
	);

	return getToSComponent( content );
}

export default connect( ( state ) => ( {
	oauth2Client: getCurrentOAuth2Client( state ),
} ) )( localize( SocialAuthToS ) );
