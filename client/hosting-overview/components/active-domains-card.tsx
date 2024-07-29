import { useSiteDomainsQuery } from '@automattic/data-stores';
import { DomainsTable } from '@automattic/domains-table';
import { useBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';
import {
	HostingCard,
	HostingCardHeading,
	HostingCardLinkButton,
} from 'calypso/components/hosting-card';
import { fetchSiteDomains } from 'calypso/my-sites/domains/domain-management/domains-table-fetch-functions';
import { isNotAtomicJetpack } from 'calypso/sites-dashboard/utils';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const ActiveDomainsCard: FC = () => {
	const forceMobile = useBreakpoint( '<660px' );
	const site = useSelector( getSelectedSite );
	const isJetpackNotAtomic = site && isNotAtomicJetpack( site );
	const { data, isLoading } = useSiteDomainsQuery( site?.ID, {
		queryFn: () => fetchSiteDomains( site?.ID ),
	} );
	const translate = useTranslate();

	// Do not render for self hosted jetpack sites, since they cannot manage domains with us.
	if ( isJetpackNotAtomic ) {
		return null;
	}

	return (
		<HostingCard className="hosting-overview__active-domains">
			<HostingCardHeading title={ translate( 'Active domains' ) }>
				<HostingCardLinkButton
					to={ `/domains/add/${ site?.slug }?redirect_to=${ window.location.pathname }` }
					hideOnMobile
				>
					{ translate( 'Add new domain' ) }
				</HostingCardLinkButton>
				<HostingCardLinkButton to={ `/domains/manage/${ site?.slug }` }>
					{ translate( 'Manage domains' ) }
				</HostingCardLinkButton>
			</HostingCardHeading>

			<DomainsTable
				className="hosting-overview__domains-table"
				hideCheckbox
				isLoadingDomains={ isLoading }
				domains={ data?.domains }
				isAllSitesView={ false }
				useMobileCards={ forceMobile }
				siteSlug={ site?.slug ?? null }
			/>
		</HostingCard>
	);
};

export default ActiveDomainsCard;
