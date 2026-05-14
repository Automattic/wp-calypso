import { useMemo } from 'react';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { mockAgentStudioService } from './mock-agent-studio-service';
import { createWpcomAgentStudioService } from './wpcom-agent-studio-service';
import type { AgentStudioService } from '../types';

/**
 * Returns the Agent Studio service bound to the currently active agency.
 *
 * Falls back to the localStorage-backed mock when there is no active agency in
 * context (Storybook, isolated tests, pre-onboarding states). The mock is kept
 * as an offline fallback and will be removed in a follow-up cycle.
 */
export function useAgentStudioService(): AgentStudioService {
	const agencyId = useSelector( getActiveAgencyId );

	return useMemo( () => {
		if ( ! agencyId ) {
			return mockAgentStudioService;
		}
		return createWpcomAgentStudioService( agencyId );
	}, [ agencyId ] );
}
