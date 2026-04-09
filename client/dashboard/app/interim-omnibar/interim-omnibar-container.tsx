import { queryClient, siteByIdQuery, userPreferenceQuery } from '@automattic/api-queries';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
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
 * output exactly (`user = initialUser`, `site = null`, no callbacks) so
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

	const { data: user } = useQuery( {
		queryKey: AUTH_QUERY_KEY,
		queryFn: initializeCurrentUser,
		initialData: initialUser ?? undefined,
		enabled: hydrated,
	} );

	const { data: recentSites, isLoading: isRecentSitesLoading } = useQuery( {
		...userPreferenceQuery( 'recentSites' ),
		enabled: hydrated,
	} );

	const siteId = recentSites?.[ 0 ] || user?.primary_blog;

	const { data: site = null } = useQuery( {
		...siteByIdQuery( siteId ?? 0 ),
		enabled: hydrated && !! siteId && ! isRecentSitesLoading,
	} );

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

function InterimOmnibarDataProvider( props: InterimOmnibarContainerProps ) {
	const data = useInterimOmnibarData( props );
	return <InterimOmnibar { ...data } />;
}

export function InterimOmnibarContainer( props: InterimOmnibarContainerProps ) {
	return (
		<QueryClientProvider client={ queryClient }>
			<InterimOmnibarDataProvider { ...props } />
		</QueryClientProvider>
	);
}
