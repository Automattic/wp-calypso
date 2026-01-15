import { useShouldUseUnifiedAgent } from '@automattic/help-center/src/hooks';
import { useSelector } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import getPrimarySiteSlug from 'calypso/state/selectors/get-primary-site-slug';
import { getSiteBySlug } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

export default function AgentsManagerLoader( { sectionName }: { sectionName: string } ) {
	const shouldUseUnifiedAgent = useShouldUseUnifiedAgent();
	const user = useSelector( getCurrentUser );
	const selectedSite = useSelector( getSelectedSite );
	const primarySiteSlug = useSelector( getPrimarySiteSlug );
	const primarySite = useSelector( ( state ) => getSiteBySlug( state, primarySiteSlug ) );

	if ( ! shouldUseUnifiedAgent ) {
		return null;
	}

	return (
		<AsyncLoad
			require="@automattic/agents-manager"
			placeholder={ null }
			currentUser={ user }
			sectionName={ sectionName }
			site={ selectedSite || primarySite }
		/>
	);
}
