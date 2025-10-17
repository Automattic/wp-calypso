import { siteDomainsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { isTransferrableToWpcom } from '../../utils/domain-types';
import { isSelfHostedJetpackConnected } from '../../utils/site-types';
import DomainTransferUpsellCard from '../overview-domain-transfer-upsell-card';
import DomainUpsellCard from '../overview-domain-upsell-card';
import type { Site } from '@automattic/api-core';

export default function DomainsCard( { site }: { site: Site } ) {
	const { data: siteDomains } = useQuery( {
		...siteDomainsQuery( site.ID ),
		select: ( data ) => {
			// If the site has *.wpcomstaging.com domain, exclude *.wordpress.com
			if ( data && data.find( ( domain ) => domain.is_wpcom_staging_domain ) ) {
				return data.filter( ( domain ) => ! domain.wpcom_domain || domain.is_wpcom_staging_domain );
			}

			return data;
		},
	} );

	if ( site.is_wpcom_staging_site ) {
		return null;
	}

	if ( ! siteDomains ) {
		return null;
	}

	if (
		isSelfHostedJetpackConnected( site ) &&
		siteDomains.find( ( domain ) => isTransferrableToWpcom( domain ) )
	) {
		return <DomainTransferUpsellCard />;
	}

	if ( ! siteDomains.find( ( domain ) => ! domain.wpcom_domain ) ) {
		return <DomainUpsellCard site={ site } />;
	}

	return null;
}
