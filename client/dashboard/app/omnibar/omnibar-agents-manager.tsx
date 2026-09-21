import { omnibarSiteIdQuery, siteByIdQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { useAuth } from '../auth';

const AgentsManager = lazy(
	() =>
		import(
			/* webpackChunkName: "async-load-automattic-agents-manager" */ '@automattic/agents-manager'
		)
);

export default function OmnibarAgentsManager( { pathname }: { pathname: string } ) {
	const { user } = useAuth();
	const { data: siteId } = useQuery( omnibarSiteIdQuery() );
	const { data: site } = useQuery( {
		...siteByIdQuery( siteId ?? 0 ),
		enabled: !! siteId,
	} );

	if ( ! siteId || ! site ) {
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
			/>
		</Suspense>
	);
}
