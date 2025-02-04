import { useMemo } from 'react';
import userAgent from 'calypso/lib/user-agent';
import { AppsCard } from './apps-card';
import { PlatformType, type DesktopAppConfig } from './apps-config';
import { DesktopDownloadOptions } from './desktop-download-options';

type DesktopDownloadCardProps = {
	appConfig: DesktopAppConfig;
};

const getCurrentPlatform = (): PlatformType => {
	const platformName = navigator.platform;

	switch ( platformName ) {
		case 'MacIntel':
			return PlatformType.MacIntel;
		case 'MacSilicon':
			return PlatformType.MacSilicon;
		case 'Linux i686':
		case 'Linux i686 on x86_64':
			return PlatformType.Linux;
		default:
			return PlatformType.Windows;
	}
};

const DesktopDownloadCard: React.FC< DesktopDownloadCardProps > = ( { appConfig } ) => {
	const { isMobile } = userAgent;
	const platform = useMemo( () => getCurrentPlatform(), [] );

	const currentPlatformConfig = useMemo(
		() => appConfig.platforms[ platform ],
		[ appConfig.platforms, platform ]
	);

	return (
		<AppsCard
			logo={ appConfig.logo }
			logoName={ appConfig.logoName }
			title={ appConfig.title }
			subtitle={ appConfig.subtitle }
		>
			<DesktopDownloadOptions
				appConfig={ appConfig }
				currentPlatformConfig={ currentPlatformConfig }
				isMobile={ isMobile }
			/>
		</AppsCard>
	);
};

export default DesktopDownloadCard;
