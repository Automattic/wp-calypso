import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Spinner, Gridicon } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { GlobalSidebarHeader } from 'calypso/layout/global-sidebar/header';
import useSiteMenuItems from 'calypso/my-sites/sidebar/use-site-menu-items';
import { getIsRequestingAdminMenu } from 'calypso/state/admin-menu/selectors';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import { getSection } from 'calypso/state/ui/selectors';
import Sidebar from '../sidebar';
import { GLOBAL_SIDEBAR_EVENTS } from './events';
import { GlobalSidebarFooter } from './footer';
import './style.scss';

const GlobalSidebar = ( {
	children,
	onClick = undefined,
	className = '',
	path = '',
	...props
} ) => {
	const wrapperRef = useRef( null );
	const bodyRef = useRef( null );
	const menuItems = useSiteMenuItems();
	const isRequestingMenu = useSelector( getIsRequestingAdminMenu );
	const translate = useTranslate();
	const currentUser = useSelector( getCurrentUser );
	const isDesktop = useBreakpoint( '>=782px' );
	const previousRoute = useSelector( getPreviousRoute );
	const section = useSelector( getSection );
	const [ previousLink, setPreviousLink ] = useState( '' );
	const handleWheel = useCallback( ( event ) => {
		const bodyEl = bodyRef.current;
		if ( bodyEl && bodyEl.contains( event.target ) && bodyEl.scrollHeight > bodyEl.clientHeight ) {
			event.preventDefault();
			bodyEl.scrollTop += event.deltaY;
		}
	}, [] );

	const handleBackLinkClick = () => {
		recordTracksEvent( GLOBAL_SIDEBAR_EVENTS.MENU_BACK_CLICK, { path } );
	};

	useEffect( () => {
		wrapperRef.current?.addEventListener( 'wheel', handleWheel, { passive: false } );
		return () => {
			wrapperRef.current?.removeEventListener( 'wheel', handleWheel );
		};
	}, [ handleWheel ] );

	useEffect( () => {
		// Update the previous link only when the group is changed.
		if ( previousRoute && ! previousRoute.startsWith( `/${ section.group }` ) ) {
			setPreviousLink( previousRoute );
		}
	}, [ previousRoute, section.group ] );

	/**
	 * If there are no menu items and we are currently requesting some,
	 * then show a spinner. The check for menuItems is necessary because
	 * we may choose to render the menu from statically stored JSON data
	 * and therefore we need to be ready to render.
	 */
	if ( ! menuItems && isRequestingMenu ) {
		return <Spinner className="sidebar__menu-loading" />;
	}

	const { requireBackLink, siteTitle, backLinkHref, ...sidebarProps } = props;
	const sidebarBackLinkHref = backLinkHref || previousLink || '/sites';

	return (
		<div className="global-sidebar" ref={ wrapperRef }>
			{ isDesktop && <GlobalSidebarHeader /> }
			<div className="sidebar__body" ref={ bodyRef }>
				<Sidebar className={ className } { ...sidebarProps } onClick={ onClick }>
					{ requireBackLink && (
						<div className="sidebar__back-link">
							<a href={ sidebarBackLinkHref } onClick={ handleBackLinkClick }>
								<Gridicon icon="chevron-left" size={ 24 } />
							</a>
							<span className="sidebar__site-title">{ siteTitle || translate( 'Back' ) }</span>
						</div>
					) }
					{ children }
				</Sidebar>
			</div>
			<GlobalSidebarFooter user={ currentUser } translate={ translate } />
		</div>
	);
};

export default GlobalSidebar;
