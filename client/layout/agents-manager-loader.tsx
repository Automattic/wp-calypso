import { useSelector } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { isSiteSection } from 'calypso/state/ui/selectors';
import { useHelpCenterSite } from './use-help-center-site';

const importAgentsManager = () =>
	import(
		/* webpackChunkName: "async-load-automattic-agents-manager" */ '@automattic/agents-manager'
	);

export default function AgentsManagerLoader( { sectionName }: { sectionName: string } ) {
	const user = useSelector( getCurrentUser );
	const isSiteSpecific = useSelector( isSiteSection );
	const { selectedSite, site } = useHelpCenterSite();

	return (
		<AsyncLoad
			require={ importAgentsManager }
			placeholder={ null }
			currentUser={ user }
			sectionName={ sectionName }
			site={ site }
			currentSiteId={ isSiteSpecific ? selectedSite?.ID : undefined }
		/>
	);
}
