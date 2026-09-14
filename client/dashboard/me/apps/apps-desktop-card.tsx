import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	ExternalLink,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useMemo, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import SVGIcon from '../../components/svg-icon';
import { Text } from '../../components/text';
import AppsCard from './apps-card';
import Apple from './images/apple-logo.svg';
import WordPressDesktopAppLogo from './images/desktop-app-logo.svg';
import Linux from './images/linux-logo.svg';
import WordPressStudioLogo from './images/studio-app-logo.svg';
import Windows from './images/windows-logo.svg';
import { detectPlatformAndArchitecture } from './platform-detection';

enum PlatformType {
	MacSilicon = 'MacSilicon',
	MacIntel = 'MacIntel',
	WindowsX64 = 'WindowsX64',
	WindowsARM64 = 'WindowsARM64',
	Linux = 'Linux',
	LinuxDeb = 'LinuxDeb',
	LinuxX64 = 'LinuxX64',
	LinuxARM64 = 'LinuxARM64',
}

interface BasePlatformConfig {
	group: string;
	icon: string;
	iconName: string;
	name: string;
}

interface PlatformConfig extends BasePlatformConfig {
	eventName: string;
	link: string;
}

interface DesktopAppConfig {
	logo: string;
	logoAlt: string;
	title: string;
	description: React.ReactNode;
	link: React.ReactNode;
	platforms: Partial< Record< PlatformType, PlatformConfig > >;
}

const BaseAppProperties: Record< PlatformType, BasePlatformConfig > = {
	[ PlatformType.MacSilicon ]: {
		group: 'mac',
		icon: Apple,
		iconName: 'apple-logo',
		name: __( 'Mac (Apple Silicon)' ),
	},
	[ PlatformType.MacIntel ]: {
		group: 'mac',
		icon: Apple,
		iconName: 'apple-logo',
		name: __( 'Mac (Intel)' ),
	},
	[ PlatformType.WindowsX64 ]: {
		group: 'windows',
		icon: Windows,
		iconName: 'windows-logo',
		name: __( 'Windows (x64)' ),
	},
	[ PlatformType.WindowsARM64 ]: {
		group: 'windows',
		icon: Windows,
		iconName: 'windows-logo',
		name: __( 'Windows on ARM' ),
	},
	[ PlatformType.Linux ]: {
		group: 'linux',
		icon: Linux,
		iconName: 'linux-logo',
		name: __( 'Linux (.tar.gz)' ),
	},
	[ PlatformType.LinuxDeb ]: {
		group: 'linux',
		icon: Linux,
		iconName: 'linux-logo',
		name: __( 'Linux (.deb)' ),
	},
	[ PlatformType.LinuxX64 ]: {
		group: 'linux',
		icon: Linux,
		iconName: 'linux-logo',
		name: __( 'Linux (x64)' ),
	},
	[ PlatformType.LinuxARM64 ]: {
		group: 'linux',
		icon: Linux,
		iconName: 'linux-logo',
		name: __( 'Linux (ARM)' ),
	},
};

