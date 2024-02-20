import { Spinner, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { useCurrentRoute } from 'calypso/components/route';
import GlobalSidebarHeader from 'calypso/layout/global-sidebar/header';
import useSiteMenuItems from 'calypso/my-sites/sidebar/use-site-menu-items';
import { getIsRequestingAdminMenu } from 'calypso/state/admin-menu/selectors';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getShouldShowGlobalSiteSidebar } from 'calypso/state/global-sidebar/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import Sidebar from '../sidebar';
import { GlobalSidebarFooter, GlobalSiteSidebarFooter } from './footer';
import './style.scss';

const GlobalSidebar = ( { children, onClick = undefined, className = '', ...props } ) => {
	const menuItems = useSiteMenuItems();
	const isRequestingMenu = useSelector( getIsRequestingAdminMenu );
	const translate = useTranslate();
	const currentUser = useSelector( getCurrentUser );
	const selectedSiteSlug = useSelector( ( state ) => getSelectedSiteSlug( state ) );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const { currentSection } = useCurrentRoute();
	const shouldShowGlobalSiteSidebar = useSelector( ( state ) => {
		return getShouldShowGlobalSiteSidebar( state, selectedSiteId, currentSection?.group );
	} );

	/**
	 * If there are no menu items and we are currently requesting some,
	 * then show a spinner. The check for menuItems is necessary because
	 * we may choose to render the menu from statically stored JSON data
	 * and therefore we need to be ready to render.
	 */
	if ( ! menuItems && isRequestingMenu ) {
		return <Spinner className="sidebar__menu-loading" />;
	}

	const { requireBackLink, backLinkText, ...sidebarProps } = props;
	const sidebarBackLinkText = backLinkText ?? translate( 'Back' );

	return (
		<div className="global-sidebar">
			<GlobalSidebarHeader />
			<div className="sidebar__body">
				<Sidebar className={ className } { ...sidebarProps } onClick={ onClick }>
					{ requireBackLink && (
						<div className="sidebar__back-link">
							<a href="/sites">
								<Gridicon icon="chevron-left" size={ 24 } />
								<span className="sidebar__back-link-text">{ sidebarBackLinkText }</span>
							</a>
						</div>
					) }
					{ children }
				</Sidebar>
			</div>
			{ shouldShowGlobalSiteSidebar ? (
				<GlobalSiteSidebarFooter selectedSiteSlug={ selectedSiteSlug } translate={ translate } />
			) : (
				<GlobalSidebarFooter user={ currentUser } translate={ translate } />
			) }
		</div>
	);
};

export default GlobalSidebar;
