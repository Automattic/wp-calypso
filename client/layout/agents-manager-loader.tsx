import { ORCHESTRATOR_AGENT_ID } from '@automattic/agents-manager/src/constants';
import { useSelector } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import usePluginRecommendationsProvider from 'calypso/my-sites/plugins/use-plugin-recommendations-provider';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { isSiteSection } from 'calypso/state/ui/selectors';
import { useHelpCenterSite } from './use-help-center-site';

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
	const providerReady = usePluginRecommendationsProvider( isPlugins && !! user );

	if ( isPlugins && ( ! user || ! providerReady ) ) {
		return null;
	}

	return (
		<AsyncLoad
			key={ isPlugins ? 'plugins' : 'default' }
			require={ importAgentsManager }
			placeholder={ null }
			agentId={ isPlugins ? ORCHESTRATOR_AGENT_ID : undefined }
			currentUser={ user }
			sectionName={ sectionName }
			site={ isPlugins ? ( selectedSite ?? null ) : site }
			currentSiteId={ isPlugins || isSiteSpecific ? selectedSite?.ID : undefined }
			isInternalOnly={ isInternalOnly }
		/>
	);
}
