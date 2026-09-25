import { omnibarAgentsManagerEnabledQuery, queryClient } from '@automattic/api-queries';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { isSiteSection } from 'calypso/state/ui/selectors';
import { useHelpCenterSite } from './use-help-center-site';
import useSectionAgentProvider, { getSectionAgentProviderKey } from './use-section-agent-provider';

const importAgentsManager = () =>
	import(
		/* webpackChunkName: "async-load-automattic-agents-manager" */ '@automattic/agents-manager'
	);

export default function AgentsManagerLoader( {
	sectionName,
	isInternalOnly = false,
}: {
	sectionName: string;
	isInternalOnly?: boolean;
} ) {
	const user = useSelector( getCurrentUser );
	const isSiteSpecific = useSelector( isSiteSection );
	const { selectedSite, site } = useHelpCenterSite();
	const isPlugins = sectionName === 'plugins';
	const isReady = useSectionAgentProvider( sectionName, !! user );

	useEffect( () => {
		const { queryKey } = omnibarAgentsManagerEnabledQuery();
		queryClient.cancelQueries( { queryKey } );
		queryClient.setQueryData( queryKey, isReady );

		return () => {
			queryClient.setQueryData( queryKey, false );
		};
	}, [ isReady ] );

	if ( ! isReady ) {
		return null;
	}

	return (
		<AsyncLoad
			key={ getSectionAgentProviderKey( sectionName ) }
			require={ importAgentsManager }
			placeholder={ null }
			currentUser={ user }
			sectionName={ sectionName }
			site={ isPlugins ? ( selectedSite ?? null ) : site }
			currentSiteId={ isPlugins || isSiteSpecific ? selectedSite?.ID : undefined }
			isInternalOnly={ isInternalOnly }
		/>
	);
}
