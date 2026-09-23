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
	const isSiteSpecific = useRouterState( {
		select: ( state ) =>
			state.matches.some( ( match ) => !! ( match.params as { siteSlug?: string } )?.siteSlug ),
	} );

	if ( ! shouldUseUnifiedAgent ) {
		return null;
	}

	const agentsManagerSite = site ? { ID: site.ID, domain: site.slug } : null;

	return (
		<Suspense fallback={ null }>
			<AsyncAgentsManager
				currentUser={ user }
				sectionName="dashboard"
				site={ agentsManagerSite }
				currentSiteId={ isSiteSpecific ? site?.ID : undefined }
			/>
		</Suspense>
	);
}
