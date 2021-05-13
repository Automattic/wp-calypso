/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import GetAppsIllustration from './illustration.jsx';
import DesktopDownloadCard from './desktop-download-card.jsx';
import MobileDownloadCard from './mobile-download-card.jsx';
import config from '@automattic/calypso-config';

/**
 * Style dependencies
 */
import './style.scss';

export const GetApps = () => {
	return (
		<div className="get-apps__wrapper">
			<GetAppsIllustration />
			<MobileDownloadCard />
			{ ! config( 'env_id' ).startsWith( 'desktop' ) && <DesktopDownloadCard /> }
		</div>
	);
};

export default GetApps;
