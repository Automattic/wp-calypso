import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { getPlatformName, getSourceHost, toSourceUrl } from './utils';

export const useStaticSiteImportSource = () => {
	const query = useQuery();
	const from = query.get( 'from' ) ?? '';

	return {
		from,
		sourceUrl: toSourceUrl( from ),
		host: getSourceHost( from ),
		platformName: getPlatformName( query.get( 'platform' ) ),
	};
};
