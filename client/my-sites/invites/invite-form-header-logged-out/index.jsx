import { recordTracksEvent } from '@automattic/calypso-analytics';
import { localizeUrl } from '@automattic/i18n-utils';
import { createInterpolateElement } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { BrandHeader } from 'calypso/components/connect-screen/brand-header';

function InviteFormHeaderLoggedOut( { site } ) {
	const translate = useTranslate();
	const siteName = site?.title || site?.domain || translate( 'this site' );
	const siteUrl = site?.URL;

	const title = createInterpolateElement(
		translate( 'Create an account for <siteLink>%(siteName)s</siteLink>', {
			args: { siteName },
		} ),
		{
			siteLink: siteUrl ? (
				<a
					href={ siteUrl }
					onClick={ () => recordTracksEvent( 'calypso_invite_accept_form_header_site_link_click' ) }
				/>
			) : (
				<span />
			),
		}
	);

	const description = createInterpolateElement(
		translate(
			'Just a little reminder that by continuing with any of the options below, you agree to our <tosLink>Terms of Service</tosLink> and <privacyLink>Privacy Policy</privacyLink>.'
		),
		{
			tosLink: (
				<a
					href={ localizeUrl( 'https://wordpress.com/tos/' ) }
					onClick={ () => recordTracksEvent( 'calypso_signup_tos_link_click' ) }
					target="_blank"
					rel="noopener noreferrer"
				/>
			),
			privacyLink: (
				<a
					href={ localizeUrl( 'https://automattic.com/privacy/' ) }
					onClick={ () => recordTracksEvent( 'calypso_signup_privacy_link_click' ) }
					target="_blank"
					rel="noopener noreferrer"
				/>
			),
		}
	);

	return (
		<div className="invite-form-header invite-form-header--logged-out">
			<BrandHeader title={ title } description={ description } />
		</div>
	);
}

export default InviteFormHeaderLoggedOut;
