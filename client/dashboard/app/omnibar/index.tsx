import {
	queryClient,
	dashboardAdminBarQuery,
	omnibarSiteIdQuery,
	siteAdminBarQuery,
	siteByIdQuery,
} from '@automattic/api-queries';
import { Omnibar, buildOmnibarNodesFromAdminBarNodes } from '@automattic/omnibar';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { hydrateRoot } from 'react-dom/client';
import SiteIcon from '../../components/site-icon';
import { getSiteDisplayName } from '../../utils/site-name';
import { OmnibarHomeIcon } from './home';

function OmnibarContainer() {
	const { data: siteId } = useQuery( omnibarSiteIdQuery() );
	const { data: site } = useQuery( {
		...siteByIdQuery( siteId ?? 0 ),
		enabled: !! siteId,
	} );

	const { data: { nodes: dashboardNodes } = {} } = useQuery( dashboardAdminBarQuery() );
	const { data: { nodes: siteNodes } = {} } = useQuery( {
		...siteAdminBarQuery( siteId ?? 0 ),
		enabled: !! siteId,
	} );

	const omnibarNodes = useMemo( () => {
		const nodes = siteNodes ?? dashboardNodes ?? [];
		const result = buildOmnibarNodesFromAdminBarNodes( nodes );

		if ( result.home ) {
			result.home.icon = <OmnibarHomeIcon />;
		}

		if ( site ) {
			if ( ! result.site ) {
				result.site = {
					id: 'site-name',
					title: '',
					children: [],
				};
			}

			result.site.icon = <SiteIcon site={ site } size={ 20 } />;
			result.site.title = getSiteDisplayName( site );
		}

		return result;
	}, [ dashboardNodes, siteNodes, site ] );
	return <Omnibar nodes={ omnibarNodes } />;
}

export default function loadOmnibar() {
	const container = document.getElementById( 'wpcom-omnibar' );
	if ( ! container ) {
		return;
	}

	hydrateRoot(
		container,
		<QueryClientProvider client={ queryClient }>
			<OmnibarContainer />
		</QueryClientProvider>
	);
}
