import { LoadingPlaceholder } from '@automattic/components';
import { PartialDomainData, SiteDetails } from '@automattic/data-stores';
import { DomainsTableStatusCell } from '@automattic/domains-table/src/domains-table/domains-table-status-cell';
import { resolveDomainStatus } from '@automattic/domains-table/src/utils/resolve-domain-status';
import { useTranslate } from 'i18n-calypso';
import { useDomainsDataViewsContext } from '../use-context';

interface Props {
	domain: PartialDomainData;
}

const DomainStatusField = ( props: Props ) => {
	const {
		sites,
		isLoadingSites,
		getSiteSlug,
		getFullDomain,
		domainResults,
		updatingDomain,
		domainStatusPurchaseActions,
	} = useDomainsDataViewsContext();
	const translate = useTranslate();

	const domain = getFullDomain( props.domain );
	if ( ! domain || isLoadingSites ) {
		return <LoadingPlaceholder />;
	}

	const siteSlug = getSiteSlug( props.domain );

	const site = sites[ domain.blogId ] && ( sites[ domain.blogId ] as SiteDetails );
	const pendingUpdates = domainResults.get( domain.domain ) ?? [];

	if ( domain.domain === updatingDomain?.domain && updatingDomain?.message ) {
		pendingUpdates.unshift( {
			created_at: updatingDomain?.created_at,
			message: updatingDomain?.message,
			status: '',
		} );
	}

	const domainStatus = domain
		? resolveDomainStatus( domain, {
				siteSlug: siteSlug,
				translate,
				getMappingErrors: true,
				currentRoute: window.location.pathname,
				isPurchasedDomain: domainStatusPurchaseActions?.isPurchasedDomain?.( domain ),
				isCreditCardExpiring: domainStatusPurchaseActions?.isCreditCardExpiring?.( domain ),
				onRenewNowClick: () =>
					domainStatusPurchaseActions?.onRenewNowClick?.( siteSlug ?? '', domain ),
				monthsUtilCreditCardExpires:
					domainStatusPurchaseActions?.monthsUtilCreditCardExpires?.( domain ),
				isVipSite: site?.is_vip,
		  } )
		: null;

	return (
		<DomainsTableStatusCell
			domainStatus={ domainStatus }
			pendingUpdates={ pendingUpdates }
			as="div"
			spinnerSize={ 14 }
		/>
	);
};

export { DomainStatusField };
