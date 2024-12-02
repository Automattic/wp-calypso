import { Button } from '@automattic/components';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { chevronRightSmall, Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { FC, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { HostingCard, HostingCardDescription } from 'calypso/components/hosting-card';
import { useActiveThemeQuery } from 'calypso/data/themes/use-active-theme-query';
import { WriteIcon } from 'calypso/layout/masterbar/write-icon';
import SidebarCustomIcon from 'calypso/layout/sidebar/custom-icon';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getCustomizeUrl from 'calypso/state/selectors/get-customize-url';
import getEditorUrl from 'calypso/state/selectors/get-editor-url';
import getPluginInstallUrl from 'calypso/state/selectors/get-plugin-install-url';
import getStatsUrl from 'calypso/state/selectors/get-stats-url';
import getThemeInstallUrl from 'calypso/state/selectors/get-theme-install-url';
import { useSiteAdminInterfaceData } from 'calypso/state/sites/hooks';
import { getSelectedSite } from 'calypso/state/ui/selectors';

interface ActionProps {
	onClick?: () => void;
	commandName?: string;
	icon: ReactNode;
	href?: string;
	text: string;
}
export const Action: FC< ActionProps > = ( { icon, href, text, commandName, onClick } ) => {
	const isDisabled = ! href && ! onClick;
	const dispatch = useDispatch();
	const clickAction = () => {
		if ( commandName ) {
			dispatch(
				recordTracksEvent( 'calypso_hosting_command_palette_navigate', {
					command: commandName,
				} )
			);
		}

		onClick?.();
	};

	return (
		<li className="hosting-overview__action">
			<Button
				className="hosting-overview__action-button"
				onClick={ clickAction }
				plain
				href={ href }
				disabled={ isDisabled }
			>
				<span className="hosting-overview__action-text">
					{ icon }
					{ text }
				</span>
				<Icon icon={ chevronRightSmall } />
			</Button>
		</li>
	);
};

const QuickActionsCard: FC = () => {
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();
	const site = useSelector( getSelectedSite );
	const { data: activeThemeData } = useActiveThemeQuery( site?.ID || -1, !! site );
	const { editorUrl, themeInstallUrl, pluginInstallUrl, statsUrl, siteEditorUrl } = useSelector(
		( state ) => ( {
			editorUrl: site?.ID ? getEditorUrl( state, site.ID ) : '#',
			themeInstallUrl: getThemeInstallUrl( state, site?.ID ) ?? '',
			pluginInstallUrl: getPluginInstallUrl( state, site?.ID ) ?? '',
			statsUrl: getStatsUrl( state, site?.ID ) ?? '',
			siteEditorUrl:
				site?.ID && activeThemeData
					? getCustomizeUrl(
							state as object,
							activeThemeData[ 0 ]?.stylesheet,
							site?.ID,
							activeThemeData[ 0 ]?.is_block_theme
					  )
					: '',
		} )
	);

	const { adminLabel, adminUrl } = useSiteAdminInterfaceData( site?.ID );

	const isMac = window?.navigator.userAgent && window.navigator.userAgent.indexOf( 'Mac' ) > -1;
	const paletteShortcut = isMac ? '⌘K' : 'Ctrl + K';

	return (
		<HostingCard className="hosting-overview__quick-actions">
			<div className="hosting-card__title-wrapper">
				<h3 className="hosting-card__title">
					{ hasEnTranslation( 'Command Palette' )
						? translate( 'Command Palette' )
						: translate( 'Quick actions' ) }
				</h3>
				<span className="hosting-card__title-shortcut">{ paletteShortcut }</span>
			</div>
			<HostingCardDescription>
				{ translate(
					// Translators: {{shortcut/}} is "⌘K" or "Ctrl+K" depending on the user's OS.
					'Navigate your site smoothly. Use the commands below or press %(shortcut)s for more options.',
					{
						args: { shortcut: paletteShortcut },
					}
				) }
			</HostingCardDescription>
			<ul className="hosting-overview__actions-list">
				<Action
					icon={ <SidebarCustomIcon icon="dashicons-wordpress-alt hosting-overview__dashicon" /> }
					href={ adminUrl }
					text={ adminLabel }
					commandName="openSiteDashboard"
				/>
				<Action
					icon={
						<SidebarCustomIcon icon="dashicons-admin-customizer hosting-overview__dashicon" />
					}
					href={ siteEditorUrl }
					text={ translate( 'Edit site' ) }
					commandName="openSiteEditor"
				/>
				<Action
					icon={ <WriteIcon /> }
					href={ editorUrl }
					text={ translate( 'Write post' ) }
					commandName="addNewPost"
				/>
				<Action
					icon={
						<SidebarCustomIcon icon="dashicons-admin-appearance hosting-overview__dashicon" />
					}
					href={ themeInstallUrl }
					text={ translate( 'Change theme' ) }
					commandName="installTheme"
				/>
				<Action
					icon={ <SidebarCustomIcon icon="dashicons-admin-plugins hosting-overview__dashicon" /> }
					href={ pluginInstallUrl }
					text={ translate( 'Install plugins' ) }
					commandName="installPlugin"
				/>
				<Action
					icon={ <SidebarCustomIcon icon="dashicons-chart-bar hosting-overview__dashicon" /> }
					href={ statsUrl }
					text={ translate( 'See Jetpack Stats' ) }
					commandName="openJetpackStats"
				/>
			</ul>
		</HostingCard>
	);
};

export default QuickActionsCard;
