/**
 * Resolves "the default project id" for the current agency: returns
 * the existing default if one exists, creates one otherwise.
 *
 * PR #1 doesn't ship the project UI — the overview / project-detail
 * pages still use mocked projects. But every run we fire wants a real
 * `project_id` stamped on it, so when PR #2 swaps in the real project
 * UI the run history is already associated. This hook is the bridge.
 *
 * Resolution rules:
 *   - If any project has `is_default: true`, use it.
 *   - Otherwise, if any project exists, use the most-recently-updated.
 *   - Otherwise, create a new project named "Default project".
 *
 * The mutation is cached for the React Query session so a fast brief
 * submission doesn't fire multiple create-project calls in parallel.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

interface ProjectsListResponse {
	projects: ProjectSummary[];
}

interface ProjectSummary {
	id: number;
	name: string;
	is_default?: boolean;
	updated_at?: string;
}

interface CreateProjectResponse {
	id: number;
	name: string;
}

const DEFAULT_PROJECT_NAME = 'Default project';

const findExistingDefault = ( projects: ProjectSummary[] ): number | undefined => {
	const flagged = projects.find( ( project ) => project.is_default );
	if ( flagged ) {
		return flagged.id;
	}
	if ( projects.length === 0 ) {
		return undefined;
	}
	const sorted = [ ...projects ].sort( ( a, b ) =>
		( b.updated_at ?? '' ).localeCompare( a.updated_at ?? '' )
	);
	return sorted[ 0 ]?.id;
};

const resolveDefaultProjectId = async ( agencyId: number ): Promise< number > => {
	const list: ProjectsListResponse = await wpcom.req.get( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/a4a/projects`,
	} );
	const existing = findExistingDefault( list?.projects ?? [] );
	if ( existing ) {
		return existing;
	}
	const created: CreateProjectResponse = await wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/a4a/projects`,
		body: { name: DEFAULT_PROJECT_NAME },
	} );
	return created.id;
};

const DEFAULT_PROJECT_CACHE_KEY = [ 'a4a-agent-studio-default-project' ];

export default function useResolveDefaultProject() {
	const agencyId = useSelector( getActiveAgencyId );
	const queryClient = useQueryClient();

	return useMutation< number, Error, void >( {
		mutationKey: DEFAULT_PROJECT_CACHE_KEY,
		mutationFn: async () => {
			if ( ! agencyId ) {
				throw new Error( 'useResolveDefaultProject: missing agencyId' );
			}
			// Cache the resolved id under a stable query key so subsequent
			// brief submissions in the same session don't re-fetch /
			// re-create.
			const cached = queryClient.getQueryData< number >( [
				'a4a-agent-studio-default-project',
				agencyId,
			] );
			if ( cached ) {
				return cached;
			}
			const id = await resolveDefaultProjectId( agencyId );
			queryClient.setQueryData( [ 'a4a-agent-studio-default-project', agencyId ], id );
			return id;
		},
	} );
}
