import { SiteDetails } from '@automattic/data-stores';
import { DomainsTableStatusCell } from '@automattic/domains-table/src/domains-table/domains-table-status-cell';
import { resolveDomainStatus } from '@automattic/domains-table/src/utils/resolve-domain-status';
import { useTranslate } from 'i18n-calypso';
import { DomainData } from '../types';
import { useDomainsDataViewsContext } from '../use-context';

interface Props {
	domain: DomainData;
}

const DomainStatusField = ( { domain }: Props ) => {
	const { sites, domainResults, updatingDomain, domainStatusPurchaseActions } =
		useDomainsDataViewsContext();
	const translate = useTranslate();

	const site =
		sites[ domain.processed.blogId ] && ( sites[ domain.processed.blogId ] as SiteDetails );
	const pendingUpdates = domainResults.get( domain.processed.domain ) ?? [];

	if ( domain.processed.domain === updatingDomain?.domain && updatingDomain?.message ) {
		pendingUpdates.unshift( {
			created_at: updatingDomain?.created_at,
			message: updatingDomain?.message,
			status: '',
		} );
	}

	const domainStatus = domain
		? resolveDomainStatus( domain.processed, {
				siteSlug: domain.original.site_slug,
				translate,
				getMappingErrors: true,
				currentRoute: window.location.pathname,
				isPurchasedDomain: domainStatusPurchaseActions?.isPurchasedDomain?.( domain.processed ),
				isCreditCardExpiring: domainStatusPurchaseActions?.isCreditCardExpiring?.(
					domain.processed
				),
				onRenewNowClick: () =>
					domainStatusPurchaseActions?.onRenewNowClick?.(
						domain.original.site_slug ?? '',
						domain.processed
					),
				monthsUtilCreditCardExpires: domainStatusPurchaseActions?.monthsUtilCreditCardExpires?.(
					domain.processed
				),
				isVipSite: site?.is_vip,
		  } )
		: null;

	return (
		<DomainsTableStatusCell
			domainStatus={ domainStatus }
			pendingUpdates={ pendingUpdates }
			as="div"
		/>
	);
};

export { DomainStatusField };
