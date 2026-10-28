import {
	omnibarAgentsManagerEnabledQuery,
	omnibarSiteIdQuery,
	siteByIdQuery,
} from '@automattic/api-queries';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { lazy, Suspense, useEffect } from 'react';
import { useAuth } from '../auth';
import { useAppContext } from '../context';
import { useCanShowAiChatNode } from '../omnibar/ai-chat-node/can-show';
import useShouldLoadAgentsManager from './use-should-load-agents-manager';

// Only these pages load a site; every other page has none.
const SITE_PAGE_ROUTE = /^\/sites\/[^/]+/;

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

	// A site page needs its site ID, so the omnibar must not offer the chat before then.
	const isSitePage = SITE_PAGE_ROUTE.test( pathname );
	const isChatEnabled = routeIsEnabled && ( ! isSitePage || !! siteId );
	const chatSite = isSitePage ? site : undefined;

	useEffect( () => {
		queryClient.cancelQueries( { queryKey: omnibarAgentsManagerEnabledQuery().queryKey } );
		queryClient.setQueryData( omnibarAgentsManagerEnabledQuery().queryKey, isChatEnabled );
	}, [ queryClient, isChatEnabled ] );

	if ( ! isChatEnabled || ( isSitePage && ! chatSite ) ) {
		return null;
	}

	return (
		<Suspense fallback={ null }>
			<AgentsManager
				currentUser={ user }
				sectionName="dashboard"
				site={ chatSite ? { ID: chatSite.ID, domain: chatSite.slug, URL: chatSite.URL } : null }
				currentSiteId={ chatSite?.ID }
				currentRoute={ pathname }
				isInternalOnly={ isInternalOnly }
				// A variant's own omnibar has no AI chat button.
				hasMasterbarAiChatButton={ ! components.omnibar && canShowAiChatNode }
			/>
		</Suspense>
	);
}
