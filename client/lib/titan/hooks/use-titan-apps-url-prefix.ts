import { getTitanAppsUrlPrefix } from 'calypso/lib/titan/get-titan-urls';
import useFirstTitanDomainForCurrentSite from 'calypso/lib/titan/hooks/use-first-titan-domain-for-current-site';

export default function useTitanAppsUrlPrefix(): string {
	const firstTitanDomain = useFirstTitanDomainForCurrentSite();
	return getTitanAppsUrlPrefix( firstTitanDomain );
}
