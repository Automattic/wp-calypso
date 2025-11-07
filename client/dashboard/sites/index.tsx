import { isAutomatticianQuery, siteBySlugQuery, siteByIdQuery } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import {
	useQuery,
	useQueryClient,
	useSuspenseQuery,
	keepPreviousData,
} from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Button, Modal } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { getISOWeek, getISOWeekYear } from 'date-fns';
import deepmerge from 'deepmerge';
import { useState, useEffect } from 'react';
import { Experiment } from 'calypso/lib/explat';
import { useAnalytics } from '../app/analytics';
import { useAuth } from '../app/auth';
import { useAppContext } from '../app/context';
import { useView } from '../app/dataviews/use-view';
import { sitesRoute } from '../app/router/sites';
import { DataViewsEmptyState } from '../components/dataviews-empty-state';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';
import { urlToSlug } from '../utils/url';
import AddNewSite from './add-new-site';
import {
	SitesDataViews,
	useActions,
	getFields,
	getDefaultFields,
	getDefaultView,
	recordViewChanges,
} from './dataviews';
import noSitesIllustration from './no-sites-illustration.svg';
import { SitesNotices } from './notices';
import type {
	FetchSitesOptions,
	Site,
	FetchDashboardSiteListParams,
	SiteProfileSite,
} from '@automattic/api-core';
import type { View, Filter } from '@wordpress/dataviews';

const getFetchSitesOptions = ( view: View, isRestoringAccount: boolean ): FetchSitesOptions => {
	const filters = view.filters ?? [];

	// Include A8C sites unless explicitly excluded from the filter.
	const shouldIncludeA8COwned = ! filters.some(
		( item: Filter ) => item.field === 'is_a8c' && item.value === false
	);

	if ( filters.find( ( item: Filter ) => item.field === 'status' && item.value === 'deleted' ) ) {
		return { site_visibility: 'deleted', include_a8c_owned: shouldIncludeA8COwned };
	}

	return {
		// Some P2 sites are not retrievable unless site_visibility is set to 'all'.
		// See: https://github.com/Automattic/wp-calypso/pull/104220.
		site_visibility: view.search || shouldIncludeA8COwned || isRestoringAccount ? 'all' : 'visible',
		include_a8c_owned: shouldIncludeA8COwned,
	};
};

function getFetchSiteListParams(
	view: View
	// isRestoringAccount: boolean TODO: Add site visibility filtering
): FetchDashboardSiteListParams {
	const dataviewFieldToSiteProfileField: Record< string, keyof SiteProfileSite > = {
		name: 'blogname',
		URL: 'url',
		'icon.ico': 'site_icon',
		backup: 'has_backup',
		views: 'stats_visitors',
		// plan
		// wp_version
		// is_a8c
		// preview
		// last_published
		// uptime
		// visitors
		// subscribers_count
		// links
		// php_version
		// storage
		// host
	};

	const fields = new Set< keyof SiteProfileSite >( [ 'blog_id', 'url' ] ); // Always include ID and URL (to calculate site slug).
	if ( view.showTitle && view.titleField ) {
		fields.add( dataviewFieldToSiteProfileField[ view.titleField ] );
	}
	if ( view.showMedia && view.mediaField ) {
		fields.add( dataviewFieldToSiteProfileField[ view.mediaField ] );
	}
	if ( view.showDescription && view.descriptionField ) {
		fields.add( dataviewFieldToSiteProfileField[ view.descriptionField ] );
	}
	// Status is a composite field that comes from a number of different SiteProfile fields.
	if ( view.fields?.includes( 'status' ) ) {
		fields.add( 'wpcom_status' );
		fields.add( 'private' );
		fields.add( 'deleted' );
	}
	view.fields?.forEach( ( field ) => {
		const mappedField = dataviewFieldToSiteProfileField[ field ];
		if ( mappedField ) {
			fields.add( mappedField );
		}
	} );

	return {
		fields: Array.from( fields ),
		s: view.search || undefined,
		sort_by: dataviewFieldToSiteProfileField[ view.sort?.field ?? '' ],
		sort_direction: view.sort?.direction,
		page: view.page,
		per_page: view.perPage,
	};
}

