import { useRouterState } from '@tanstack/react-router';
import { Navigator } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import clsx from 'clsx';
import { useEffect, useMemo, useRef } from 'react';
import RouterLinkButton from '../../components/router-link-button';
import DomainSidebar from '../../domains/domain-sidebar';
import MeSidebar from '../../me/me-sidebar';
import SiteSidebar from '../../sites/site-sidebar';
import { useAnalytics } from '../analytics';
import { useAppContext } from '../context';
import PrimaryMenu from '../primary-menu';
import RouteErrorBoundary from './error';
import { getScreenPath, NavigatorRouteSync } from './navigator-route-sync';

import './style.scss';

export function ResponsiveSidebar( { isOpen, onClose }: { isOpen: boolean; onClose: () => void } ) {
	return (
		<div className={ clsx( 'dashboard-sidebar-responsive__panel', { 'is-open': isOpen } ) }>
			<Sidebar onNavigate={ onClose } />
		</div>
	);
}

export default function Sidebar( { onNavigate }: { onNavigate?: () => void } ) {
	const { Logo, name } = useAppContext();
	const { recordTracksEvent } = useAnalytics();
	const { resolvedPathname, hasError } = useRouterState( {
		select: ( state ) => ( {
			resolvedPathname: state.resolvedLocation?.pathname ?? state.location.pathname,
			hasError: state.matches.some(
				( match ) => match.status === 'error' || match.status === 'notFound'
			),
		} ),
	} );
	const screenPath = getScreenPath( resolvedPathname, hasError );
	const initialPath = useMemo( () => screenPath, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	// Close responsive panel when a navigation link is clicked
	const sidebarRef = useRef< HTMLDivElement >( null );
	useEffect( () => {
		if ( ! onNavigate ) {
			return;
		}
		const el = sidebarRef.current;
		if ( ! el ) {
			return;
		}
		const handler = ( event: MouseEvent ) => {
			if ( ( event.target as HTMLElement ).closest( 'a' ) ) {
				onNavigate();
			}
		};
		el.addEventListener( 'click', handler );
		return () => el.removeEventListener( 'click', handler );
	}, [ onNavigate ] );

	return (
		<div className="dashboard-sidebar" ref={ sidebarRef }>
			{ Logo && (
				<div className="dashboard-sidebar__logo">
					<RouterLinkButton
						/* translators: Screen reader text for link to root of the hosting dashboard. "name" is the product name, e.g. WordPress.com */
						aria-label={ sprintf( __( '%(name)s home' ), { name } ) }
						icon={ <Logo /> }
						to="/"
						onClick={ () => {
							recordTracksEvent( 'calypso_dashboard_logo_click' );
						} }
					/>
				</div>
			) }
			<Navigator initialPath={ initialPath }>
				<NavigatorRouteSync screenPath={ screenPath } />

				<Navigator.Screen path="/">
					<PrimaryMenu />
				</Navigator.Screen>

				<Navigator.Screen path="/sites/:siteSlug">
					<RouteErrorBoundary>
						<SiteSidebar />
					</RouteErrorBoundary>
				</Navigator.Screen>

				<Navigator.Screen path="/domains/:domainName">
					<RouteErrorBoundary>
						<DomainSidebar />
					</RouteErrorBoundary>
				</Navigator.Screen>

				<Navigator.Screen path="/me">
					<RouteErrorBoundary>
						<MeSidebar />
					</RouteErrorBoundary>
				</Navigator.Screen>
			</Navigator>
		</div>
	);
}
