import {
	queryClient,
	rawUserPreferencesQuery,
	siteByIdQuery,
	userPreferenceQuery,
} from '@automattic/api-queries';
import { QueryObserver } from '@tanstack/react-query';
import { hydrateRoot } from 'react-dom/client';
import { AUTH_QUERY_KEY, initializeCurrentUser } from '../auth';
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
		const site = siteId ? await queryClient.ensureQueryData( siteByIdQuery( siteId ) ) : null;
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

	// Render with the initial recent site (or primary blog as fallback).
	const recentSites = queryClient.getQueryData< UserPreferences >(
		rawUserPreferencesQuery().queryKey
	)?.recentSites;
	const initialSiteId = recentSites?.[ 0 ] || user.primary_blog;
	renderWithSiteId( initialSiteId );

	// Re-render whenever recentSites changes (e.g. user navigates to a different site).
	let currentSiteId = initialSiteId;
	new QueryObserver( queryClient, userPreferenceQuery( 'recentSites' ) ).subscribe( ( result ) => {
		const siteId = result.data?.[ 0 ] || user.primary_blog;
		if ( siteId !== currentSiteId ) {
			currentSiteId = siteId;
			renderWithSiteId( siteId );
		}
	} );
}
