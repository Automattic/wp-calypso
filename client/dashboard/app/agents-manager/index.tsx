import { omnibarSiteIdQuery, siteByIdQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';

const AgentsManager = lazy(
	() =>
		import(
			/* webpackChunkName: "async-load-dashboard-agents-manager" */ '@automattic/agents-manager'
		)
);

export default function DashboardAgentsManager( { pathname }: { pathname: string } ) {
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
				currentUser={ window.currentUser }
				sectionName="dashboard"
				site={ { ID: site.ID, domain: site.slug, URL: site.URL } }
				currentSiteId={ siteId }
				currentRoute={ pathname }
			/>
		</Suspense>
	);
}
