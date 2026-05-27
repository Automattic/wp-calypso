import { omnibarSiteIdQuery, queryClient, siteByIdQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { AUTH_QUERY_KEY, initializeCurrentUser } from '../auth';
import { InterimOmnibar } from './interim-omnibar';
import type { OmnibarEvents } from '../omnibar/events';
import type { Site, User } from '@automattic/api-core';

// The interim omnibar lives in its own React tree (hydrated into
// `#wpcom-omnibar`), so it can't read TanStack Router state. Patch
// `history.pushState`/`replaceState` once to dispatch a synthetic event we can
// subscribe to alongside `popstate`; that gives us a reactive pathname without
// any router coupling. The patch is idempotent across hot-reloads.
const PATH_CHANGE_EVENT = 'omnibar:pathchange';

function patchHistory() {
	if (
		typeof window === 'undefined' ||
		( window as unknown as { __omnibarPathPatched?: boolean } ).__omnibarPathPatched
	) {
		return;
	}
	( window as unknown as { __omnibarPathPatched: boolean } ).__omnibarPathPatched = true;
	( [ 'pushState', 'replaceState' ] as const ).forEach( ( name ) => {
		const original = window.history[ name ];
		window.history[ name ] = function ( ...args: Parameters< typeof original > ) {
			const result = original.apply( this, args );
			window.dispatchEvent( new Event( PATH_CHANGE_EVENT ) );
			return result;
		};
	} );
}

function subscribePathname( callback: () => void ) {
	patchHistory();
	window.addEventListener( 'popstate', callback );
	window.addEventListener( PATH_CHANGE_EVENT, callback );
	return () => {
		window.removeEventListener( 'popstate', callback );
		window.removeEventListener( PATH_CHANGE_EVENT, callback );
	};
}

const getPathname = () => window.location.pathname;

interface InterimOmnibarContainerProps {
	initialUser: User | null;
	// Pathname at the time `hydrateRoot` is called — matches the value the
	// server passed as `currentRoute`. Required by `useSyncExternalStore` so
	// the hydration snapshot lines up with the server-rendered output.
	initialPathname: string;
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
	initialPathname,
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

	const { data: currentSiteId } = useQuery(
		{
			...omnibarSiteIdQuery(),
			enabled: hydrated,
		},
		queryClient
	);

	const { data: site = null } = useQuery(
		{
			...siteByIdQuery( currentSiteId ?? 0 ),
			enabled: hydrated && !! currentSiteId,
		},
		queryClient
	);

	const onToggleMenu = useCallback( () => events.mobileMenu.emit(), [ events ] );
	const onToggleNotifications = useCallback( () => events.notifications.emit(), [ events ] );

	const currentRoute = useSyncExternalStore(
		subscribePathname,
		getPathname,
		() => initialPathname
	);

	if ( ! hydrated ) {
		return {
			user: initialUser,
			site: null,
			currentRoute,
			onToggleMenu,
			onToggleNotifications,
		};
	}

	return {
		user: user ?? null,
		site,
		currentRoute,
		onToggleMenu,
		onToggleNotifications,
	};
}

export function InterimOmnibarContainer( props: InterimOmnibarContainerProps ) {
	const data = useInterimOmnibarData( props );
	return <InterimOmnibar { ...data } />;
}
