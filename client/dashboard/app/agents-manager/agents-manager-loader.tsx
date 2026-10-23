import {
	omnibarAgentsManagerEnabledQuery,
	omnibarSiteIdQuery,
	siteByIdQuery,
} from '@automattic/api-queries';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { lazy, Suspense, useEffect } from 'react';
import { useAuth } from '../auth';
import { useAppContext } from '../context';
import { useCanShowAiChatNode } from '../omnibar/node-ai-chat-can-show';
import useShouldLoadAgentsManager from './use-should-load-agents-manager';

const AgentsManager = lazy(
	() =>
		import(
			/* webpackChunkName: "async-load-automattic-agents-manager" */ '@automattic/agents-manager'
		)
);

export default function AgentsManagerLoader( { pathname }: { pathname: string } ) {
	const { user } = useAuth();
	const { components } = useAppContext();
	const canShowAiChatNode = useCanShowAiChatNode();
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
				// A variant's own omnibar has no AI chat button.
				hasMasterbarAiChatButton={ ! components.omnibar && canShowAiChatNode }
			/>
		</Suspense>
	);
}
