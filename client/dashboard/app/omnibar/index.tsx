import { queryClient, dashboardAdminBarQuery } from '@automattic/api-queries';
import { Omnibar, buildOmnibarNodesFromAdminBarNodes } from '@automattic/omnibar';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { OmnibarHomeLogo } from './home';

function OmnibarContainer() {
	const { data: { nodes = [] } = {} } = useQuery( dashboardAdminBarQuery() );
	const omnibarNodes = useMemo( () => {
		const result = buildOmnibarNodesFromAdminBarNodes( nodes );
		if ( result.home ) {
			result.home.render = OmnibarHomeLogo;
		}
		return result;
	}, [ nodes ] );
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
