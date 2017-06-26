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

const WINDOWS_LINK = 'https://apps.wordpress.com/d/windows?ref=getapps';
const MAC_LINK = 'https://apps.wordpress.com/d/osx?ref=getapps';
const LINUX_TAR_LINK = 'https://apps.wordpress.com/d/linux?ref=getapps';
const LINUX_DEB_LINK = 'https://apps.wordpress.com/d/linux-deb?ref=getapps';

const TrackAppDownloadClick = () => {};

const GetLinkAnchorTag = ( platformLink ) => {
	return <a href={ platformLink } onClick={ TrackAppDownloadClick } />;
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

const getRequirementsText = ( platform ) => {
	switch ( platform ) {
		case 'MacIntel':
			return translate( 'Requires Mac OS X 10.11+. ' );
		case 'Linux i686':
		case 'Linux i686 on x86_64':
			return translate( 'Requires Linux Whatevs v345. ' );
		default:
			return translate( 'Requires Windows Whatevs v12+. ' );
	}
};

const getTranslateComponents = ( platform ) => {
	switch ( platform ) {
		case 'MacIntel':
			return {
				firstAvailableLink: GetLinkAnchorTag( WINDOWS_LINK ),
				secondAvailableLink: GetLinkAnchorTag( LINUX_TAR_LINK ),
				thirdAvailableLink: GetLinkAnchorTag( LINUX_DEB_LINK ),
			};
		case 'Linux i686':
		case 'Linux i686 on x86_64':
			return {
				firstAvailableLink: GetLinkAnchorTag( LINUX_DEB_LINK ),
				secondAvailableLink: GetLinkAnchorTag( WINDOWS_LINK ),
				thirdAvailableLink: GetLinkAnchorTag( MAC_LINK ),
			};
		default:
			return {
				firstAvailableLink: GetLinkAnchorTag( MAC_LINK ),
				secondAvailableLink: GetLinkAnchorTag( LINUX_TAR_LINK ),
				thirdAvailableLink: GetLinkAnchorTag( LINUX_DEB_LINK ),
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

const DesktopDownloadCard = () => {
	const platform = ( navigator.platform && navigator.platform.length > 0 ) ? navigator.platform : false;

	return (
		<Card className="get-apps__desktop">
			<div className={ 'get-apps__card-text' }>
				<h3>{ getCardTitle( platform ) }</h3>
				<p>{ translate( 'A desktop app that gives WordPress a permanent home in your dock.' ) }</p>
				<p className={ 'get-apps__also-available' }>
					{ getRequirementsText( platform ) }
					{ getAlsoAvailableText( platform ) }
				</p>
			</div>
			<Button className={ 'get-apps__desktop-button' } href={ getButtonLink( platform ) }>{ translate( 'Download' ) }</Button>
		</Card>
	);
};

export default DesktopDownloadCard;
