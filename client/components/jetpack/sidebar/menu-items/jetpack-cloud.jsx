import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';
import SidebarItem from 'calypso/layout/sidebar/item';
import { settingsPath } from 'calypso/lib/jetpack/paths';
import { itemLinkMatches } from 'calypso/my-sites/sidebar/utils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { setNextLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import JetpackIcons from './jetpack-icons';
import JetpackSidebarMenuItems from '.';

export default ( { path } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );

	const onNavigate = () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_sidebar_settings_clicked' ) );

		setNextLayoutFocus( 'content' );
		window.scrollTo( 0, 0 );
	};

	const shouldShowSettings = useSelector( ( state ) =>
		canCurrentUser( state, siteId, 'manage_options' )
	);

	return (
		<>
			<JetpackSidebarMenuItems
				path={ path }
				showIcons={ true }
				tracksEventNames={ {
					activityClicked: 'calypso_jetpack_sidebar_activity_clicked',
					backupClicked: 'calypso_jetpack_sidebar_backup_clicked',
					scanClicked: 'calypso_jetpack_sidebar_scan_clicked',
				} }
			/>
			{ shouldShowSettings && (
				<SidebarItem
					customIcon={ <JetpackIcons icon="settings" /> }
					label={ translate( 'Settings', {
						comment: 'Jetpack sidebar navigation item',
					} ) }
					link={ settingsPath( siteSlug ) }
					onNavigate={ onNavigate }
					selected={ itemLinkMatches( [ settingsPath( siteSlug ) ], path ) }
				/>
			) }
		</>
	);
};
