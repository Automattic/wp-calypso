import config from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import NavigationHeader from 'calypso/components/navigation-header';
import { useSelector } from 'calypso/state';
import { getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import { createWordPressDesktopConfig, createWordPressStudioConfig } from './apps-config';
import DesktopDownloadCard from './desktop-download-card';
import MobileDownloadCard from './mobile-download-card';

import './style.scss';

export const GetApps = () => {
	const translate = useTranslate();
	const envId = config( 'env_id' );
	const isDesktopEnv = typeof envId === 'string' && envId.startsWith( 'desktop' );

	const siteCount = useSelector( getCurrentUserSiteCount );
	const isMultiSiteUser = ( siteCount ?? 0 ) >= 2;

	const studioConfig = createWordPressStudioConfig( translate );
	const desktopConfig = createWordPressDesktopConfig( translate );

	return (
		<>
			<NavigationHeader title={ translate( 'Apps' ) } />
			<div className="get-apps__wrapper">
				{ isMultiSiteUser ? (
					<>
						{ ! isDesktopEnv && (
							<DesktopDownloadCard appConfig={ studioConfig } />
						) }
						<MobileDownloadCard />
					</>
				) : (
					<>
						<MobileDownloadCard />
						{ ! isDesktopEnv && (
							<DesktopDownloadCard appConfig={ studioConfig } />
						) }
					</>
				) }
				{ ! isDesktopEnv && (
					<DesktopDownloadCard appConfig={ desktopConfig } />
				) }
			</div>
		</>
	);
};

export default GetApps;
