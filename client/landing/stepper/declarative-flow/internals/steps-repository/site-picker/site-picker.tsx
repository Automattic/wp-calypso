import { SubTitle, Title } from '@automattic/onboarding';
import { createSitesListComponent, GroupableSiteLaunchStatuses } from '@automattic/sites';
import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import React from 'react';
import Pagination from 'calypso/components/pagination';
import { useSiteExcerptsQuery } from 'calypso/data/sites/use-site-excerpts-query';
import { SITE_PICKER_FILTER_CONFIG } from 'calypso/landing/stepper/constants';
import { NoSitesMessage } from 'calypso/sites-dashboard/components/no-sites-message';
import {
	SitesContentControls,
	SitesDashboardQueryParams,
} from 'calypso/sites-dashboard/components/sites-content-controls';
import { PageBodyBottomContainer } from 'calypso/sites-dashboard/components/sites-dashboard';
import { SitesGrid } from 'calypso/sites-dashboard/components/sites-grid';
import { useSitesSorting } from 'calypso/state/sites/hooks/use-sites-sorting';
import type { SiteExcerptData } from '@automattic/sites';

const SitesDashboardSitesList = createSitesListComponent();

interface Props {
	page: number;
	perPage?: number;
	search: string;
	status: GroupableSiteLaunchStatuses;
	onCreateSite: () => void;
	onSelectSite: ( site: SiteExcerptData ) => void;
	onQueryParamChange: ( params: Partial< SitesDashboardQueryParams > ) => void;
}
const SitePicker = function SitePicker( props: Props ) {
	const { __ } = useI18n();
	const {
		page,
		perPage = 96,
		search,
		status,
		onSelectSite,
		onCreateSite,
		onQueryParamChange,
	} = props;
	const { sitesSorting, onSitesSortingChange } = useSitesSorting();
	const { data: allSites = [], isLoading } = useSiteExcerptsQuery(
		SITE_PICKER_FILTER_CONFIG,
		( site ) => ! site.is_wpcom_staging_site && ! site.is_deleted
	);

	return (
		<div className="site-picker--container">
			<div className="site-picker--title">
				<Title>{ __( 'Pick your destination' ) }</Title>
				<SubTitle>
					{ createInterpolateElement(
						__(
							'Select the WordPress.com site where you’ll move your old site or <button>create a new one</button>'
						),
						{
							button: <Button onClick={ onCreateSite } />,
						}
					) }
				</SubTitle>
			</div>
			<SitesDashboardSitesList
				sites={ allSites }
				filtering={ { search } }
				sorting={ sitesSorting }
				grouping={ { status, showHidden: true } }
			>
				{ ( { sites, statuses } ) => {
					const paginatedSites = sites.slice( ( page - 1 ) * perPage, page * perPage );
					const selectedStatus = statuses.find( ( { name } ) => name === status ) || statuses[ 0 ];

					return (
						<>
							<SitesContentControls
								initialSearch={ search }
								onQueryParamChange={ onQueryParamChange }
								sitesSorting={ sitesSorting }
								onSitesSortingChange={ onSitesSortingChange }
								statuses={ statuses }
								selectedStatus={ selectedStatus }
								hasSitesSortingPreferenceLoaded
							/>
							{ paginatedSites.length > 0 || isLoading ? (
								<>
									<SitesGrid
										isLoading={ isLoading }
										sites={ paginatedSites }
										siteSelectorMode
										onSiteSelectBtnClick={ onSelectSite }
									/>
									{ ( selectedStatus.hiddenCount > 0 || sites.length > perPage ) && (
										<PageBodyBottomContainer>
											<Pagination
												page={ page }
												perPage={ perPage }
												total={ sites.length }
												pageClick={ ( page: number ) => {
													onQueryParamChange( { page } );
												} }
											/>
										</PageBodyBottomContainer>
									) }
								</>
							) : (
								<NoSitesMessage
									status={ selectedStatus.name }
									statusSiteCount={ selectedStatus.count }
								/>
							) }
						</>
					);
				} }
			</SitesDashboardSitesList>
		</div>
	);
};

export default SitePicker;
