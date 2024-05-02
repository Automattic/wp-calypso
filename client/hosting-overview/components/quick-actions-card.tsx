import { Button, Card } from '@automattic/components';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { chevronRightSmall, Icon } from '@wordpress/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { FC, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { WriteIcon } from 'calypso/layout/masterbar/write-icon';
import SidebarCustomIcon from 'calypso/layout/sidebar/custom-icon';
import getEditorUrl from 'calypso/state/selectors/get-editor-url';
import getPluginInstallUrl from 'calypso/state/selectors/get-plugin-install-url';
import getSiteEditorUrl from 'calypso/state/selectors/get-site-editor-url';
import getStatsUrl from 'calypso/state/selectors/get-stats-url';
import getThemeInstallUrl from 'calypso/state/selectors/get-theme-install-url';
import { getSelectedSite } from 'calypso/state/ui/selectors';

interface ActionProps {
	icon: ReactNode;
	href: string;
	text: string;
}
const Action: FC< ActionProps > = ( { icon, href, text } ) => {
	return (
		<li className="hosting-overview__action">
			<Button className="hosting-overview__action-button" plain href={ href }>
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
	const siteEditorUrl = useSelector( ( state: object ) =>
		site?.ID ? getSiteEditorUrl( state, site.ID ) : ''
	);
	const { editorUrl, themeInstallUrl, pluginInstallUrl, statsUrl } = useSelector( ( state ) => ( {
		editorUrl: site?.ID ? getEditorUrl( state, site.ID ) : '#',
		themeInstallUrl: getThemeInstallUrl( state, site?.ID ) ?? '',
		pluginInstallUrl: getPluginInstallUrl( state, site?.ID ) ?? '',
		statsUrl: getStatsUrl( state, site?.ID ) ?? '',
	} ) );

	return (
		<Card className={ classNames( 'hosting-overview__card', 'hosting-overview__quick-actions' ) }>
			<div className="hosting-overview__card-header">
				<h3 className="hosting-overview__card-title">
					{ hasEnTranslation( 'WP Admin links' )
						? translate( 'WP Admin links' )
						: translate( 'Quick actions' ) }
				</h3>
			</div>

			<ul className="hosting-overview__actions-list">
				<Action
					icon={
						<SidebarCustomIcon icon="dashicons-admin-customizer hosting-overview__dashicon" />
					}
					href={ siteEditorUrl }
					text={ translate( 'Edit site' ) }
				/>
				<Action icon={ <WriteIcon /> } href={ editorUrl } text={ translate( 'Write post' ) } />
				<Action
					icon={
						<SidebarCustomIcon icon="dashicons-admin-appearance hosting-overview__dashicon" />
					}
					href={ themeInstallUrl }
					text={ translate( 'Change theme' ) }
				/>
				<Action
					icon={ <SidebarCustomIcon icon="dashicons-admin-plugins hosting-overview__dashicon" /> }
					href={ pluginInstallUrl }
					text={ translate( 'Install plugins' ) }
				/>
				<Action
					icon={ <SidebarCustomIcon icon="dashicons-chart-bar hosting-overview__dashicon" /> }
					href={ statsUrl }
					text={ translate( 'See Jetpack Stats' ) }
				/>
				<Action
					icon={ <SidebarCustomIcon icon="dashicons-wordpress-alt hosting-overview__dashicon" /> }
					href={ site ? site.options?.admin_url || `${ site.URL }/wp-admin` : '' }
					text={ translate( 'WP Admin' ) }
				/>
			</ul>
		</Card>
	);
};

export default QuickActionsCard;
