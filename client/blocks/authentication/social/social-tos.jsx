import { localizeUrl } from '@automattic/i18n-utils';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getIsBlazePro from 'calypso/state/selectors/get-is-blaze-pro';
import getIsWooPasswordless from 'calypso/state/selectors/get-is-woo-passwordless';
import isWooPasswordlessJPCFlow from 'calypso/state/selectors/is-woo-passwordless-jpc-flow';

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
	if ( props.isWooPasswordlessJPC ) {
		const termsOfServiceLink = (
			<a
				href={ localizeUrl( 'https://wordpress.com/tos/' ) }
				target="_blank"
				rel="noopener noreferrer"
				className="jetpack-connect__sso-actions-modal-link"
				onClick={ () => {
					this.props.recordTracksEvent( 'calypso_jpc_disclaimer_tos_link_click', {
						...this.props,
					} );
				} }
			/>
		);
		const syncDataLink = (
			<a
				href={ localizeUrl( 'https://jetpack.com/support/what-data-does-jetpack-sync/' ) }
				target="_blank"
				rel="noopener noreferrer"
				className="jetpack-connect__sso-actions-modal-link"
				onClick={ () => {
					this.props.recordTracksEvent( 'calypso_jpc_disclaimer_sync_data_link_click', {
						...this.props,
					} );
				} }
			/>
		);

		return getToSComponent(
			props.translate(
				'By clicking any of the options above, you agree to our {{termsOfServiceLink}}Terms of Service{{/termsOfServiceLink}} and to {{syncDataLink}}sync your site’s data{{/syncDataLink}} with us.',
				{
					components: {
						termsOfServiceLink,
						syncDataLink,
					},
				}
			)
		);
	}

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
	isWooPasswordlessJPC: isWooPasswordlessJPCFlow( state ),
	isBlazePro: getIsBlazePro( state ),
} ) )( localize( SocialAuthToS ) );
