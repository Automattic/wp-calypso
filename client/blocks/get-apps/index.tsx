import config from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import NavigationHeader from 'calypso/components/navigation-header';
import { createWordPressDesktopConfig, createWordPressStudioConfig } from './apps-config';
import DesktopDownloadCard from './desktop-download-card';
import MobileDownloadCard from './mobile-download-card';

import './style.scss';

export const GetApps = () => {
	const translate = useTranslate();
	const envId = config( 'env_id' );
	const isDesktopEnv = typeof envId === 'string' && envId.startsWith( 'desktop' );

	const desktopApps = [
		createWordPressStudioConfig( translate ),
		createWordPressDesktopConfig( translate ),
	];

	return (
		<>
			<NavigationHeader title={ translate( 'Apps' ) } />
			<div className="get-apps__wrapper">
				<h2 className="get-apps__section-title">{ translate( 'Mobile' ) }</h2>
				<div className="get-apps__section">
					<MobileDownloadCard />
				</div>
				<h2 className="get-apps__section-title">{ translate( 'Desktop' ) }</h2>
				<div className="get-apps__section">
					{ ! isDesktopEnv &&
						desktopApps.map( ( appConfig ) => (
							<DesktopDownloadCard key={ appConfig.id } appConfig={ appConfig } />
						) ) }
				</div>
			</div>
		</>
	);
};

export default GetApps;
