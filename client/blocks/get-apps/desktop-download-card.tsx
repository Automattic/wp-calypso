import { recordTracksEvent } from '@automattic/calypso-analytics';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import Apple from 'calypso/assets/images/icons/apple-logo.svg';
import DesktopAppLogo from 'calypso/assets/images/icons/desktop-app-logo.svg';
import Linux from 'calypso/assets/images/icons/linux-logo.svg';
import Windows from 'calypso/assets/images/icons/windows-logo.svg';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import SplitButton from 'calypso/components/split-button';
import SVGIcon from 'calypso/components/svg-icon';
import userAgent from 'calypso/lib/user-agent';
import { AppsCard } from './apps-card';

enum PlatformType {
	MacIntel = 'MacIntel',
	MacSilicon = 'MacSilicon',
	Windows = 'Windows',
	Linux = 'Linux',
	LinuxDeb = 'LinuxDeb',
}

interface PlatformConfig {
	name: string;
	icon: string;
	iconName: string;
	onClick: () => void;
	link: string;
	buttonText: string;
	group: string;
}

const AlsoAvailable: React.FC< { config: PlatformConfig } > = ( { config } ) => (
	<a
		href={ localizeUrl( config.link ) }
		onClick={ config.onClick }
		className="get-apps__desktop-link"
	>
		<SVGIcon
			classes=""
			aria-hidden="true"
			name={ config.iconName }
			size={ 16 }
			icon={ config.icon }
		/>
		{ config.name }
	</a>
);

const DesktopDownloadCardTest = () => {
	const translate = useTranslate();
	const { isMobile } = userAgent;

	const WORDPRESS_DESKTOP_APP_PARAMS: Record< PlatformType, PlatformConfig > = useMemo(
		() => ( {
			[ PlatformType.MacIntel ]: {
				name: 'Mac with Intel Chip',
				icon: Apple,
				iconName: 'apple-logo',
				onClick: () => recordTracksEvent( 'calypso_app_download_mac_click' ),
				link: localizeUrl( 'https://apps.wordpress.com/d/osx?ref=getapps' ),
				buttonText: translate( 'Download for Mac' ),
				group: 'mac',
			},
			[ PlatformType.MacSilicon ]: {
				name: 'Mac with Apple Silicon Chip',
				icon: Apple,
				iconName: 'apple-logo',
				onClick: () => recordTracksEvent( 'calypso_app_download_mac_silicon_click' ),
				link: localizeUrl( 'https://apps.wordpress.com/d/osx-silicon?ref=getapps' ),
				buttonText: translate( 'Download for Mac' ),
				group: 'mac',
			},
			[ PlatformType.Windows ]: {
				name: 'Windows',
				icon: Windows,
				iconName: 'windows-logo',
				onClick: () => recordTracksEvent( 'calypso_app_download_windows_click' ),
				link: localizeUrl( 'https://apps.wordpress.com/d/windows?ref=getapps' ),
				buttonText: translate( 'Download for Windows' ),
				group: 'windows',
			},
			[ PlatformType.Linux ]: {
				name: 'Linux (.tar.gz)',
				icon: Linux,
				iconName: 'linux-logo',
				onClick: () => recordTracksEvent( 'calypso_app_download_linux_tar_click' ),
				link: localizeUrl( 'https://apps.wordpress.com/d/linux?ref=getapps' ),
				buttonText: translate( 'Download for Linux' ),
				group: 'linux',
			},
			[ PlatformType.LinuxDeb ]: {
				name: 'Linux (.deb)',
				icon: Linux,
				iconName: 'linux-logo',
				onClick: () => recordTracksEvent( 'calypso_app_download_linux_deb_click' ),
				link: localizeUrl( 'https://apps.wordpress.com/d/linux-deb?ref=getapps' ),
				buttonText: translate( 'Download for Linux' ),
				group: 'linux',
			},
		} ),
		[ translate ]
	);

	const platform = useMemo( () => getCurrentPlatform(), [] );

	function getCurrentPlatform(): PlatformType {
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
	}

	const getDesktopDeviceDownloadOptions = () => {
		return (
			<>
				<div className="get-apps__desktop-button">
					<SplitButton
						whiteSeparator
						label={ WORDPRESS_DESKTOP_APP_PARAMS[ platform ].buttonText }
						icon={
							<SVGIcon
								classes="get-apps__desktop-button-icon"
								aria-hidden="true"
								name={ WORDPRESS_DESKTOP_APP_PARAMS[ platform ].iconName }
								size={ 16 }
								icon={ WORDPRESS_DESKTOP_APP_PARAMS[ platform ].icon }
							/>
						}
						onClick={ WORDPRESS_DESKTOP_APP_PARAMS[ platform ].onClick }
						href={ WORDPRESS_DESKTOP_APP_PARAMS[ platform ].link }
					>
						{ Object.entries( WORDPRESS_DESKTOP_APP_PARAMS )
							.filter(
								( [ , config ] ) => config.group === WORDPRESS_DESKTOP_APP_PARAMS[ platform ].group
							)
							.map( ( [ key, config ] ) => (
								<PopoverMenuItem key={ key } href={ config.link } onClick={ config.onClick }>
									{ config.name }
								</PopoverMenuItem>
							) ) }
					</SplitButton>
				</div>

				<div className="get-apps__also-available">
					<div className="get-apps__also-available-title">
						{ translate( 'Also available for:' ) }
					</div>

					<div className="get-apps__also-available-list">
						{ Object.entries( WORDPRESS_DESKTOP_APP_PARAMS )
							.filter(
								( [ , config ] ) => config.group !== WORDPRESS_DESKTOP_APP_PARAMS[ platform ].group
							)
							.map( ( [ key, config ] ) => (
								<AlsoAvailable key={ key } config={ config } />
							) ) }
					</div>
				</div>
			</>
		);
	};

	return (
		<AppsCard
			logo={ DesktopAppLogo }
			logoName="desktop-app-logo"
			title={ translate( 'WordPress.com desktop app' ) }
			subtitle={ translate(
				'The full WordPress.com experience packaged as an app for your laptop or desktop.'
			) }
		>
			{ isMobile ? (
				<div className="get-apps__desktop-link">
					{ translate( 'Visit {{a}}desktop.wordpress.com{{/a}} on your desktop.', {
						components: {
							a: <a href="https://desktop.wordpress.com" />,
						},
					} ) }
				</div>
			) : (
				getDesktopDeviceDownloadOptions()
			) }
		</AppsCard>
	);
};

export default DesktopDownloadCardTest;
