import config from '@automattic/calypso-config';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import DesktopDownloadCard from './desktop-download-card.jsx';
import MobileDownloadCard from './mobile-download-card.jsx';

import './style.scss';

export const GetApps = () => {
	return (
		<div className="get-apps__wrapper">
			<BodySectionCssClass bodyClass={ [ 'get-apps__body' ] } />
			<MobileDownloadCard />
			{ ! config( 'env_id' ).startsWith( 'desktop' ) && <DesktopDownloadCard /> }
		</div>
	);
};

export default GetApps;
