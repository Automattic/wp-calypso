import { useState, useEffect, useMemo } from '@wordpress/element';
import userAgent from 'calypso/lib/user-agent';
import { AppsCard } from './apps-card';
import { PlatformType, type DesktopAppConfig } from './apps-config';
import { DesktopDownloadOptions } from './desktop-download-options';
import { getWindowsArchitecture } from './platform-detection';

type DesktopDownloadCardProps = {
	appConfig: DesktopAppConfig;
};

const getCurrentPlatform = async (): Promise< {
	platform: PlatformType;
	detectionFailed: boolean;
} > => {
	const platformName = navigator.platform;

	// Non-Windows platforms (existing logic)
	switch ( platformName ) {
		case 'MacIntel':
			return { platform: PlatformType.MacIntel, detectionFailed: false };
		case 'MacSilicon':
			return { platform: PlatformType.MacSilicon, detectionFailed: false };
		case 'Linux i686':
		case 'Linux i686 on x86_64':
			return { platform: PlatformType.Linux, detectionFailed: false };
	}

	// Windows platform - attempt architecture detection
	const arch = await getWindowsArchitecture();

	if ( arch === 'arm64' ) {
		return { platform: PlatformType.WindowsARM64, detectionFailed: false };
	} else if ( arch === 'x64' ) {
		return { platform: PlatformType.WindowsX64, detectionFailed: false };
	}

	// Fallback: unknown Windows architecture
	return { platform: PlatformType.WindowsX64, detectionFailed: true };
};

const DesktopDownloadCard: React.FC< DesktopDownloadCardProps > = ( { appConfig } ) => {
	const { isMobile } = userAgent;
	const [ platform, setPlatform ] = useState< PlatformType | null >( null );
	const [ detectionFailed, setDetectionFailed ] = useState( false );
	const [ isLoading, setIsLoading ] = useState( true );

	useEffect( () => {
		getCurrentPlatform()
			.then( ( result ) => {
				setPlatform( result.platform );
				setDetectionFailed( result.detectionFailed );
			} )
			.catch( () => {
				setDetectionFailed( true );
				setPlatform( PlatformType.WindowsX64 );
			} )
			.finally( () => {
				setIsLoading( false );
			} );
	}, [] );

	const currentPlatformConfig = useMemo(
		() => ( platform ? appConfig.platforms[ platform ] : undefined ),
		[ appConfig.platforms, platform ]
	);

	if ( isLoading ) {
		return (
			<AppsCard
				logo={ appConfig.logo }
				logoName={ appConfig.logoName }
				title={ appConfig.title }
				subtitle={ appConfig.subtitle }
			>
				<div className="get-apps__loading">Loading...</div>
			</AppsCard>
		);
	}

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
				platformDetectionFailed={ detectionFailed }
			/>
		</AppsCard>
	);
};

export default DesktopDownloadCard;
