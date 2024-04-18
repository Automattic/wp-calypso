import { Button, Card } from '@automattic/components';
import { useSiteDomainsQuery } from '@automattic/data-stores';
import { DomainsTable } from '@automattic/domains-table';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';
import { fetchSiteDomains } from 'calypso/my-sites/domains/domain-management/domains-table-fetch-functions';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const ActiveDomainsCard: FC = () => {
	const site = useSelector( getSelectedSite );
	const { data, isLoading } = useSiteDomainsQuery( site?.ID, {
		queryFn: () => fetchSiteDomains( site?.ID ),
	} );
	const translate = useTranslate();

	return (
		<Card className={ classNames( 'hosting-overview__card', 'hosting-overview__active-domains' ) }>
			<div className="hosting-overview__card-header">
				<h3 className="hosting-overview__card-title">{ translate( 'Active domains' ) }</h3>

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
			</div>

			<DomainsTable
				isLoadingDomains={ isLoading }
				domains={ data?.domains }
				isAllSitesView={ false }
				siteSlug={ site?.slug ?? null }
			/>
		</Card>
	);
};

export default ActiveDomainsCard;
