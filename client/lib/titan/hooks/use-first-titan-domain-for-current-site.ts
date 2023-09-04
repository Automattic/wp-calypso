import { hasTitanMailWithUs } from 'calypso/lib/titan';
import useSiteDomains from 'calypso/my-sites/checkout/src/hooks/use-site-domains';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { ResponseDomain } from 'calypso/lib/domains/types';

export default function useFirstTitanDomainForCurrentSite(): ResponseDomain | undefined {
	const siteId = useSelector( getSelectedSiteId );
	const siteDomains = useSiteDomains( siteId ?? undefined );
	return siteDomains.find( hasTitanMailWithUs );
}