function siteProfileSiteToSite( site: SiteProfileSite ): Site {
	return {
		ID: site.blog_id ?? 0,
		slug: urlToSlug( site.url ?? '' ),
		name: site.blogname ?? '',
		URL: site.url ?? '',
		icon: site.site_icon ?? undefined,
		is_deleted: Boolean( site.deleted ),
		is_coming_soon: Boolean( site.wpcom_status?.is_coming_soon ),
		is_private: Boolean( site.private ),
		is_wpcom_staging_site: Boolean( site.wpcom_status?.is_staging ),
		capabilities: {
			manage_options: false, // TODO
			update_plugins: false, // TODO
		},
		garden_is_provisioned: null, // TODO
		garden_name: null, // TODO
		garden_partner: null, // TODO
		is_a4a_dev_site: false, // TODO
		is_a8c: false, // TODO
		is_garden: false, // TODO
		is_wpcom_atomic: false, // TODO
		is_wpcom_flex: false, // TODO
		is_vip: false, // TODO
		lang: 'en', // TODO
		launch_status: false, // TODO
		site_migration: { in_progress: false, is_complete: false }, // TODO
		site_owner: 0, // TODO
		jetpack: false, // TODO
		jetpack_connection: false, // TODO
		jetpack_modules: null, // TODO
		was_ecommerce_trial: false, // TODO
		was_migration_trial: false, // TODO
		was_hosting_trial: false, // TODO
		was_upgraded_from_trial: false, // TODO
	};
}

/**
 * Enables the correct site query based on the dataviews/v2/es-site-list feature flag.
 */
function useSiteListQuery( view: View, isRestoringAccount: boolean ) {
	const { queries } = useAppContext();

	const siteProfilesQueryResult = useQuery( {
		...queries.dashboardSiteListQuery( getFetchSiteListParams( view ) ),
		placeholderData: keepPreviousData,
		enabled: isEnabled( 'dashboard/v2/es-site-list' ),
		meta: {
			fullPageLoader: true,
		},
	} );

	const sitesQueryResult = useQuery( {
		...queries.sitesQuery( getFetchSitesOptions( view, isRestoringAccount ) ),
		placeholderData: keepPreviousData,
		enabled: ! isEnabled( 'dashboard/v2/es-site-list' ),
	} );

	if ( isEnabled( 'dashboard/v2/es-site-list' ) ) {
		return {
			sites: siteProfilesQueryResult.data?.sites.map( siteProfileSiteToSite ),
			isLoadingSites: siteProfilesQueryResult.isLoading,
			isPlaceholderData: siteProfilesQueryResult.isPlaceholderData,
			totalItems: siteProfilesQueryResult.data?.total,
		};
	}

	return {
		sites: sitesQueryResult.data,
		isLoadingSites: sitesQueryResult.isLoading,
		isPlaceholderData: sitesQueryResult.isPlaceholderData,
		totalItems: sitesQueryResult.data?.length,
	};
}

