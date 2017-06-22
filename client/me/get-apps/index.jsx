/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { identity } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import MeSidebarNavigation from 'me/sidebar-navigation';
import Main from 'components/main';
import Button from 'components/button';
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import GetAppsIllustration from './illustration.jsx';

export const GetApps = ( { translate } ) => {
	const trackAppDownloadClick = () => {};
	return (
		<Main className="get-apps">
			<MeSidebarNavigation />
			<GetAppsIllustration translate={ translate } />
			<SectionHeader label={ translate( 'WordPress Apps' ) } />
			<Card className="get-apps__desktop">
				<h3>{ translate( 'Desktop App for Mac' ) }</h3>
				<p>{ translate( 'A desktop app that gives WordPress a permanent home in your dock.' ) }</p>
				<p className={ 'get-apps__also-available' }>
					{ translate(
						'Requires Mac OS X 10.11+. Also available for: {{windowsLink}}Windows (7+){{/windowsLink}}, {{tarLink}}Linux (.tar.gz){{/tarLink}}, {{debLink}}Linux (.deb){{/debLink}}.',
						{
							components: {
								windowsLink: (
									<a href={ 'https://apps.wordpress.com/d/windows?ref=getapps' } onClick={ trackAppDownloadClick } />
								),
								tarLink: (
									<a href={ 'https://apps.wordpress.com/d/linux?ref=getapps' } onClick={ trackAppDownloadClick } />
								),
								debLink: (
									<a href={ 'https://apps.wordpress.com/d/linux-deb?ref=getapps' } onClick={ trackAppDownloadClick } />
								)
							}
						}
					) }
				</p>
				<Button href={ 'https://apps.wordpress.com/d/osx?ref=getapps' }>Download</Button>
			</Card>
			<Card className="get-apps__mobile">
				<h3>{ translate( 'Mobile Apps' ) }</h3>
				<p>{ translate( 'WordPress at your fingertips.' ) }</p>
				<div className={ 'get-apps__badges' }>
					<img src={ '/calypso/images/me/get-apps-app-store.png' } alt={ translate( 'Get on the iOS App Store' ) } />
					<img src={ '/calypso/images/me/get-apps-google-play.png' } alt={ translate( 'Android' ) } />
				</div>
			</Card>
		</Main>
	);
};

GetApps.propTypes = {
	translate: PropTypes.func,
};

GetApps.defaultProps = {
	translate: identity,
};

export default localize( GetApps );
