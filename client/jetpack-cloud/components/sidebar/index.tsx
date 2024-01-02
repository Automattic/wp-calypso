import { isEnabled } from '@automattic/calypso-config';
import { Icon, starEmpty } from '@wordpress/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import JetpackIcons from 'calypso/components/jetpack/sidebar/menu-items/jetpack-icons';
import Sidebar, {
	SidebarV2Main as SidebarMain,
	SidebarV2Footer as SidebarFooter,
	SidebarNavigator,
	SidebarNavigatorMenu,
	SidebarNavigatorMenuItem,
} from 'calypso/layout/sidebar-v2';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getJetpackAdminUrl from 'calypso/state/sites/selectors/get-jetpack-admin-url';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import SidebarHeader from './header';
import JetpackCloudSiteSelector from './site-selector';

import './style.scss';

type Props = {
	className?: string;
	isJetpackManage?: boolean;
	path: string;
	menuItems: {
		icon: JSX.Element;
		path: string;
		link: string;
		title: string;
		onClickMenuItem?: ( path: string ) => void;
		withChevron?: boolean;
		isExternalLink?: boolean;
		isSelected?: boolean;
		trackEventName?: string;
		trackEventProps?: { [ key: string ]: string };
	}[];
	title?: string;
	description?: string;
	backButtonProps?: {
		icon: JSX.Element;
		label: string;
		onClick: () => void;
	};
};

const JetpackCloudSidebar = ( {
	className,
	isJetpackManage,
	path,
	menuItems,
	title,
	description,
	backButtonProps,
}: Props ) => {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const jetpackAdminUrl = useSelector( ( state ) =>
		siteId ? getJetpackAdminUrl( state, siteId ) : null
	);

	const translate = useTranslate();
	const dispatch = useDispatch();

	const isUserFeedbackEnabled = isEnabled( 'jetpack/user-feedback-form' );

	const onShowUserFeedbackForm = () => {
		// TODO: Show user feedback form modal.
	};

	return (
		<Sidebar className={ classNames( 'jetpack-cloud-sidebar', className ) }>
			<SidebarHeader forceAllSitesView={ isJetpackManage } />

			<SidebarMain>
				<SidebarNavigator initialPath={ path }>
					<SidebarNavigatorMenu
						path={ path }
						title={ title }
						description={ description }
						backButtonProps={ backButtonProps }
					>
						{ menuItems.map( ( item ) => (
							<SidebarNavigatorMenuItem
								key={ item.link }
								{ ...item }
								onClickMenuItem={ ( path ) => {
									if ( item.trackEventName ) {
										dispatch( recordTracksEvent( item.trackEventName, item.trackEventProps ) );
									}

									item.onClickMenuItem?.( path );
								} }
							/>
						) ) }
					</SidebarNavigatorMenu>
				</SidebarNavigator>
			</SidebarMain>

			<SidebarFooter className="jetpack-cloud-sidebar__footer">
				<ul>
					{ ! isJetpackManage && jetpackAdminUrl && (
						<SidebarNavigatorMenuItem
							isExternalLink
							title={ translate( 'WP Admin' ) }
							link={ jetpackAdminUrl }
							path={ jetpackAdminUrl }
							icon={ <JetpackIcons icon="wordpress" /> }
							onClickMenuItem={ () => {
								dispatch( recordTracksEvent( 'calypso_jetpack_sidebar_wp_admin_link_click' ) );
							} }
						/>
					) }
					<SidebarNavigatorMenuItem
						isExternalLink
						title={ translate( 'Get help', {
							comment: 'Jetpack Cloud sidebar navigation item',
						} ) }
						link="https://jetpack.com/support"
						path=""
						icon={ <JetpackIcons icon="help" /> }
						onClickMenuItem={ () => {
							dispatch(
								recordTracksEvent( 'calypso_jetpack_sidebar_menu_click', {
									menu_item: 'Jetpack Cloud / Support',
								} )
							);
						} }
					/>

					{ isUserFeedbackEnabled && (
						<SidebarNavigatorMenuItem
							title={ translate( 'Share product feedback', {
								comment: 'Jetpack Cloud sidebar navigation item',
							} ) }
							link="#product-feedback"
							path=""
							icon={ <Icon icon={ starEmpty } /> }
							onClickMenuItem={ onShowUserFeedbackForm }
						/>
					) }
				</ul>
			</SidebarFooter>

			<JetpackCloudSiteSelector />
		</Sidebar>
	);
};

export default JetpackCloudSidebar;