export default function Sites() {
	const { recordTracksEvent } = useAnalytics();
	const navigate = useNavigate( { from: sitesRoute.fullPath } );
	const queryClient = useQueryClient();
	const currentSearchParams = sitesRoute.useSearch();
	const isRestoringAccount = !! currentSearchParams.restored;

	const { user } = useAuth();
	const { data: isAutomattician } = useSuspenseQuery( isAutomatticianQuery() );

	const defaultView = getDefaultView( {
		user,
		isAutomattician,
		isRestoringAccount,
	} );

	const { view, updateView, isViewModified, resetView } = useView( {
		slug: 'sites',
		defaultView,
		defaultFields: getDefaultFields(),
	} );

	const { sites, isLoadingSites, isPlaceholderData, totalItems } = useSiteListQuery(
		view,
		isRestoringAccount
	);

	const fields = getFields( { isAutomattician, viewType: view.type } );
	const actions = useActions();

	const [ isModalOpen, setIsModalOpen ] = useState( false );

	const handleViewChange = ( nextView: View ) => {
		if ( nextView.type === 'list' ) {
			return;
		}

		recordViewChanges( view, nextView, recordTracksEvent );

		updateView( nextView );
	};

	const hasFilterOrSearch = ( view.filters && view.filters.length > 0 ) || view.search;

	const emptyTitle = hasFilterOrSearch ? __( 'No sites found' ) : __( 'No sites' );

	let emptyDescription = __( 'Get started by creating a new site.' );
	if ( view.search ) {
		emptyDescription = sprintf(
			// Translators: %s is the search term used when looking for sites by title or domain name.
			__(
				'Your search for “%s” did not match any sites. Try searching by the site title or domain name.'
			),
			view.search
		);
	} else if ( hasFilterOrSearch ) {
		emptyDescription = __( 'Your search did not match any sites.' );
	}

	useEffect( () => {
		if ( sites && ! isEnabled( 'dashboard/v2/es-site-list' ) ) {
			sites.forEach( ( site ) => {
				const updater = ( oldData?: Site ) => ( oldData ? deepmerge( oldData, site ) : site );
				queryClient.setQueryData( siteBySlugQuery( site.slug ).queryKey, updater );
				queryClient.setQueryData( siteByIdQuery( site.ID ).queryKey, updater );
			} );
		}
	}, [ sites, queryClient ] );

	return (
		<>
			{ isModalOpen && (
				<Modal title={ __( 'Add new site' ) } onRequestClose={ () => setIsModalOpen( false ) }>
					<AddNewSite context="sites-dashboard" />
				</Modal>
			) }
			<PageLayout
				header={
					<PageHeader
						title={ __( 'Sites' ) }
						actions={
							<Button
								variant="primary"
								onClick={ () => setIsModalOpen( true ) }
								__next40pxDefaultSize
							>
								{ __( 'Add new site' ) }
							</Button>
						}
					/>
				}
				notices={ <SitesNotices /> }
			>
				<SitesDataViews
					view={ view }
					sites={ sites ?? [] }
					totalItems={ totalItems ?? 0 }
					fields={ fields }
					actions={ actions }
					isLoading={ isLoadingSites || ( isPlaceholderData && sites?.length === 0 ) }
					empty={
						<DataViewsEmptyState
							title={ emptyTitle }
							description={ emptyDescription }
							illustration={
								<img src={ noSitesIllustration } alt="" width={ 408 } height={ 280 } />
							}
							actions={
								<>
									{ view.search && (
										<Button
											__next40pxDefaultSize
											variant="secondary"
											onClick={ () => {
												navigate( {
													search: {
														...currentSearchParams,
														view: Object.fromEntries(
															Object.entries( view ).filter( ( [ key ] ) => key !== 'search' )
														),
													},
												} );
											} }
										>
											{ __( 'Clear search' ) }
										</Button>
									) }
									<Button
										__next40pxDefaultSize
										variant="primary"
										onClick={ () => setIsModalOpen( true ) }
									>
										{ __( 'Add new site' ) }
									</Button>
								</>
							}
						/>
					}
					onChangeView={ handleViewChange }
					isViewModified={ isViewModified }
					onResetView={ resetView }
				/>
			</PageLayout>
			{ /* ExPlat's Evergreen A/A Test Experiment:
			 *
			 * This continually starts a new experiment every week that doesn't render anything and
			 * shouldn't send any extra requests, just to help us ensure our experimentation system is
			 * working smoothly.
			 *
			 * This particular spot isn't special, it just needs somewhere to live.
			 *
			 * We use iso-week and iso-week-year in order to consistently change the experiment name every week.
			 * Assumes users have a somewhat working clock but shouldn't be a problem if they don't.
			 */ }
			<Experiment
				name={ ( () => {
					const now = new Date();
					const year = getISOWeekYear( now );
					const week = String( getISOWeek( now ) ).padStart( 2, '0' );
					return `explat_test_aa_weekly_calypso_${ year }_week_${ week }`;
				} )() }
				defaultExperience={ null }
				treatmentExperience={ null }
				loadingExperience={ null }
			/>
		</>
	);
}
