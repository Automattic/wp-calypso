import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	ExternalLink,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import SVGIcon from '../../components/svg-icon';
import { Text } from '../../components/text';
import AppsCard from './apps-card';
import Apple from './images/apple-logo.svg';
import WordPressDesktopAppLogo from './images/desktop-app-logo.svg';
import Linux from './images/linux-logo.svg';
import WordPressStudioLogo from './images/studio-app-logo.svg';
import Windows from './images/windows-logo.svg';

enum PlatformType {
	MacIntel = 'MacIntel',
	MacSilicon = 'MacSilicon',
	Linux = 'Linux',
	LinuxDeb = 'LinuxDeb',
	Windows = 'Windows',
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
	[ PlatformType.MacIntel ]: {
		group: 'mac',
		icon: Apple,
		iconName: 'apple-logo',
		name: __( 'Mac (Intel)' ),
	},
	[ PlatformType.MacSilicon ]: {
		group: 'mac',
		icon: Apple,
		iconName: 'apple-logo',
		name: __( 'Mac (Apple Silicon)' ),
	},
	[ PlatformType.Windows ]: {
		group: 'windows',
		icon: Windows,
		iconName: 'windows-logo',
		name: __( 'Windows' ),
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
			[ PlatformType.Windows ]: {
				...BaseAppProperties[ PlatformType.Windows ],
				eventName: 'calypso_dashboard_app_download_windows_click',
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
				link: 'https://cdn.a8c-ci.services/studio/studio-darwin-arm64-v1.5.6.dmg',
			},
			[ PlatformType.MacIntel ]: {
				...BaseAppProperties[ PlatformType.MacIntel ],
				eventName: 'calypso_dashboard_studio_download_mac_click',
				link: 'https://cdn.a8c-ci.services/studio/studio-darwin-x64-v1.5.6.dmg',
			},
			[ PlatformType.Windows ]: {
				...BaseAppProperties[ PlatformType.Windows ],
				eventName: 'calypso_dashboard_studio_download_windows_click',
				link: 'https://cdn.a8c-ci.services/studio/studio-win32-v1.5.6.exe',
			},
		},
	},
};

const getCurrentPlatform = (): PlatformType => {
	switch ( navigator.platform ) {
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

export default function AppsDesktopCard( { appSlug }: { appSlug: keyof typeof DesktopApps } ) {
	const { recordTracksEvent } = useAnalytics();
	const isDesktop = useViewportMatch( 'medium' );
	const Wrapper = isDesktop ? HStack : VStack;
	const app = DesktopApps[ appSlug ];

	if ( ! app ) {
		return null;
	}

	const platform = getCurrentPlatform();
	const platformConfig = app.platforms[ platform ];

	return (
		<AppsCard
			logo={ app.logo }
			logoAlt={ app.logoAlt }
			title={ app.title }
			description={ app.description }
		>
			<VStack spacing={ 4 }>
				{ platformConfig && (
					<Wrapper spacing={ 2 } justify="flex-start" alignment="flex-start">
						{ Object.entries( app.platforms )
							.filter( ( [ , config ] ) => config.group === platformConfig?.group )
							.map( ( [ key, config ], index ) => (
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
				<Wrapper spacing={ 2 } justify="flex-start">
					<Text as="p" variant="muted" lineHeight="20px">
						{ ! platformConfig ? __( 'Available for:' ) : __( 'Also available for:' ) }
					</Text>
					{ Object.entries( app.platforms )
						.filter(
							( [ , config ] ) => ! platformConfig || config.group !== platformConfig?.group
						)
						.map( ( [ key, config ] ) => (
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
				</Wrapper>
			</VStack>
		</AppsCard>
	);
}
