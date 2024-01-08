import { useSelector } from 'react-redux';
import { FormState } from 'calypso/components/advanced-credentials/form';
import getJetpackCredentials from 'calypso/state/selectors/get-jetpack-credentials';
import getSiteCredentialsRequestStatus from 'calypso/state/selectors/get-site-credentials-request-status';
import isRequestingSiteCredentials from 'calypso/state/selectors/is-requesting-site-credentials';
import { SiteId } from 'calypso/types';

export function useSiteCredentialsInfo( siteId?: SiteId ) {
	const credentials = useSelector( ( state ) =>
		getJetpackCredentials( state, siteId, 'main' )
	) as FormState & { abspath: string };

	const hasCredentials = credentials && Object.keys( credentials ).length > 0;
	const isRequesting = useSelector( ( state ) =>
		isRequestingSiteCredentials( state, siteId || 0 )
	);
	const siteStatus = useSelector( ( state ) =>
		getSiteCredentialsRequestStatus( state, siteId || 0 )
	);
	const hasLoaded = siteStatus === 'success';

	return {
		credentials,
		hasCredentials,
		isRequesting,
		hasLoaded,
	};
}
