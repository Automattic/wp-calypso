/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';

const DownloadCard = ( { translate } ) => {
	const trackAppDownloadClick = () => {};
	const availableLinkTag = ( platformLink ) => {
		return <a href={ platformLink } onClick={ trackAppDownloadClick } />;
	};

	const WINDOWS_LINK = 'https://apps.wordpress.com/d/windows?ref=getapps';
	const MAC_LINK = 'https://apps.wordpress.com/d/osx?ref=getapps';
	const LINUX_TAR_LINK = 'https://apps.wordpress.com/d/linux?ref=getapps';
	const LINUX_DEB_LINK = 'https://apps.wordpress.com/d/linux-deb?ref=getapps';

	let buttonLink = WINDOWS_LINK;
	let cardTitle = translate( 'Desktop App for Windows' );
	let requires = translate( 'Requires Windows Whatevs v12+. ' );
	let translateComponents = {
		firstAvailableLink: availableLinkTag( MAC_LINK ),
		secondAvailableLink: availableLinkTag( LINUX_TAR_LINK ),
		thirdAvailableLink: availableLinkTag( LINUX_DEB_LINK ),
	};
	let alsoAvailable = translate( 'Also available for: ' +
		'{{firstAvailableLink}}MacOS{{/firstAvailableLink}}, ' +
		'{{secondAvailableLink}}Linux (.tar.gz){{/secondAvailableLink}}, ' +
		'{{thirdAvailableLink}}Linux (.deb){{/thirdAvailableLink}}.',
		{ components: translateComponents }
	);

	if ( navigator.platform && navigator.platform.length > 0 ) {
		switch ( navigator.platform ) {
			case 'MacIntel':
				buttonLink = MAC_LINK;
				cardTitle = translate( 'Desktop App for MacOS' );
				requires = translate( 'Requires Mac OS X 10.11+. ' );
				translateComponents = {
					firstAvailableLink: availableLinkTag( WINDOWS_LINK ),
					secondAvailableLink: availableLinkTag( LINUX_TAR_LINK ),
					thirdAvailableLink: availableLinkTag( LINUX_DEB_LINK ),
				};
				alsoAvailable = translate( 'Also available for: ' +
					'{{firstAvailableLink}}Windows{{/firstAvailableLink}}, ' +
					'{{secondAvailableLink}}Linux (.tar.gz){{/secondAvailableLink}}, ' +
					'{{thirdAvailableLink}}Linux (.deb){{/thirdAvailableLink}}.',
					{ components: translateComponents }
				);
				break;
			case 'Linux i686':
			case 'Linux i686 on x86_64':
				buttonLink = LINUX_TAR_LINK;
				cardTitle = translate( 'Desktop App for Linux' );
				requires = translate( 'Requires Linux Whatevs v345. ' );
				translateComponents = {
					firstAvailableLink: availableLinkTag( LINUX_DEB_LINK ),
					secondAvailableLink: availableLinkTag( WINDOWS_LINK ),
					thirdAvailableLink: availableLinkTag( MAC_LINK ),
				};
				alsoAvailable = translate( 'Also available for: ' +
					'{{firstAvailableLink}}Linux (.deb){{/firstAvailableLink}}, ' +
					'{{secondAvailableLink}}Windows{{/secondAvailableLink}}, ' +
					'{{thirdAvailableLink}}Mac{{/thirdAvailableLink}}.',
					{ components: translateComponents }
				);
				break;
		}
	}

	return (
		<Card className="get-apps__desktop">
			<div className={ 'get-apps__card-text' }>
				<h3>{ cardTitle }</h3>
				<p>{ translate( 'A desktop app that gives WordPress a permanent home in your dock.' ) }</p>
				<p className={ 'get-apps__also-available' }>
					{ requires }
					{ alsoAvailable }
				</p>
			</div>
			<Button className={ 'get-apps__desktop-button' } href={ buttonLink }>{ translate( 'Download' ) }</Button>
		</Card>
	);
};

export default localize( DownloadCard );
