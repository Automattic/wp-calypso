import { SubTitle, Title } from '@automattic/onboarding';
import {
	createSitesListComponent,
	DEFAULT_SITE_LAUNCH_STATUS_GROUP_VALUE,
	GroupableSiteLaunchStatuses,
} from '@automattic/sites';
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
import { useSitesSorting } from 'calypso/state/sites/hooks/use-sites-sorting';
import type { SiteExcerptData } from '@automattic/sites';

const SitesDashboardSitesList = createSitesListComponent();

interface Props {
	page: number;
	perPage?: number;
	search: string;
	status: GroupableSiteLaunchStatuses;
	hasSourceSite: boolean;
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
		hasSourceSite,
		onSelectSite,
		onCreateSite,
		onQueryParamChange,
	} = props;
	const { sitesSorting, onSitesSortingChange } = useSitesSorting();
	const {
		data: allSites = [],
		isLoading,
		isError,
		refetch,
	} = useSiteExcerptsQuery(
		SITE_PICKER_FILTER_CONFIG,
		( site ) => ! site.is_wpcom_staging_site && ! site.is_deleted
	);

	return (
		<div className="site-picker--container">
			<div className="site-picker--title">
				<Title>{ __( 'Choose a destination site' ) }</Title>
				<SubTitle>
					{ createInterpolateElement(
						hasSourceSite
							? __(
									'Choose the WordPress.com site where you want to move your old site, or <button>create a new site</button>'
							  )
							: __(
									'This is where we’ll add the content you import. Choose an existing site or <button>create a new site</button>'
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
					const showControls =
						allSites.length > 8 || !! search || status !== DEFAULT_SITE_LAUNCH_STATUS_GROUP_VALUE;

					if ( isError ) {
						return (
							<div className="site-picker--error" role="alert">
								<p>{ __( 'We couldn’t load your sites. Please try again.' ) }</p>
								<Button variant="secondary" onClick={ () => refetch() }>
									{ __( 'Try again' ) }
								</Button>
							</div>
						);
					}

					return (
						<>
							{ showControls && (
								<div className="site-picker--controls">
									<SitesContentControls
										initialSearch={ search }
										onQueryParamChange={ onQueryParamChange }
										sitesSorting={ sitesSorting }
										onSitesSortingChange={ onSitesSortingChange }
										statuses={ statuses }
										selectedStatus={ selectedStatus }
										hasSitesSortingPreferenceLoaded
									/>
								</div>
							) }
							{ paginatedSites.length > 0 || isLoading ? (
								<>
									{ isLoading ? (
										<div className="site-picker--loading" aria-label={ __( 'Loading sites' ) } />
									) : (
										<div className="site-picker--list">
											{ paginatedSites.map( ( site ) => (
												<div className="site-picker--site" key={ site.ID }>
													<div className="site-picker--site-icon" aria-hidden="true">
														{ site.icon?.img ? (
															<img src={ site.icon.img } alt="" />
														) : (
															( site.title || site.name || '?' ).trim().charAt( 0 ).toUpperCase()
														) }
													</div>
													<div className="site-picker--site-details">
														<strong>{ site.title || site.name }</strong>
														<span>{ formatSiteDomain( site.URL ) }</span>
														{ ( site.is_coming_soon || site.is_private ) && (
															<small>
																{ site.is_coming_soon ? __( 'Coming soon' ) : __( 'Private' ) }
															</small>
														) }
													</div>
													<Button variant="primary" onClick={ () => onSelectSite( site ) }>
														{ __( 'Choose' ) }
													</Button>
												</div>
											) ) }
										</div>
									) }
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

function formatSiteDomain( siteUrl: string ) {
	try {
		return new URL( siteUrl ).hostname;
	} catch {
		return siteUrl;
	}
}
