import { Button } from '@automattic/components';
import { useSiteDomainsQuery } from '@automattic/data-stores';
import { DomainsTable } from '@automattic/domains-table';
import { useBreakpoint } from '@automattic/viewport-react';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';
import { HostingCard, HostingCardHeading } from 'calypso/components/hosting-card';
import { fetchSiteDomains } from 'calypso/my-sites/domains/domain-management/domains-table-fetch-functions';
import { useSelector } from 'calypso/state';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const ActiveDomainsCard: FC = () => {
	const forceMobile = useBreakpoint( '<660px' );
	const site = useSelector( getSelectedSite );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, site?.ID ) );
	const { data, isLoading } = useSiteDomainsQuery( site?.ID, {
		queryFn: () => fetchSiteDomains( site?.ID ),
	} );
	const translate = useTranslate();

	if ( isJetpack ) {
		return null;
	}

	return (
		<HostingCard className="hosting-overview__active-domains">
			<HostingCardHeading title={ translate( 'Active domains' ) }>
				<Button
					className={ classNames(
						'hosting-overview__link-button',
						'hosting-overview__mobile-hidden-link-button'
					) }
					plain
					href={ `/domains/add/${ site?.slug }?redirect_to=${ window.location.pathname }` }
				>
					{ translate( 'Add new domain' ) }
				</Button>
				<Button
					className="hosting-overview__link-button"
					plain
					href={ `/domains/manage/${ site?.slug }` }
				>
					{ translate( 'Manage domains' ) }
				</Button>
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
