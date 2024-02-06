import { Spinner } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { Fragment } from 'react';
import { useSelector } from 'react-redux';
import GlobalSidebarFooter from 'calypso/layout/global-sidebar/footer';
import GlobalSidebarHeader from 'calypso/layout/global-sidebar/header';
import useSiteMenuItems from 'calypso/my-sites/sidebar/use-site-menu-items';
import { getIsRequestingAdminMenu } from 'calypso/state/admin-menu/selectors';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import Sidebar from '../sidebar';
import './style.scss';

const GlobalSidebar = ( { children, onClick = undefined, className = '', ...props } ) => {
	const menuItems = useSiteMenuItems();
	const isRequestingMenu = useSelector( getIsRequestingAdminMenu );
	const currentUser = useSelector( getCurrentUser );
	const translate = useTranslate();

	/**
	 * If there are no menu items and we are currently requesting some,
	 * then show a spinner. The check for menuItems is necessary because
	 * we may choose to render the menu from statically stored JSON data
	 * and therefore we need to be ready to render.
	 */
	if ( ! menuItems && isRequestingMenu ) {
		return <Spinner className="sidebar__menu-loading" />;
	}

	return (
		<Fragment>
			<GlobalSidebarHeader />
			<Sidebar className={ className } { ...props } onClick={ onClick }>
				{ children }
			</Sidebar>
			<GlobalSidebarFooter user={ currentUser } translate={ translate } />
		</Fragment>
	);
};

export default GlobalSidebar;
