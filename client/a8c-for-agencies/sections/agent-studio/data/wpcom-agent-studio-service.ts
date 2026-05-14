import wpcom from 'calypso/lib/wp';
import type {
	AgentStudioOutput,
	AgentStudioProject,
	AgentStudioProjectSummary,
	AgentStudioService,
	CreateAgentStudioProjectInput,
} from '../types';

type WpRestError = { data?: { status?: number } };

const isNotFoundError = ( error: unknown ): boolean =>
	( error as WpRestError )?.data?.status === 404;

export function createWpcomAgentStudioService( agencyId: number ): AgentStudioService {
	const basePath = ( rest = '' ) => `/agency/${ agencyId }/a4a/projects${ rest }`;

	return {
		async listProjects() {
			const response: { projects: AgentStudioProjectSummary[] } = await wpcom.req.get( {
				apiNamespace: 'wpcom/v2',
				path: basePath(),
			} );

			return response?.projects ?? [];
		},

		async getProject( projectId ) {
			try {
				return ( await wpcom.req.get( {
					apiNamespace: 'wpcom/v2',
					path: basePath( `/${ projectId }` ),
				} ) ) as AgentStudioProject;
			} catch ( error ) {
				if ( isNotFoundError( error ) ) {
					return undefined;
				}
				throw error;
			}
		},

		async createProject( input: CreateAgentStudioProjectInput ) {
			return ( await wpcom.req.post(
				{
					apiNamespace: 'wpcom/v2',
					path: basePath(),
				},
				{
					name: input.name,
					clientName: input.clientName,
					brief: input.brief,
				}
			) ) as AgentStudioProject;
		},

		async deleteProject( projectId ) {
			await wpcom.req.post( {
				method: 'DELETE',
				apiNamespace: 'wpcom/v2',
				path: basePath( `/${ projectId }` ),
			} );
		},

		async listProjectOutputs( projectId ) {
			const response: { outputs: AgentStudioOutput[] } = await wpcom.req.get( {
				apiNamespace: 'wpcom/v2',
				path: basePath( `/${ projectId }/outputs` ),
			} );

			return response?.outputs ?? [];
		},
	};
}
