import {
	activeAgencyQuery,
	paginatedAgencySitesQuery,
	agencyPendingSitesQuery,
} from '@automattic/api-queries';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, _n } from '@wordpress/i18n';
import { useCallback, useEffect, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { usePersistentView } from '../../app/hooks/use-persistent-view';
import { PerformanceTrackerStop } from '../../app/performance-tracking';
import {
	agencySitesRoute,
	hasAnyCapability,
	isRouteAllowedByCapabilities,
	marketplaceRoute,
} from '../../app/router/agency';
import { DataViews, DataViewsCard, DataViewsEmptyStateLayout } from '../../components/dataviews';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { DEFAULT_PER_PAGE, DEFAULT_CONFIG, recordViewChanges } from '../../sites/dataviews/views';
import { AgencyNotices } from '../components/agency-notices';
import DesignPreviewControls, { useDesignPreview } from '../design-preview';
import useSiteSimulation from '../design-preview/use-site-simulation';
import { DevSiteConfigurationModal } from '../marketplace/purchases/site-configuration-modal';
import ConnectSiteModal from './add-new-site/connect-site-modal';
import ImportFromWPCOMModal from './add-new-site/import-from-wpcom-modal';
import { useAgencyFields, useAgencyActions } from './dataviews';
import { hasWpcomLicenseWithoutSite } from './lib';
import ProvisioningSiteNotices from './provisioning-notice';
import SiteWizard from './site-wizard';
import './style.scss';
import { useWizardHistory } from './site-wizard/wizard-history';
import type { AddNewSiteAction } from './add-new-site/types';
import type { AgencySite, FetchAgencySitesOptions } from '@automattic/api-core';
import type { SupportedLayouts, View } from '@wordpress/dataviews';

const AGENCY_LAYOUTS: SupportedLayouts = {
	table: {
		showMedia: true,
		mediaField: 'site_icon',
		titleField: 'name',
		descriptionField: 'URL',
		layout: { aspectRatio: '16/9' },
	},
	grid: {
		layout: {
			previewSize: 290,
		},
		showMedia: true,
		mediaField: 'preview',
		titleField: 'name',
		descriptionField: 'URL',
	},
};

const DEFAULT_VIEW = {
	type: 'table',
	perPage: DEFAULT_PER_PAGE,
	mediaField: 'site_icon',
	titleField: 'name',
	descriptionField: 'URL',
	fields: [ 'visibility', 'plan' ],
	layout: { aspectRatio: '16/9' },
	sort: { field: 'URL', direction: 'asc' },
} as View;

const LEGACY_FIELDS = [ 'agency_boost', 'agency_backup' ];

const removeLegacyFields = ( fields: View[ 'fields' ] ) =>
	fields?.filter( ( field ) => ! LEGACY_FIELDS.includes( field ) );

// The agency endpoint only supports sorting by URL.
const SORT_FIELD_MAP: Record< string, 'url' > = { URL: 'url' };

function toAgencyFetchOptions( view: View ): FetchAgencySitesOptions {
	return {
		search: view.search,
		sort_field: view.sort?.field ? SORT_FIELD_MAP[ view.sort.field ] : undefined,
		sort_direction: view.sort?.direction,
		page: view.page,
		per_page: view.perPage,
	};
}

/**
 * WordPress.com licenses the agency has paid for but not yet turned into sites.
 */
function useLicensesReadyToSetUp(): number {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const { data: pendingSites } = useQuery( {
		...agencyPendingSitesQuery( agency?.id ?? 0 ),
		enabled: !! agency?.id,
	} );

	// This counts on every `/sites` load, so a response that is not the expected
	// list must not take the route down with it.
	return Array.isArray( pendingSites )
		? pendingSites.filter( hasWpcomLicenseWithoutSite ).length
		: 0;
}

function NeedsSetupDescription( { count }: { count: number } ) {
	return createInterpolateElement(
		_n(
			'<count/> WordPress.com license is ready to set up. <link>Set it up in Purchases</link>',
			'<count/> WordPress.com licenses are ready to set up. <link>Set them up in Purchases</link>',
			count
		),
		{
			count: <>{ count }</>,
			link: <Link to="/purchases" search={ { status: 'unassigned', search: 'WordPress.com' } } />,
		}
	);
}

export default function AgencySites() {
	const preview = useDesignPreview();
	// A persona switch closes any open flow before its handlers can change from
	// simulated actions to live account mutations (or vice versa).
	return <AgencySitesContent key={ preview.sitesRevision } />;
}

function AgencySitesContent() {
	const { recordTracksEvent } = useAnalytics();
	const preview = useDesignPreview();
	const simulation = useSiteSimulation();
	const liveLicensesReadyToSetUp = useLicensesReadyToSetUp();
	const licensesReadyToSetUp = preview.sitesActive ? 0 : liveLicensesReadyToSetUp;
	const currentSearchParams = agencySitesRoute.useSearch();
	const [ activeModal, setActiveModal ] = useState< AddNewSiteAction | null >( null );
	const [ wizardOpen, setWizardOpen ] = useState( false );
	const [ wizardRevision, setWizardRevision ] = useState( 0 );

	useEffect( () => {
		if ( preview.wizardJump ) {
			setActiveModal( null );
			setWizardOpen( true );
		}
	}, [ preview.wizardJump ] );

	const { data: agency } = useQuery( activeAgencyQuery() );
	const wizardHistory = useWizardHistory( String( preview.sitesRevision ) );
	const capabilities = agency?.user?.capabilities ?? [];
	const canRemoveSites = hasAnyCapability( capabilities, 'a4a_remove_managed_sites' );
	// Issuing a license navigates to the Marketplace, so read the requirement off
	// that route rather than restating its capability list here.
	const canIssueLicenses = isRouteAllowedByCapabilities( marketplaceRoute, capabilities );
	const actions = useAgencyActions( { canIssueLicenses, canRemoveSites } );

	const { view, updateView, resetView } = usePersistentView( {
		slug: 'agency-sites',
		defaultView: DEFAULT_VIEW,
		queryParams: currentSearchParams,
		sanitizeFields: removeLegacyFields,
	} );

	const {
		data,
		isLoading: liveLoading,
		isPlaceholderData,
	} = useQuery( {
		...paginatedAgencySitesQuery( toAgencyFetchOptions( view ) ),
		placeholderData: keepPreviousData,
	} );

	const isLoading = preview.sitesActive ? preview.sites === 'loading' : liveLoading;
	const filteredSamples = preview.siteRows
		.filter( ( site ) =>
			`${ site.blogname } ${ site.url }`
				.toLowerCase()
				.includes( ( view.search ?? '' ).toLowerCase() )
		)
		.sort(
			( a, b ) => ( view.sort?.direction === 'desc' ? -1 : 1 ) * a.url.localeCompare( b.url )
		);
	const sites = preview.sitesActive
		? filteredSamples.slice(
				( ( view.page ?? 1 ) - 1 ) * ( view.perPage ?? 50 ),
				( view.page ?? 1 ) * ( view.perPage ?? 50 )
			)
		: ( data?.sites ?? [] );
	const totalItems = preview.sitesActive ? filteredSamples.length : ( data?.total ?? 0 );
	const showEmptyState = ! isLoading && totalItems === 0 && ! view.search && ! view.filters?.length;
	const showWizard = showEmptyState || wizardOpen || !! wizardHistory.entry;

	const handleSiteClick = useCallback(
		( site: AgencySite ) =>
			recordTracksEvent( 'calypso_a4a_sites_item_click', { site_id: site.blog_id } ),
		[ recordTracksEvent ]
	);

	const fields = useAgencyFields( { viewType: view.type, onSiteClick: handleSiteClick } );

	const handleViewChange = ( nextView: View ) => {
		recordViewChanges( view, nextView, recordTracksEvent );
		updateView( nextView );
	};

	const closeModal = () => setActiveModal( null );
	const closeWizard = () => {
		wizardHistory.close();
		setWizardOpen( false );
		setWizardRevision( ( revision ) => revision + 1 );
	};

	const paginationInfo = {
		totalItems,
		totalPages: view.perPage ? Math.ceil( totalItems / view.perPage ) : 1,
	};

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Sites' ) }
					description={
						licensesReadyToSetUp > 0 ? (
							<NeedsSetupDescription count={ licensesReadyToSetUp } />
						) : (
							__( 'Manage your clients’ WordPress sites in one place.' )
						)
					}
					actions={
						! showWizard && (
							<Button
								variant="primary"
								onClick={ () => {
									recordTracksEvent( 'calypso_a4a_sites_add_new_site_clicked' );
									setWizardOpen( true );
								} }
								__next40pxDefaultSize
							>
								{ __( 'Add new site' ) }
							</Button>
						)
					}
				/>
			}
			notices={
				! preview.sitesActive && (
					<>
						<ProvisioningSiteNotices />
						<AgencyNotices />
					</>
				)
			}
		>
			<DesignPreviewControls surface="sites" />
			{ activeModal === 'dev-site-configurations' && (
				<DevSiteConfigurationModal closeModal={ closeModal } preview={ simulation?.development } />
			) }
			{ ( activeModal === 'a4a-connection' || activeModal === 'jetpack-connection' ) && (
				<ConnectSiteModal
					action={ activeModal }
					onClose={ closeModal }
					onPreviewConnect={ simulation?.onConnect }
				/>
			) }
			{ activeModal === 'import-from-wpcom' && (
				<ImportFromWPCOMModal onClose={ closeModal } preview={ simulation?.import } />
			) }
			{ ! isLoading && <PerformanceTrackerStop /> }
			{ showWizard ? (
				<SiteWizard
					key={ wizardRevision }
					isFirstSite={ showEmptyState }
					simulation={ simulation }
					onStart={ () => setWizardOpen( true ) }
					onClose={ closeWizard }
					onSelectAction={ setActiveModal }
				/>
			) : (
				<div
					onClickCapture={ ( event ) => {
						if ( preview.sitesActive && ( event.target as HTMLElement ).closest( 'a' ) ) {
							event.preventDefault();
							event.stopPropagation();
						}
					} }
				>
					<DataViewsCard className="agency-sites-list">
						<DataViews< AgencySite >
							getItemId={ ( item ) => item.blog_id.toString() }
							data={ sites }
							fields={ fields }
							actions={ preview.sitesActive ? [] : actions }
							view={
								view.type === 'table' && ! view.layout
									? { ...view, layout: { aspectRatio: '16/9' } }
									: view
							}
							isLoading={ isLoading }
							isPlaceholderData={ ! preview.sitesActive && isPlaceholderData }
							onChangeView={ handleViewChange }
							onReset={ resetView }
							defaultLayouts={ AGENCY_LAYOUTS }
							paginationInfo={ paginationInfo }
							config={ DEFAULT_CONFIG }
							empty={
								view.search ? (
									<DataViewsEmptyStateLayout
										isBorderless
										title={ __( 'No sites match your search' ) }
										description={ __( 'Try a different search term.' ) }
									/>
								) : (
									<DataViewsEmptyStateLayout
										isBorderless
										title={ __( 'No sites' ) }
										description={ __( 'No agency-managed sites were found.' ) }
									/>
								)
							}
						/>
					</DataViewsCard>
				</div>
			) }
		</PageLayout>
	);
}
