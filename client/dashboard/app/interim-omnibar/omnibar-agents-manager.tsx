import { useShouldUseUnifiedAgent } from '@automattic/agents-manager';
import { omnibarSiteIdQuery, siteByIdQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useRouterState } from '@tanstack/react-router';
import { Suspense, lazy } from 'react';
import { useAuth } from '../auth';

const AsyncAgentsManager = lazy(
	() =>
		import(
			/* webpackChunkName: "async-load-automattic-agents-manager" */ '@automattic/agents-manager'
		)
);

/**
 * Derive a section name from a TanStack Router `routeId`. The agent uses the
 * section name to scope its context, so we want the coarse area of the
 * product (e.g. `domains`, `emails`, `settings`) — not the full leaf path.
 *
 * For routes nested under `/sites/$siteSlug/...` we strip the prefix so a
 * site-scoped route (e.g. `/sites/$siteSlug/domains`) reports the same
 * section as the equivalent top-level route (`/domains`).
 */
function deriveSectionName( routeId: string | undefined ): string {
	if ( ! routeId ) {
		return 'dashboard';
	}
	const segments = routeId.split( '/' ).filter( Boolean );
	if ( segments.length === 0 ) {
		return 'dashboard';
	}
	if ( segments[ 0 ] === 'sites' && segments.length >= 3 ) {
		return segments[ 2 ];
	}
	return segments[ 0 ];
}

/**
 * Renders the unified Big Sky chat experience when the current user has opted
 * into "Enable the unified AI chat experience in Help Center" on
 * /wp-admin/profile.php. The eligibility check goes through the same
 * `/wpcom/v2/agents-manager/state` endpoint used elsewhere in Calypso, so the
 * toggle stays consistent across /wp-admin, wordpress.com, and MSD.
 *
 * When not eligible, this renders nothing and the legacy `OmnibarHelpCenter`
 * handles the chat surface. When eligible, the legacy help center suppresses
 * itself inside `@automattic/help-center`, so only Big Sky is visible.
 */
export default function OmnibarAgentsManager() {
	const shouldUseUnifiedAgent = useShouldUseUnifiedAgent();
	const { user } = useAuth();
	const { data: omnibarSiteId } = useQuery( omnibarSiteIdQuery() );
	const { data: site } = useQuery( {
		...siteByIdQuery( omnibarSiteId ?? 0 ),
		enabled: !! omnibarSiteId,
	} );
	const { isSiteSpecific, sectionName } = useRouterState( {
		select: ( state ) => ( {
			isSiteSpecific: state.matches.some(
				( match ) => !! ( match.params as { siteSlug?: string } )?.siteSlug
			),
			sectionName: deriveSectionName( state.matches.at( -1 )?.routeId ),
		} ),
	} );

	if ( ! shouldUseUnifiedAgent ) {
		return null;
	}

	const agentsManagerSite = site ? { ID: site.ID, domain: site.slug } : null;

	return (
		<Suspense fallback={ null }>
			<AsyncAgentsManager
				currentUser={ user }
				sectionName={ sectionName }
				site={ agentsManagerSite }
				currentSiteId={ isSiteSpecific ? site?.ID : undefined }
			/>
		</Suspense>
	);
}
