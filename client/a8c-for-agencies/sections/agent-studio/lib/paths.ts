import { A4A_AGENT_STUDIO_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';

export const getAgentStudioPath = () => A4A_AGENT_STUDIO_LINK;

export const getAgentStudioBriefPath = ( agentId: string ) =>
	`${ A4A_AGENT_STUDIO_LINK }/agents/${ agentId }/new`;
