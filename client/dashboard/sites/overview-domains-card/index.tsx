import { DomainSubtype } from '@automattic/api-core';
import { domainsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { isTransferrableToWpcom } from '../../utils/domain-types';
import { isSelfHostedJetpackConnected } from '../../utils/site-types';
import DomainTransferUpsellCard from '../overview-domain-transfer-upsell-card';
import DomainUpsellCard from '../overview-domain-upsell-card';
import type { Site } from '@automattic/api-core';

export default function DomainsCard( { site }: { site: Site } ) {
	const { data: siteDomains } = useQuery( {
		...domainsQuery(),
		select: ( data ) => {
			return data.filter( ( domain ) => domain.blog_id === site.ID );
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

	if ( ! siteDomains.find( ( domain ) => domain.subtype.id !== DomainSubtype.DEFAULT_ADDRESS ) ) {
		return <DomainUpsellCard site={ site } />;
	}

	return null;
}
