import { isTestModeEnvironment } from '@automattic/zendesk-client';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { handleSupportInteractionsFetch } from '../data/handle-support-interactions-fetch';
import {
	getOpenLiveInteractions,
	type InteractionStatusByUuid,
} from '../utils/get-open-live-interactions';
import type { SupportInteraction } from '../types';

/**
 * Subscribes to the cached SupportInteraction list in TanStack Query and returns a
 * Map<supportInteractionId, status> for use by the open-conversation helpers.
 *
 * Uses `useQuery` (instead of `queryClient.getQueryData`) so the hook re-renders when
 * the cache entry is updated by other queries/mutations.
 * Returns an empty Map when the query hasn't populated yet — callers fall back to
 * the Smooch heuristic in that case.
 */
export function useOpenInteractionStatusMap(): InteractionStatusByUuid {
	const isTestMode = isTestModeEnvironment();

	const { data: interactions } = useQuery< SupportInteraction[] >( {
		queryKey: [ 'support-interactions', 'get-interactions', isTestMode ],
		queryFn: () => handleSupportInteractionsFetch( 'GET', '?per_page=100&page=1', isTestMode ),
		enabled: false,
	} );

	return useMemo( () => {
		const map: InteractionStatusByUuid = new Map();
		if ( ! interactions ) {
			return map;
		}
		for ( const interaction of interactions ) {
			map.set( interaction.uuid, interaction.status );
		}
		return map;
	}, [ interactions ] );
}

/**
 * Render-time snapshot of open live conversations, cross-checked against the cached
 * SupportInteraction status. Reads the Smooch conversation list once per render and
 * derives `mostRecentSupportInteractionId`, `hasReachedLimit`, and `openCount` from that single snapshot.
 *
 * Note: the returned values are a snapshot of Smooch state at render time. Smooch can
 * mutate its conversation list outside React (e.g. on incoming messages) without
 * triggering a re-render, so callbacks that need up-to-the-millisecond accuracy should
 * call `getOpenLiveInteractions()` directly at the moment of action rather than capture
 * these values in a closure.
 */
export function useOpenLiveInteractions( excludeInteractionId?: string | null ): {
	mostRecentSupportInteractionId: string | null;
	hasReachedLimit: boolean;
	openCount: number;
} {
	const statusMap = useOpenInteractionStatusMap();
	return getOpenLiveInteractions( statusMap, excludeInteractionId );
}
