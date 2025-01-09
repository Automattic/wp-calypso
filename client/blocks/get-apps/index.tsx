import config from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import NavigationHeader from 'calypso/components/navigation-header';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import DesktopDownloadCard from './desktop-download-card';
import MobileDownloadCard from './mobile-download-card';

import './style.scss';

export const GetApps = () => {
	const translate = useTranslate();
	const envId = config( 'env_id' );
	const isDesktopEnv = typeof envId === 'string' && envId.startsWith( 'desktop' );

	return (
		<>
			<NavigationHeader title={ translate( 'Apps' ) } />
			<div className="get-apps__wrapper">
				<BodySectionCssClass bodyClass={ [ 'get-apps__body' ] } />
				<h2 className="get-apps__section-title">{ translate( 'Mobile' ) }</h2>
				<div className="get-apps__section">
					<MobileDownloadCard />
				</div>
				<h2 className="get-apps__section-title">{ translate( 'Desktop' ) }</h2>
				<div className="get-apps__section">{ ! isDesktopEnv && <DesktopDownloadCard /> }</div>
			</div>
		</>
	);
};

export default GetApps;
