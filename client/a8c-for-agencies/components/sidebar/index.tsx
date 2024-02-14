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
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import SidebarHeader from './header';
import SiteSelector from './site-selector';

import './style.scss';

type Props = {
	className?: string;
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

const A4ASidebar = ( {
	className,
	path,
	menuItems,
	title,
	description,
	backButtonProps,
}: Props ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	return (
		<Sidebar className={ classNames( 'a4a-sidebar', className ) }>
			<SidebarHeader forceAllSitesView />

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

			<SidebarFooter className="a4a-sidebar__footer">
				<ul>
					<SidebarNavigatorMenuItem
						isExternalLink
						title={ translate( 'Get help', {
							comment: 'A4A sidebar navigation item',
						} ) }
						link="https://agencies.automattic.com/support"
						path=""
						icon={ <JetpackIcons icon="help" /> }
						onClickMenuItem={ () => {
							dispatch(
								recordTracksEvent( 'calypso_a4a_sidebar_menu_click', {
									menu_item: 'A4A / Support',
								} )
							);
						} }
					/>
				</ul>
			</SidebarFooter>

			<SiteSelector />
		</Sidebar>
	);
};

export default A4ASidebar;
