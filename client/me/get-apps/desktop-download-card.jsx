/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import { recordTracksEvent } from 'state/analytics/actions';

const WINDOWS_LINK = 'https://apps.wordpress.com/d/windows?ref=getapps';
const MAC_LINK = 'https://apps.wordpress.com/d/osx?ref=getapps';
const LINUX_TAR_LINK = 'https://apps.wordpress.com/d/linux?ref=getapps';
const LINUX_DEB_LINK = 'https://apps.wordpress.com/d/linux-deb?ref=getapps';

const trackWindowsClick = () => recordTracksEvent( 'calypso_app_download_windows_click' );
const trackMacClick = () => recordTracksEvent( 'calypso_app_download_mac_click' );
const trackLinuxTarClick = () => recordTracksEvent( 'calypso_app_download_linux_tar_click' );
const trackLinuxDebClick = () => recordTracksEvent( 'calypso_app_download_linux_deb_click' );

const getLinkAnchorTag = ( platformLink ) => {
	switch ( platformLink ) {
		case MAC_LINK:
			return <a href={ platformLink } onClick={ trackMacClick } />;
		case LINUX_TAR_LINK:
			return <a href={ platformLink } onClick={ trackLinuxTarClick } />;
		case LINUX_DEB_LINK:
			return <a href={ platformLink } onClick={ trackLinuxDebClick } />;
		default:
			return <a href={ platformLink } onClick={ trackWindowsClick } />;
	}
};

const getButtonLink = ( platform ) => {
	switch ( platform ) {
		case 'MacIntel':
			return MAC_LINK;
		case 'Linux i686':
		case 'Linux i686 on x86_64':
			return LINUX_TAR_LINK;
		default:
			return WINDOWS_LINK;
	}
};

const getCardTitle = ( platform ) => {
	switch ( platform ) {
		case 'MacIntel':
			return translate( 'Desktop App for Mac' );
		case 'Linux i686':
		case 'Linux i686 on x86_64':
			return translate( 'Desktop App for Linux' );
		default:
			return translate( 'Desktop App for Windows' );

	}
};

const getDescription = ( platform ) => {
	switch ( platform ) {
		case 'MacIntel':
		case 'Linux i686':
		case 'Linux i686 on x86_64':
			return translate( 'A desktop app that gives WordPress a permanent home in your dock.' );
		default:
			return translate( 'A desktop app that gives WordPress a permanent home in your taskbar.' );
	}
};

const getRequirementsText = ( platform ) => {
	switch ( platform ) {
		case 'MacIntel':
			return translate( 'Requires Mac OS X 10.11+. ' );
		case 'Linux i686':
		case 'Linux i686 on x86_64':
			return translate( 'Requires a 64-bit kernel. ' );
		default:
			return translate( 'Requires Windows 7+. ' );
	}
};

const getTranslateComponents = ( platform ) => {
	switch ( platform ) {
		case 'MacIntel':
			return {
				firstAvailableLink: getLinkAnchorTag( WINDOWS_LINK ),
				secondAvailableLink: getLinkAnchorTag( LINUX_TAR_LINK ),
				thirdAvailableLink: getLinkAnchorTag( LINUX_DEB_LINK ),
			};
		case 'Linux i686':
		case 'Linux i686 on x86_64':
			return {
				firstAvailableLink: getLinkAnchorTag( LINUX_DEB_LINK ),
				secondAvailableLink: getLinkAnchorTag( WINDOWS_LINK ),
				thirdAvailableLink: getLinkAnchorTag( MAC_LINK ),
			};
		default:
			return {
				firstAvailableLink: getLinkAnchorTag( MAC_LINK ),
				secondAvailableLink: getLinkAnchorTag( LINUX_TAR_LINK ),
				thirdAvailableLink: getLinkAnchorTag( LINUX_DEB_LINK ),
			};
	}
};

const getAlsoAvailableText = ( platform ) => {
	switch ( platform ) {
		case 'MacIntel':
			return translate( 'Also available for: ' +
				'{{firstAvailableLink}}Windows{{/firstAvailableLink}}, ' +
				'{{secondAvailableLink}}Linux (.tar.gz){{/secondAvailableLink}}, ' +
				'{{thirdAvailableLink}}Linux (.deb){{/thirdAvailableLink}}.',
				{ components: getTranslateComponents( platform ) }
			);
		case 'Linux i686':
		case 'Linux i686 on x86_64':
			return translate( 'Also available for: ' +
				'{{firstAvailableLink}}Linux (.deb){{/firstAvailableLink}}, ' +
				'{{secondAvailableLink}}Windows{{/secondAvailableLink}}, ' +
				'{{thirdAvailableLink}}Mac{{/thirdAvailableLink}}.',
				{ components: getTranslateComponents( platform ) }
			);
		default:
			return translate( 'Also available for: ' +
				'{{firstAvailableLink}}MacOS{{/firstAvailableLink}}, ' +
				'{{secondAvailableLink}}Linux (.tar.gz){{/secondAvailableLink}}, ' +
				'{{thirdAvailableLink}}Linux (.deb){{/thirdAvailableLink}}.',
				{ components: getTranslateComponents( platform ) }
			);
	}
};

const getButtonClickHandler = ( platform ) => {
	switch ( platform ) {
		case 'MacIntel':
			return trackMacClick;
		case 'Linux i686':
			return trackLinuxTarClick;
		case 'Linux i686 on x86_64':
			return trackLinuxDebClick;
		default:
			return trackWindowsClick;
	}
};

const DesktopDownloadCard = () => {
	const platform = ( navigator.platform && navigator.platform.length > 0 ) ? navigator.platform : false;
	return (
		<Card className="get-apps__desktop">
			<div className="get-apps__card-text">
				<h3 className="get-apps__card-title">{ getCardTitle( platform ) }</h3>
				<p className="get-apps__description">{ getDescription( platform ) }</p>
				<p className="get-apps__also-available">
					{ getRequirementsText( platform ) }
					{ getAlsoAvailableText( platform ) }
				</p>
			</div>
			<Button
				className="get-apps__desktop-button"
				href={ getButtonLink( platform ) }
				onClick={ getButtonClickHandler( platform ) }>
				{ translate( 'Download' ) }
			</Button>
		</Card>
	);
};

export default DesktopDownloadCard;
