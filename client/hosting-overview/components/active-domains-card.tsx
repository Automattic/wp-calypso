import { useSiteDomainsQuery } from '@automattic/data-stores';
import { DomainsTable, ResponseDomain, useDomainsTable } from '@automattic/domains-table';
import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';
import { fetchSiteDomains } from 'calypso/my-sites/domains/domain-management/domains-table-fetch-functions';
import { useSelector, useDispatch } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const ActiveDomainsCard: FC = () => {
	const site = useSelector( getSelectedSite );
	const { data, isLoading, refetch } = useSiteDomainsQuery( site?.ID, {
		queryFn: () => fetchSiteDomains( site?.ID ),
	} );
	const translate = useTranslate();

	return (
		<div>
			<DomainsTable
				isLoadingDomains={ isLoading }
				domains={ data?.domains }
				isAllSitesView={ false }
				siteSlug={ site?.slug ?? null }
				// domainStatusPurchaseActions={ purchaseActions }
				// userCanSetPrimaryDomains={ userCanSetPrimaryDomains }
				// currentUserCanBulkUpdateContactInfo={ ! isInSupportSession }
				// onDomainAction={ ( action, domain ) => { } }
				// footer={ null }
				// fetchAllDomains={ fetchAllDomains }
				// fetchSite={ fetchSite }
				// fetchSiteDomains={ fetchSiteDomains }
				// createBulkAction={ createBulkAction }
				// fetchBulkActionStatus={ fetchBulkActionStatus }
				// deleteBulkActionStatus={ deleteBulkActionStatus }
			/>
		</div>
	);
};

export default ActiveDomainsCard;
