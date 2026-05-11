import { isTestModeEnvironment } from '@automattic/zendesk-client';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import getMostRecentOpenLiveInteraction, {
	getOpenLiveInteractionCount,
	hasReachedConversationLimit,
} from './get-most-recent-open-live-interaction';
import type { InteractionStatusByUuid } from './get-most-recent-open-live-interaction';
import type { SupportInteraction } from '../../types';

/**
 * Reads the cached SupportInteraction list from TanStack Query and returns a
 * Map<supportInteractionId, status> for use by getMostRecentOpenLiveInteraction
 * and friends. Returns an empty Map when the query hasn't populated yet — callers
 * fall back to the Smooch heuristic in that case.
 */
export function useOpenInteractionStatusMap(): InteractionStatusByUuid {
	const queryClient = useQueryClient();
	const isTestMode = isTestModeEnvironment();

	const interactions = queryClient.getQueryData< SupportInteraction[] >( [
		'support-interactions',
		'get-interactions',
		isTestMode,
	] );

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
 * Render-time snapshot of open live conversations, cross-checked against the
 * cached SupportInteraction status. Use this in components/hooks; the returned
 * values are safe to read directly or capture in callbacks (closure semantics).
 */
export function useOpenLiveInteractions(): {
	mostRecentId: string | null;
	hasReachedLimit: boolean;
	openCount: number;
} {
	const statusMap = useOpenInteractionStatusMap();
	return {
		mostRecentId: getMostRecentOpenLiveInteraction( statusMap ),
		hasReachedLimit: hasReachedConversationLimit( statusMap ),
		openCount: getOpenLiveInteractionCount( statusMap ),
	};
}
