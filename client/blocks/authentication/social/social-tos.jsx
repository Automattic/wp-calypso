import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getIsBlazePro from 'calypso/state/selectors/get-is-blaze-pro';
import getIsWCCOM from 'calypso/state/selectors/get-is-wccom';
import isWooJPCFlow from 'calypso/state/selectors/is-woo-jpc-flow';

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

export default function SocialAuthToS() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const isWCCOM = useSelector( getIsWCCOM );
	const isWooJPC = useSelector( isWooJPCFlow );
	const isBlazePro = useSelector( getIsBlazePro );

	if ( isWooJPC ) {
		const termsOfServiceLink = (
			<a
				href={ localizeUrl( 'https://wordpress.com/tos/' ) }
				target="_blank"
				rel="noopener noreferrer"
				className="jetpack-connect__sso-actions-modal-link"
				onClick={ () => {
					dispatch( recordTracksEvent( 'calypso_jpc_disclaimer_tos_link_click' ) );
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
					dispatch( recordTracksEvent( 'calypso_jpc_disclaimer_sync_data_link_click' ) );
				} }
			/>
		);

		return getToSComponent(
			translate(
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

	if ( isWCCOM ) {
		return getToSComponent(
			translate(
				'By continuing with any of the options above, you agree to our {{tosLink}}Terms of Service{{/tosLink}} and have read our {{privacyLink}}Privacy Policy{{/privacyLink}}.',
				toSLinks
			)
		);
	}

	if ( isBlazePro ) {
		return getToSComponent(
			<>
				{ translate(
					'By continuing with any of the options above, you agree to our {{tosLink}}Terms of Service{{/tosLink}} and acknowledge you have read our {{privacyLink}}Privacy Policy{{/privacyLink}}.',
					toSLinks
				) }
				<br />
				{ translate(
					'Blaze Pro uses WordPress.com accounts under the hood. Tumblr, Blaze Pro, and WordPress.com are properties of Automattic, Inc.'
				) }
			</>
		);
	}

	return getToSComponent(
		translate(
			'If you continue with Google, Apple or GitHub, you agree to our {{tosLink}}Terms of Service{{/tosLink}}, and have read our {{privacyLink}}Privacy Policy{{/privacyLink}}.',
			toSLinks
		)
	);
}
