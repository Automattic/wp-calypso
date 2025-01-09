import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import SplitButton from 'calypso/components/split-button';
import SVGIcon from 'calypso/components/svg-icon';
import userAgent from 'calypso/lib/user-agent';
import { AppsCard } from './apps-card';
import { PlatformType, type DesktopAppConfig } from './apps-config';

interface AlsoAvailableConfig {
	name: string;
	icon: string;
	iconName: string;
	link: string;
	onClick: () => void;
}

const AlsoAvailable: React.FC< { config: AlsoAvailableConfig } > = ( { config } ) => (
	<a href={ config.link } onClick={ config.onClick } className="get-apps__desktop-link">
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

interface DesktopDownloadCardProps {
	appConfig: DesktopAppConfig;
}

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
	const translate = useTranslate();
	const { isMobile } = userAgent;
	const platform = useMemo( () => getCurrentPlatform(), [] );

	const currentPlatformConfig = useMemo(
		() => appConfig.platforms[ platform ],
		[ appConfig.platforms, platform ]
	);

	const getDesktopDeviceDownloadOptions = () => {
		if ( ! currentPlatformConfig ) {
			return (
				<div className="get-apps__not-available">
					{ translate( 'Not available for your platform. Available for:' ) }
					<div className="get-apps__also-available-list">
						{ Object.entries( appConfig.platforms ).map( ( [ key, config ] ) => (
							<AlsoAvailable key={ key } config={ config } />
						) ) }
					</div>
				</div>
			);
		}

		return (
			<>
				<div className="get-apps__desktop-button">
					<SplitButton
						whiteSeparator={ appConfig.isPrimary }
						primary={ appConfig.isPrimary }
						label={ currentPlatformConfig.buttonText }
						icon={
							<SVGIcon
								classes="get-apps__desktop-button-icon"
								aria-hidden="true"
								name={ currentPlatformConfig.iconName }
								size={ 16 }
								icon={ currentPlatformConfig.icon }
							/>
						}
						onClick={ currentPlatformConfig.onClick }
						href={ currentPlatformConfig.link }
					>
						{ Object.entries( appConfig.platforms )
							.filter( ( [ , config ] ) => config.group === currentPlatformConfig.group )
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
						{ Object.entries( appConfig.platforms )
							.filter( ( [ , config ] ) => config.group !== currentPlatformConfig.group )
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
			logo={ appConfig.logo }
			logoName={ appConfig.logoName }
			title={ appConfig.title }
			subtitle={ appConfig.subtitle }
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

export default DesktopDownloadCard;