const DesktopApps: Record< string, DesktopAppConfig > = {
	wordpress: {
		logo: WordPressDesktopAppLogo,
		logoAlt: __( 'WordPress.com desktop app logo' ),
		title: __( 'WordPress.com desktop app' ),
		description: __(
			'The full WordPress.com experience packaged as an app for your laptop or desktop.'
		),
		link: createInterpolateElement(
			__( 'Visit <link>desktop.wordpress.com</link> on your desktop.' ),
			{
				link: <ExternalLink href="https://desktop.wordpress.com/" children={ null } />,
			}
		),
		platforms: {
			[ PlatformType.MacSilicon ]: {
				...BaseAppProperties[ PlatformType.MacSilicon ],
				eventName: 'calypso_dashboard_app_download_mac_silicon_click',
				// eslint-disable-next-line wpcalypso/i18n-unlocalized-url
				link: 'https://apps.wordpress.com/d/osx-silicon?ref=getapps',
			},
			[ PlatformType.MacIntel ]: {
				...BaseAppProperties[ PlatformType.MacIntel ],
				eventName: 'calypso_dashboard_app_download_mac_click',
				// eslint-disable-next-line wpcalypso/i18n-unlocalized-url
				link: 'https://apps.wordpress.com/d/osx?ref=getapps',
			},
			[ PlatformType.WindowsX64 ]: {
				...BaseAppProperties[ PlatformType.WindowsX64 ],
				eventName: 'calypso_dashboard_app_download_windows_x64_click',
				// eslint-disable-next-line wpcalypso/i18n-unlocalized-url
				link: 'https://apps.wordpress.com/d/windows?ref=getapps',
			},
			[ PlatformType.WindowsARM64 ]: {
				...BaseAppProperties[ PlatformType.WindowsARM64 ],
				eventName: 'calypso_dashboard_app_download_windows_arm64_click',
				// eslint-disable-next-line wpcalypso/i18n-unlocalized-url
				link: 'https://apps.wordpress.com/d/windows?ref=getapps',
			},
			[ PlatformType.Linux ]: {
				...BaseAppProperties[ PlatformType.Linux ],
				eventName: 'calypso_dashboard_app_download_linux_click',
				// eslint-disable-next-line wpcalypso/i18n-unlocalized-url
				link: 'https://apps.wordpress.com/d/linux?ref=getapps',
			},
			[ PlatformType.LinuxDeb ]: {
				...BaseAppProperties[ PlatformType.LinuxDeb ],
				eventName: 'calypso_dashboard_app_download_linux_deb_click',
				// eslint-disable-next-line wpcalypso/i18n-unlocalized-url
				link: 'https://apps.wordpress.com/d/linux-deb?ref=getapps',
			},
		},
	},
	studio: {
		logo: WordPressStudioLogo,
		logoAlt: __( 'WordPress Studio logo' ),
		title: __( 'WordPress Studio' ),
		description: createInterpolateElement(
			__(
				'A fast, free way to develop locally with WordPress. Share your local sites with clients or colleagues. <link>Learn more</link>'
			),
			{
				link: <ExternalLink href="https://developer.wordpress.com/studio/" children={ null } />,
			}
		),
		link: createInterpolateElement(
			__( 'Visit <link>developer.wordpress.com/studio</link> on your desktop.' ),
			{
				link: <ExternalLink href="https://developer.wordpress.com/studio/" children={ null } />,
			}
		),
		platforms: {
			[ PlatformType.MacSilicon ]: {
				...BaseAppProperties[ PlatformType.MacSilicon ],
				eventName: 'calypso_dashboard_studio_download_mac_silicon_click',
				link: 'https://appscdn.wordpress.com/downloads/wordpress-com-studio/mac-silicon/latest',
			},
			[ PlatformType.MacIntel ]: {
				...BaseAppProperties[ PlatformType.MacIntel ],
				eventName: 'calypso_dashboard_studio_download_mac_click',
				link: 'https://appscdn.wordpress.com/downloads/wordpress-com-studio/mac-intel/latest',
			},
			[ PlatformType.WindowsX64 ]: {
				...BaseAppProperties[ PlatformType.WindowsX64 ],
				eventName: 'calypso_dashboard_studio_download_windows_x64_click',
				link: 'https://appscdn.wordpress.com/downloads/wordpress-com-studio/windows-x64/latest',
			},
			[ PlatformType.WindowsARM64 ]: {
				...BaseAppProperties[ PlatformType.WindowsARM64 ],
				eventName: 'calypso_dashboard_studio_download_windows_arm64_click',
				link: 'https://appscdn.wordpress.com/downloads/wordpress-com-studio/windows-arm64/latest',
			},
			[ PlatformType.LinuxX64 ]: {
				...BaseAppProperties[ PlatformType.LinuxX64 ],
				eventName: 'calypso_dashboard_studio_download_linux_x64_click',
				link: 'https://appscdn.wordpress.com/downloads/wordpress-com-studio/linux-x64/latest/update',
			},
			[ PlatformType.LinuxARM64 ]: {
				...BaseAppProperties[ PlatformType.LinuxARM64 ],
				eventName: 'calypso_dashboard_studio_download_linux_arm64_click',
				link: 'https://appscdn.wordpress.com/downloads/wordpress-com-studio/linux-arm64/latest/update',
			},
		},
	},
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
			if ( architecture === 'arm64' ) {
				return { platform: PlatformType.LinuxARM64, detectionFailed: false };
			} else if ( architecture === 'x64' ) {
				return { platform: PlatformType.LinuxX64, detectionFailed: false };
			}
			// Client Hints available but no architecture - fallback to x64
			return { platform: PlatformType.LinuxX64, detectionFailed: true };
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
			// Cannot detect Linux architecture - default to x64 (more common)
			return { platform: PlatformType.LinuxX64, detectionFailed: true };
		}
	}

	// Ultimate fallback - couldn't detect anything
	return { platform: PlatformType.WindowsX64, detectionFailed: true };
};

