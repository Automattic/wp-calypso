import {
	A4A_AGENT_STUDIO_LINK,
	A4A_AGENT_STUDIO_PROJECTS_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';

export const getAgentStudioProjectPath = ( projectId: string ) =>
	`${ A4A_AGENT_STUDIO_PROJECTS_LINK }/${ projectId }`;

export const getAgentStudioPath = () => A4A_AGENT_STUDIO_LINK;
