import { recordTracksEvent } from '@automattic/calypso-analytics';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate, Substitution } from 'i18n-calypso';
import Apple from 'calypso/assets/images/icons/apple-logo.svg';
import DesktopAppLogo from 'calypso/assets/images/icons/desktop-app-logo.svg';
import Linux from 'calypso/assets/images/icons/linux-logo.svg';
import StudioAppLogo from 'calypso/assets/images/icons/studio-app-logo.svg';
import Windows from 'calypso/assets/images/icons/windows-logo.svg';

export enum PlatformType {
	MacSilicon = 'MacSilicon',
	MacIntel = 'MacIntel',
	WindowsARM64 = 'WindowsARM64',
	WindowsX64 = 'WindowsX64',
	Linux = 'Linux',
	LinuxDeb = 'LinuxDeb',
}

export interface BasePlatformConfig {
	name: string;
	icon: string;
	iconName: string;
	buttonText: string;
	group: string;
}

export interface PlatformConfig extends BasePlatformConfig {
	onClick: () => void;
	link: string;
}

export interface DesktopAppConfig {
	id: string;
	logo: string;
	logoName: string;
	title: string;
	subtitle: string;
	link: Substitution;
	platforms: Partial< Record< PlatformType, PlatformConfig > >;
	isPrimary?: boolean;
}

const basePlatformConfigs: Record<
	PlatformType,
	( t: ReturnType< typeof useTranslate > ) => BasePlatformConfig
> = {
	[ PlatformType.MacSilicon ]: ( translate ) => ( {
		name: 'Mac (Apple Silicon)',
		icon: Apple,
		iconName: 'apple-logo',
		buttonText: translate( 'Download for Mac (Apple Silicon)' ),
		group: 'mac',
	} ),
	[ PlatformType.MacIntel ]: ( translate ) => ( {
		name: 'Mac (Intel)',
		icon: Apple,
		iconName: 'apple-logo',
		buttonText: translate( 'Download for Mac (Intel)' ),
		group: 'mac',
	} ),
	[ PlatformType.WindowsX64 ]: ( translate ) => ( {
		name: 'Windows (x64)',
		icon: Windows,
		iconName: 'windows-logo',
		buttonText: translate( 'Download for Windows (x64)' ),
		group: 'windows',
	} ),
	[ PlatformType.WindowsARM64 ]: ( translate ) => ( {
		name: 'Windows on ARM',
		icon: Windows,
		iconName: 'windows-logo',
		buttonText: translate( 'Download for Windows on ARM' ),
		group: 'windows',
	} ),
	[ PlatformType.Linux ]: ( translate ) => ( {
		name: 'Linux (.tar.gz)',
		icon: Linux,
		iconName: 'linux-logo',
		buttonText: translate( 'Download for Linux' ),
		group: 'linux',
	} ),
	[ PlatformType.LinuxDeb ]: ( translate ) => ( {
		name: 'Linux (.deb)',
		icon: Linux,
		iconName: 'linux-logo',
		buttonText: translate( 'Download for Linux' ),
		group: 'linux',
	} ),
};

const createPlatformConfig = ( translate: ReturnType< typeof useTranslate > ) => {
	const configs: Record< PlatformType, BasePlatformConfig > = {} as Record<
		PlatformType,
		BasePlatformConfig
	>;
	Object.entries( basePlatformConfigs ).forEach( ( [ key, configFn ] ) => {
		configs[ key as PlatformType ] = configFn( translate );
	} );
	return configs;
};

