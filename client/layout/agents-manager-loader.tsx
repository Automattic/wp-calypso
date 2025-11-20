import { useSelector } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import getPrimarySiteSlug from 'calypso/state/selectors/get-primary-site-slug';
import { getSiteBySlug } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

type Props = {
	sectionName: string;
	loadAgentsManager: boolean;
	currentRoute: string;
};

export default function AgentsManagerLoader( {
	sectionName,
	loadAgentsManager,
	currentRoute,
}: Props ) {
	const user = useSelector( getCurrentUser );
	const selectedSite = useSelector( getSelectedSite );
	const primarySiteSlug = useSelector( getPrimarySiteSlug );
	const primarySite = useSelector( ( state ) => getSiteBySlug( state, primarySiteSlug ) );

	if ( ! loadAgentsManager ) {
		return null;
	}

	return (
		<AsyncLoad
			require="@automattic/agents-manager"
			placeholder={ null }
			currentRoute={ currentRoute }
			sectionName={ sectionName }
			site={ selectedSite || primarySite }
			currentUser={ user }
		/>
	);
}
