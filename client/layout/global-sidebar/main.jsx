import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Spinner, Gridicon } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { GlobalSidebarHeader } from 'calypso/layout/global-sidebar/header';
import useSiteMenuItems from 'calypso/my-sites/sidebar/use-site-menu-items';
import { getIsRequestingAdminMenu } from 'calypso/state/admin-menu/selectors';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
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
		<div className="global-sidebar" ref={ wrapperRef }>
			{ isDesktop && <GlobalSidebarHeader /> }
			<div className="sidebar__body" ref={ bodyRef }>
				<Sidebar className={ className } { ...sidebarProps } onClick={ onClick }>
					{ requireBackLink && (
						<div className="sidebar__back-link">
							<a href="/sites" onClick={ handleBackLinkClick }>
								<Gridicon icon="chevron-left" size={ 24 } />
								<span className="sidebar__back-link-text">{ sidebarBackLinkText }</span>
							</a>
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