const isMobileDevice = () =>
	navigator.userAgentData?.mobile ?? /Android|iPhone|iPad|iPod|Mobile/i.test( navigator.userAgent );

export default function AppsDesktopCard( { appSlug }: { appSlug: keyof typeof DesktopApps } ) {
	const { recordTracksEvent } = useAnalytics();
	const isDesktop = useViewportMatch( 'medium' );
	const Wrapper = isDesktop ? HStack : VStack;
	const app = DesktopApps[ appSlug ];
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

	const platformConfig = useMemo( () => {
		if ( ! app || ! platform ) {
			return undefined;
		}
		const config = app.platforms[ platform ];
		if ( config ) {
			return config;
		}
		// Apps without arch-specific Linux entries (e.g. the WordPress.com
		// desktop app) fall back to the generic Linux entry.
		if ( platform === PlatformType.LinuxX64 || platform === PlatformType.LinuxARM64 ) {
			return app.platforms[ PlatformType.Linux ];
		}
		return undefined;
	}, [ app, platform ] );

	if ( ! app ) {
		return null;
	}

	const cardProps = {
		logo: app.logo,
		logoAlt: app.logoAlt,
		title: app.title,
		description: app.description,
	};

	if ( isMobileDevice() ) {
		return (
			<AppsCard { ...cardProps }>
				<Text as="p" variant="muted" lineHeight="20px">
					{ app.link }
				</Text>
			</AppsCard>
		);
	}

	if ( isLoading ) {
		return <AppsCard { ...cardProps } />;
	}

	const platformEntries = Object.entries( app.platforms );
	// Architecture detected with confidence: a single download button for the
	// exact platform. Detection failed or imprecise: one button per option in
	// the detected platform group. Everything else goes to "Also available for".
	const downloadEntries = ! platformConfig
		? []
		: platformEntries.filter( ( [ , config ] ) =>
				detectionFailed ? config.group === platformConfig.group : config === platformConfig
		  );
	const alsoAvailableEntries = platformEntries.filter(
		( [ , config ] ) => ! downloadEntries.some( ( [ , download ] ) => download === config )
	);

	return (
		<AppsCard { ...cardProps }>
			<VStack spacing={ 4 }>
				{ downloadEntries.length > 0 && (
					<Wrapper spacing={ 2 } justify="flex-start" alignment="flex-start">
						{ downloadEntries.map( ( [ key, config ], index ) => (
							<Button
								__next40pxDefaultSize
								key={ key }
								href={ config.link }
								icon={ <SVGIcon icon={ config.icon } name={ config.iconName } /> }
								variant={ index === 0 ? 'primary' : 'secondary' }
								onClick={ () => recordTracksEvent( config.eventName ) }
							>
								{ sprintf(
									// translators: %s is the platform name
									__( 'Download for %s' ),
									config.name
								) }
							</Button>
						) ) }
					</Wrapper>
				) }
				<HStack spacing={ 2 } justify="flex-start" alignment="center" wrap>
					<Text as="p" variant="muted" lineHeight="20px" style={ { flexShrink: 0 } }>
						{ downloadEntries.length === 0 ? __( 'Available for:' ) : __( 'Also available for:' ) }
					</Text>
					{ alsoAvailableEntries.map( ( [ key, config ] ) => (
						<Button
							key={ key }
							href={ config.link }
							icon={ <SVGIcon icon={ config.icon } name={ config.iconName } /> }
							iconSize={ 16 }
							name={ config.iconName }
							size="compact"
							variant="link"
							style={ { padding: 0 } }
							onClick={ () => recordTracksEvent( config.eventName ) }
						>
							{ config.name }
						</Button>
					) ) }
				</HStack>
			</VStack>
		</AppsCard>
	);
}
