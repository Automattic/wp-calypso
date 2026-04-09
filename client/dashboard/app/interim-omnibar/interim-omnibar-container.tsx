import { queryClient, siteByIdQuery, userPreferenceQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { AUTH_QUERY_KEY, initializeCurrentUser } from '../auth';
import { InterimOmnibar } from './interim-omnibar';
import type { OmnibarEvents } from './click-handlers';
import type { Site, User } from '@automattic/api-core';

interface InterimOmnibarContainerProps {
	initialUser: User | null;
	events: OmnibarEvents;
}

interface InterimOmnibarData {
	user: User | null;
	site: Site | null;
	currentRoute: string;
	onToggleMenu?: () => void;
	onToggleNotifications?: () => void;
}

/**
 * Provides the props for `InterimOmnibar`. The first render mirrors the SSR
 * output exactly (`user = initialUser`, `site = null`) so
 * hydration succeeds; after hydration commits, the hook switches to
 * query-driven data.
 */
function useInterimOmnibarData( {
	initialUser,
	events,
}: InterimOmnibarContainerProps ): InterimOmnibarData {
	const [ hydrated, setHydrated ] = useState( false );
	useEffect( () => {
		setHydrated( true );
	}, [] );

	const { data: user } = useQuery(
		{
			queryKey: AUTH_QUERY_KEY,
			queryFn: initializeCurrentUser,
			initialData: initialUser ?? undefined,
			enabled: hydrated,
		},
		queryClient
	);

	const { data: recentSites, isLoading: isRecentSitesLoading } = useQuery(
		{
			...userPreferenceQuery( 'recentSites' ),
			enabled: hydrated,
		},
		queryClient
	);

	const siteId = recentSites?.[ 0 ] || user?.primary_blog;

	const { data: site = null } = useQuery(
		{
			...siteByIdQuery( siteId ?? 0 ),
			enabled: hydrated && !! siteId && ! isRecentSitesLoading,
		},
		queryClient
	);

	const onToggleMenu = useCallback( () => events.mobileMenu.emit(), [ events ] );
	const onToggleNotifications = useCallback( () => events.notifications.emit(), [ events ] );

	if ( ! hydrated ) {
		return {
			user: initialUser,
			site: null,
			currentRoute: window.location.pathname,
			onToggleMenu,
			onToggleNotifications,
		};
	}

	return {
		user: user ?? null,
		site,
		currentRoute: window.location.pathname,
		onToggleMenu,
		onToggleNotifications,
	};
}

export function InterimOmnibarContainer( props: InterimOmnibarContainerProps ) {
	const data = useInterimOmnibarData( props );
	return <InterimOmnibar { ...data } />;
}
