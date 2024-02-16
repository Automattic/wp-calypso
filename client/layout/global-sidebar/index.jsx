import { Spinner, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import GlobalSidebarHeader from 'calypso/layout/global-sidebar/header';
import useSiteMenuItems from 'calypso/my-sites/sidebar/use-site-menu-items';
import { getIsRequestingAdminMenu } from 'calypso/state/admin-menu/selectors';
import Sidebar from '../sidebar';
import './style.scss';

const GlobalSidebar = ( { children, onClick = undefined, className = '', ...props } ) => {
	const menuItems = useSiteMenuItems();
	const isRequestingMenu = useSelector( getIsRequestingAdminMenu );
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

	const { requireBackLink, ...sidebarProps } = props;

	return (
		<div className="global-sidebar">
			<GlobalSidebarHeader />
			<div className="sidebar__body">
				<Sidebar className={ className } { ...sidebarProps } onClick={ onClick }>
					{ requireBackLink && (
						<div className="sidebar__back-link">
							<a href="/sites">
								<Gridicon icon="chevron-left" size={ 24 } />
								<span className="sidebar__back-link-text">{ translate( 'Back' ) }</span>
							</a>
						</div>
					) }
					{ children }
				</Sidebar>
			</div>
		</div>
	);
};

export default GlobalSidebar;
