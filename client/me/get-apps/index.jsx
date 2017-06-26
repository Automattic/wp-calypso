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
import Card from 'components/card';
import GetAppsIllustration from './illustration.jsx';
import DownloadCard from './download-card.jsx';

export const GetApps = ( { translate } ) => {
	const trackAppDownloadClick = () => {};
	return (
		<Main className="get-apps">
			<MeSidebarNavigation />
			<GetAppsIllustration />
			<Card className="get-apps__mobile">
				<div className={ 'get-apps__card-text' }>
					<h3>{ translate( 'Mobile Apps' ) }</h3>
					<p>{ translate( 'WordPress at your fingertips.' ) }</p>
				</div>
				<div className={ 'get-apps__badges' }>
					<a href={ 'https://itunes.apple.com/us/app/wordpress/id335703880?mt=8' } onClick={ trackAppDownloadClick }>
						<img src={ '/calypso/images/me/get-apps-app-store.png' } alt={ translate( 'Get on the iOS App Store' ) } />
					</a>
					<a href={ 'https://play.google.com/store/apps/details?id=org.wordpress.android' } onClick={ trackAppDownloadClick }>
						<img src={ '/calypso/images/me/get-apps-google-play.png' } alt={ translate( 'Android' ) } />
					</a>
				</div>
			</Card>
			<DownloadCard />
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