export const createWordPressDesktopConfig = (
	translate: ReturnType< typeof useTranslate >
): DesktopAppConfig => {
	const platformConfigs = createPlatformConfig( translate );

	return {
		id: 'wordpress',
		logo: DesktopAppLogo,
		logoName: 'desktop-app-logo',
		title: translate( 'WordPress.com desktop app' ),
		subtitle: translate(
			'The full WordPress.com experience packaged as an app for your laptop or desktop.'
		),
		link: translate( 'Visit {{a}}desktop.wordpress.com{{/a}} on your desktop.', {
			components: {
				a: <a href="https://desktop.wordpress.com" />,
			},
		} ),
		platforms: {
			[ PlatformType.MacSilicon ]: {
				...platformConfigs[ PlatformType.MacSilicon ],
				onClick: () => recordTracksEvent( 'calypso_app_download_mac_silicon_click' ),
				link: localizeUrl( 'https://apps.wordpress.com/d/osx-silicon?ref=getapps' ),
			},
			[ PlatformType.MacIntel ]: {
				...platformConfigs[ PlatformType.MacIntel ],
				onClick: () => recordTracksEvent( 'calypso_app_download_mac_click' ),
				link: localizeUrl( 'https://apps.wordpress.com/d/osx?ref=getapps' ),
			},
			[ PlatformType.WindowsX64 ]: {
				...platformConfigs[ PlatformType.WindowsX64 ],
				onClick: () => recordTracksEvent( 'calypso_app_download_windows_x64_click' ),
				link: localizeUrl( 'https://apps.wordpress.com/d/windows?ref=getapps' ),
			},
			[ PlatformType.WindowsARM64 ]: {
				...platformConfigs[ PlatformType.WindowsARM64 ],
				onClick: () => recordTracksEvent( 'calypso_app_download_windows_arm64_click' ),
				link: localizeUrl( 'https://apps.wordpress.com/d/windows?ref=getapps' ),
			},
			[ PlatformType.Linux ]: {
				...platformConfigs[ PlatformType.Linux ],
				onClick: () => recordTracksEvent( 'calypso_app_download_linux_tar_click' ),
				link: localizeUrl( 'https://apps.wordpress.com/d/linux?ref=getapps' ),
			},
			[ PlatformType.LinuxDeb ]: {
				...platformConfigs[ PlatformType.LinuxDeb ],
				onClick: () => recordTracksEvent( 'calypso_app_download_linux_deb_click' ),
				link: localizeUrl( 'https://apps.wordpress.com/d/linux-deb?ref=getapps' ),
			},
		},
	};
};

export const createWordPressStudioConfig = (
	translate: ReturnType< typeof useTranslate >
): DesktopAppConfig => {
	const platformConfigs = createPlatformConfig( translate );

	return {
		id: 'wordpress-studio',
		logo: StudioAppLogo,
		logoName: 'studio-app-logo',
		title: translate( 'Studio by WordPress.com' ),
		subtitle: translate( 'A fast, free way to develop locally with WordPress.' ),
		link: translate( 'Visit {{a}}developer.wordpress.com/studio{{/a}} on your desktop.', {
			components: {
				a: <a href="https://developer.wordpress.com/studio/" />,
			},
		} ),
		isPrimary: true,
		platforms: {
			[ PlatformType.MacSilicon ]: {
				...platformConfigs[ PlatformType.MacSilicon ],
				onClick: () => recordTracksEvent( 'calypso_studio_download_mac_silicon_click' ),
				link: 'https://appscdn.wordpress.com/downloads/wordpress-com-studio/mac-silicon/latest',
			},
			[ PlatformType.MacIntel ]: {
				...platformConfigs[ PlatformType.MacIntel ],
				onClick: () => recordTracksEvent( 'calypso_studio_download_mac_click' ),
				link: 'https://appscdn.wordpress.com/downloads/wordpress-com-studio/mac-intel/latest',
			},
			[ PlatformType.WindowsX64 ]: {
				...platformConfigs[ PlatformType.WindowsX64 ],
				onClick: () => recordTracksEvent( 'calypso_studio_download_windows_x64_click' ),
				link: 'https://appscdn.wordpress.com/downloads/wordpress-com-studio/windows-x64/latest',
			},
			[ PlatformType.WindowsARM64 ]: {
				...platformConfigs[ PlatformType.WindowsARM64 ],
				onClick: () => recordTracksEvent( 'calypso_studio_download_windows_arm64_click' ),
				link: 'https://appscdn.wordpress.com/downloads/wordpress-com-studio/windows-arm64/latest',
			},
		},
	};
};
