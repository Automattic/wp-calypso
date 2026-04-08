import {
	queryClient,
	rawUserPreferencesQuery,
	siteByIdQuery,
	userPreferenceQuery,
} from '@automattic/api-queries';
import { QueryObserver } from '@tanstack/react-query';
import { removeQueryArgs } from '@wordpress/url';
import { hydrateRoot } from 'react-dom/client';
import { AUTH_QUERY_KEY, initializeCurrentUser } from '../auth';
import { getCurrentOmnibarSiteId, setCurrentOmnibarSiteId } from '../omnibar/current-site';
import type { OmnibarEvents } from './click-handlers';
import type { UserPreferences } from '@automattic/api-core';

export default async function loadOmnibar( events: OmnibarEvents ) {
	const container = document.getElementById( 'wpcom-omnibar' );
	if ( ! container ) {
		return;
	}

	container.addEventListener( 'click', ( event ) => {
		if ( event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ) {
			return;
		}

		const anchor = ( event.target as Element ).closest< HTMLAnchorElement >( 'a[href]' );
		if ( ! anchor || anchor.target === '_blank' ) {
			return;
		}

		const href = anchor.getAttribute( 'href' );
		if ( ! href ) {
			return;
		}

		events.linkClick.emit( { href, event } );
	} );

	const [ { InterimOmnibar }, user ] = await Promise.all( [
		import( './interim-omnibar' ),
		queryClient.fetchQuery( { queryKey: AUTH_QUERY_KEY, queryFn: initializeCurrentUser } ),
	] );

	// Hydrate matching the SSR output: user when bootstrapped, null when not.
	const root = hydrateRoot(
		container,
		<InterimOmnibar
			user={ window.currentUser ?? null }
			site={ null }
			currentRoute={ window.location.pathname }
		/>
	);

	const handleToggleMenu = () => events.mobileMenu.emit();
	const handleToggleNotifications = () =>
		events.notifications.emit(
			container.querySelector< HTMLElement >( '.masterbar-notifications' )
		);

	async function renderWithSiteId( siteId: number | undefined ) {
		const site = siteId
			? await queryClient.ensureQueryData( siteByIdQuery( siteId ) ).catch( () => null )
			: null;
		root.render(
			<InterimOmnibar
				user={ user }
				site={ site }
				currentRoute={ window.location.pathname }
				onToggleMenu={ handleToggleMenu }
				onToggleNotifications={ handleToggleNotifications }
			/>
		);
	}

	const originSiteId = Number(
		new URLSearchParams( window.location.search ).get( 'origin_site_id' )
	);
	if ( originSiteId > 0 ) {
		setCurrentOmnibarSiteId( originSiteId );
		window.history.replaceState(
			null,
			'',
			removeQueryArgs( window.location.pathname + window.location.search, 'origin_site_id' )
		);
	}

	const recentSites = queryClient.getQueryData< UserPreferences >(
		rawUserPreferencesQuery().queryKey
	)?.recentSites;

	// Render with the origin site as higher priority.
	const initialSiteId = originSiteId || getCurrentOmnibarSiteId( user, recentSites );
	renderWithSiteId( initialSiteId );

	// Re-render whenever recentSites changes (e.g. user navigates to a different site).
	new QueryObserver( queryClient, userPreferenceQuery( 'recentSites' ) ).subscribe( ( result ) => {
		const siteId = getCurrentOmnibarSiteId( user, result.data );
		if ( siteId !== initialSiteId ) {
			renderWithSiteId( siteId );
		}
	} );
}
