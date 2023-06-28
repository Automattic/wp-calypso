import QueryJetpackPartnerPortalPartner from 'calypso/components/data/query-jetpack-partner-portal-partner';
import PluginsOverview from 'calypso/jetpack-cloud/sections/plugin-management/plugins-overview';

export default function AgencyPlugins( props ) {
	const { filter, search, site } = props;

	return (
		<>
			<QueryJetpackPartnerPortalPartner />
			<PluginsOverview
				filter={ filter === 'manage' ? 'all' : filter }
				search={ search }
				site={ site }
			/>
		</>
	);
}
