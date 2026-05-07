import { useState, useEffect, useMemo } from '@wordpress/element';
import userAgent from 'calypso/lib/user-agent';
import { AppsCard } from './apps-card';
import { PlatformType, type DesktopAppConfig } from './apps-config';
import { DesktopDownloadOptions } from './desktop-download-options';
import { detectPlatformAndArchitecture } from './platform-detection';

type DesktopDownloadCardProps = {
	appConfig: DesktopAppConfig;
};

const getCurrentPlatform = async (): Promise< {
	platform: PlatformType;
	detectionFailed: boolean;
} > => {
	// Try User-Agent Client Hints API first (works across all platforms)
	const detection = await detectPlatformAndArchitecture();

	if ( detection && detection.detectionMethod === 'client-hints' ) {
		const { platform, architecture } = detection;

		if ( platform === 'macos' ) {
			if ( architecture === 'arm64' ) {
				return { platform: PlatformType.MacSilicon, detectionFailed: false };
			} else if ( architecture === 'x64' ) {
				return { platform: PlatformType.MacIntel, detectionFailed: false };
			}
			// Client Hints available but no architecture - fallback to MacSilicon
			return { platform: PlatformType.MacSilicon, detectionFailed: true };
		}

		if ( platform === 'windows' ) {
			if ( architecture === 'arm64' ) {
				return { platform: PlatformType.WindowsARM64, detectionFailed: false };
			} else if ( architecture === 'x64' ) {
				return { platform: PlatformType.WindowsX64, detectionFailed: false };
			}
			// Client Hints available but no architecture - fallback
			return { platform: PlatformType.WindowsX64, detectionFailed: true };
		}

		if ( platform === 'linux' ) {
			return { platform: PlatformType.Linux, detectionFailed: false };
		}
	}

	// Fallback to navigator.platform (Client Hints API not available)
	// Cannot trust architecture detection here
	if ( detection && detection.detectionMethod === 'navigator-platform' ) {
		const { platform } = detection;

		if ( platform === 'macos' ) {
			// Cannot detect Mac architecture reliably - show both options,
			// but default to Apple Silicon (more common now)
			return { platform: PlatformType.MacSilicon, detectionFailed: true };
		}

		if ( platform === 'windows' ) {
			// Cannot detect Windows architecture - show both options
			return { platform: PlatformType.WindowsX64, detectionFailed: true };
		}

		if ( platform === 'linux' ) {
			return { platform: PlatformType.Linux, detectionFailed: false };
		}
	}

	// Ultimate fallback - couldn't detect anything
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
