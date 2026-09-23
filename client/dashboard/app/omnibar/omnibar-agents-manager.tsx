import {
	omnibarAgentsManagerEnabledQuery,
	omnibarSiteIdQuery,
	siteByIdQuery,
} from '@automattic/api-queries';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { lazy, Suspense, useEffect } from 'react';
import useShouldLoadAgentsManager from '../agents-manager/use-should-load-agents-manager';
import { useAuth } from '../auth';

const AgentsManager = lazy(
	() =>
		import(
			/* webpackChunkName: "async-load-automattic-agents-manager" */ '@automattic/agents-manager'
		)
);

export default function OmnibarAgentsManager( { pathname }: { pathname: string } ) {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const { data: siteId } = useQuery( omnibarSiteIdQuery() );
	const { data: site } = useQuery( {
		...siteByIdQuery( siteId ?? 0 ),
		enabled: !! siteId,
	} );
	const { routeIsEnabled, isInternalOnly } = useShouldLoadAgentsManager( pathname, siteId );

	useEffect( () => {
		queryClient.cancelQueries( { queryKey: omnibarAgentsManagerEnabledQuery().queryKey } );
		queryClient.setQueryData( omnibarAgentsManagerEnabledQuery().queryKey, routeIsEnabled );
	}, [ queryClient, routeIsEnabled ] );

	if ( ! routeIsEnabled || ! siteId || ! site ) {
		return null;
	}

	return (
		<Suspense fallback={ null }>
			<AgentsManager
				currentUser={ user }
				sectionName="dashboard"
				site={ { ID: site.ID, domain: site.slug, URL: site.URL } }
				currentSiteId={ siteId }
				currentRoute={ pathname }
				isInternalOnly={ isInternalOnly }
			/>
		</Suspense>
	);
}
