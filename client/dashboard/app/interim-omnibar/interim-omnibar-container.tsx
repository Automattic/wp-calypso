import { queryClient, siteByIdQuery, userPreferenceQuery } from '@automattic/api-queries';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { AUTH_QUERY_KEY, initializeCurrentUser } from '../auth';
import { InterimOmnibar } from './interim-omnibar';
import type { OmnibarEvents } from './click-handlers';
import type { User } from '@automattic/api-core';

interface InterimOmnibarContainerProps {
	initialUser: User | null;
	events: OmnibarEvents;
}

/**
 * Drives `InterimOmnibar` via TanStack Query hooks so that all updates flow
 * through normal React rendering. The first render must match the SSR output
 * exactly — `user = initialUser`, `site = null`, no callbacks — so hydration
 * succeeds. After hydration commits, `useEffect` flips `hydrated` to true and
 * the component is free to diverge as queries resolve.
 *
 * This replaces the previous pattern of driving React imperatively via
 * `root.render` + `QueryObserver.subscribe`, which raced hydration and
 * triggered the "switched the entire root to client rendering" warning.
 */
function InterimOmnibarDataProvider( { initialUser, events }: InterimOmnibarContainerProps ) {
	// `useEffect` only runs after React has committed, so any state update it
	// triggers cannot race hydration.
	const [ hydrated, setHydrated ] = useState( false );
	useEffect( () => {
		setHydrated( true );
	}, [] );

	const { data: user } = useQuery( {
		queryKey: AUTH_QUERY_KEY,
		queryFn: initializeCurrentUser,
		initialData: initialUser ?? undefined,
		enabled: hydrated,
	} );

	const { data: recentSites } = useQuery( {
		...userPreferenceQuery( 'recentSites' ),
		enabled: hydrated,
	} );

	const siteId = recentSites?.[ 0 ] || user?.primary_blog;

	const { data: site = null } = useQuery( {
		...siteByIdQuery( siteId ?? 0 ),
		enabled: hydrated && !! siteId,
	} );

	const onToggleMenu = useCallback( () => events.mobileMenu.emit(), [ events ] );
	const onToggleNotifications = useCallback( () => events.notifications.emit(), [ events ] );

	// First render must mirror SSR props exactly. After hydration, render with
	// fresh data and wire up the toggle callbacks.
	if ( ! hydrated ) {
		return (
			<InterimOmnibar
				user={ initialUser }
				site={ null }
				currentRoute={ window.location.pathname }
			/>
		);
	}

	return (
		<InterimOmnibar
			user={ user ?? null }
			site={ site }
			currentRoute={ window.location.pathname }
			onToggleMenu={ onToggleMenu }
			onToggleNotifications={ onToggleNotifications }
		/>
	);
}

export function InterimOmnibarContainer( props: InterimOmnibarContainerProps ) {
	return (
		<QueryClientProvider client={ queryClient }>
			<InterimOmnibarDataProvider { ...props } />
		</QueryClientProvider>
	);
}
