import { useRouterState } from '@tanstack/react-router';

/**
 * Returns the staticData object of the currently matched route.
 *
 * Example:
 *   const staticData = useRouteStaticData();
 *   if (staticData?.hideHeaders) { ... }
 */
type RouteStaticData = { hideHeaders?: boolean };

export default function useRouteStaticData(): RouteStaticData | undefined {
	const routerState = useRouterState();
	const lastMatch = routerState.matches?.at( -1 ) as { staticData?: unknown } | undefined;
	return lastMatch?.staticData as RouteStaticData | undefined;
}
