import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import SplitButton from 'calypso/components/split-button';
import SVGIcon from 'calypso/components/svg-icon';
import { PlatformConfig, type DesktopAppConfig } from './apps-config';

type Props = {
	appConfig: DesktopAppConfig;
	currentPlatformConfig?: PlatformConfig;
	isMobile: boolean;
	platformDetectionFailed?: boolean;
};

const AlsoAvailable: React.FC< { config: PlatformConfig } > = ( { config } ) => (
	<a
		href={ config.link }
		onClick={ config.onClick }
		className="get-apps__desktop-link"
		aria-label={ config.buttonText }
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

export const DesktopDownloadOptions: React.FC< Props > = ( {
	appConfig,
	currentPlatformConfig,
	isMobile,
	platformDetectionFailed = false,
} ) => {
	const translate = useTranslate();

	if ( isMobile ) {
		return <div className="get-apps__desktop-link">{ appConfig.link }</div>;
	}

	// Architecture detected successfully - show single button
	if ( currentPlatformConfig && ! platformDetectionFailed ) {
		return (
			<>
				<div className="get-apps__desktop-button">
					<Button
						className="button"
						variant={ appConfig.isPrimary ? 'primary' : 'secondary' }
						onClick={ currentPlatformConfig.onClick }
						href={ currentPlatformConfig.link }
					>
						<SVGIcon
							classes="get-apps__desktop-button-icon"
							aria-hidden="true"
							name={ currentPlatformConfig.iconName }
							size={ 16 }
							icon={ currentPlatformConfig.icon }
						/>
						{ currentPlatformConfig.buttonText }
					</Button>
				</div>

				<div className="get-apps__also-available">
					<div className="get-apps__also-available-title">
						{ translate( 'Also available for:' ) }
					</div>

					<div className="get-apps__also-available-list">
						{ Object.entries( appConfig.platforms )
							.filter( ( [ , config ] ) => config !== currentPlatformConfig )
							.map( ( [ key, config ] ) => (
								<AlsoAvailable key={ key } config={ config } />
							) ) }
					</div>
				</div>
			</>
		);
	}

	// Fallback - show SplitButton with dropdown (existing logic)
	return (
		<>
			<div className="get-apps__desktop-button">
				<SplitButton
					whiteSeparator={ appConfig.isPrimary }
					primary={ appConfig.isPrimary }
					disabled={ ! currentPlatformConfig }
					label={
						! currentPlatformConfig
							? translate( 'Not available.' )
							: currentPlatformConfig.buttonText
					}
					icon={
						<SVGIcon
							classes="get-apps__desktop-button-icon"
							aria-hidden="true"
							name={ currentPlatformConfig?.iconName ?? '' }
							size={ 16 }
							icon={ currentPlatformConfig?.icon ?? '' }
						/>
					}
					onClick={ currentPlatformConfig?.onClick }
					href={ currentPlatformConfig?.link }
				>
					{ Object.entries( appConfig.platforms )
						.filter( ( [ , config ] ) => config.group === currentPlatformConfig?.group )
						.map( ( [ key, config ] ) => (
							<PopoverMenuItem
								key={ key }
								href={ config.link }
								onClick={ config.onClick }
								aria-label={ config.buttonText }
							>
								{ config.name }
							</PopoverMenuItem>
						) ) }
				</SplitButton>
			</div>

			<div className="get-apps__also-available">
				<div className="get-apps__also-available-title">
					{ ! currentPlatformConfig
						? translate( 'Available for:' )
						: translate( 'Also available for:' ) }
				</div>

				<div className="get-apps__also-available-list">
					{ Object.entries( appConfig.platforms )
						.filter(
							( [ , config ] ) =>
								! currentPlatformConfig || config.group !== currentPlatformConfig?.group
						)
						.map( ( [ key, config ] ) => (
							<AlsoAvailable key={ key } config={ config } />
						) ) }
				</div>
			</div>
		</>
	);
};
