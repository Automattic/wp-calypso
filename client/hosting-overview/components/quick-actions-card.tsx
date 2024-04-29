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
	const hasEnTranslation = useHasEnTranslation();
	const site = useSelector( getSelectedSite );
	const editorUrl = useSelector( ( state ) => ( site?.ID ? getEditorUrl( state, site.ID ) : '#' ) );
	const translate = useTranslate();

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
				<Action icon={ <WriteIcon /> } href={ editorUrl } text={ translate( 'Write post' ) } />
				<Action
					icon={
						<SidebarCustomIcon icon="dashicons-admin-appearance hosting-overview__dashicon" />
					}
					href={ getThemeInstallUrl( state, site?.ID ) }
					text={ translate( 'Change theme' ) }
				/>
				<Action
					icon={ <SidebarCustomIcon icon="dashicons-admin-plugins hosting-overview__dashicon" /> }
					href={ getPluginInstallUrl( state, site?.ID ) }
					text={ translate( 'Install plugins' ) }
				/>
				<Action
					icon={ <SidebarCustomIcon icon="dashicons-chart-bar hosting-overview__dashicon" /> }
					href={ getStatsUrl( state, site?.ID ) }
					text={ translate( 'See Jetpack Stats' ) }
				/>
			</ul>
		</Card>
	);
};

export default QuickActionsCard;
