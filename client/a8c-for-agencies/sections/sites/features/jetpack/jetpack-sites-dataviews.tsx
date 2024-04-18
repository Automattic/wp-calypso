import { Button, Gridicon } from '@automattic/components';
import { Icon, starFilled } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useContext, useMemo, useState, ReactNode } from 'react';
import { GuidedTourStep } from 'calypso/a8c-for-agencies/components/guided-tour-step';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import {
	DataViewsColumn,
	DataViewsState,
	ItemsDataViewsType,
} from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import SiteSort from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/site-sort';
import SiteSetFavorite from 'calypso/a8c-for-agencies/sections/sites/site-set-favorite';
import SitesDashboardContext from 'calypso/a8c-for-agencies/sections/sites/sites-dashboard-context';
import {
	SiteInfo,
	SitesDataViewsProps,
} from 'calypso/a8c-for-agencies/sections/sites/sites-dataviews/interfaces';
import SiteDataField from 'calypso/a8c-for-agencies/sections/sites/sites-dataviews/site-data-field';
import SiteActions from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-actions';
import useFormattedSites from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-content/hooks/use-formatted-sites';
import SiteStatusContent from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-status-content';
import { JETPACK_MANAGE_ONBOARDING_TOURS_EXAMPLE_SITE } from 'calypso/jetpack-cloud/sections/onboarding-tours/constants';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import { AllowedTypes, Site, SiteData } from '../../types';

export const JetpackSitesDataViews = ( {
	data,
	isLoading,
	isLargeScreen,
	setDataViewsState,
	dataViewsState,
	forceTourExampleSite = false,
	className,
}: SitesDataViewsProps ) => {
	const translate = useTranslate();

	const { showOnlyFavorites } = useContext( SitesDashboardContext );
	const totalSites = showOnlyFavorites ? data?.totalFavorites || 0 : data?.total || 0;
	const sitesPerPage = dataViewsState.perPage > 0 ? dataViewsState.perPage : 20;
	const totalPages = Math.ceil( totalSites / sitesPerPage );

	const sites = useFormattedSites( data?.sites ?? [] );

	const openSitePreviewPane = useCallback(
		( site: Site ) => {
			setDataViewsState( ( prevState: DataViewsState ) => ( {
				...prevState,
				selectedItem: site,
				type: 'list',
			} ) );
		},
		[ setDataViewsState, dataViewsState ]
	);

	const renderField = useCallback(
		( column: AllowedTypes, item: SiteInfo ) => {
			if ( isLoading ) {
				return <TextPlaceholder />;
			}

			if ( column ) {
				return (
					<SiteStatusContent
						rows={ item }
						type={ column }
						isLargeScreen={ isLargeScreen }
						isFavorite={ item.isFavorite }
						siteError={ item.site.error }
					/>
				);
			}
		},
		[ isLoading, isLargeScreen ]
	);

	// Legacy refs for guided tour popovers
	const [ introRef, setIntroRef ] = useState< HTMLElement | null >();
	const [ statsRef, setStatsRef ] = useState< HTMLElement | null >();
	const [ boostRef, setBoostRef ] = useState< HTMLElement | null >();
	const [ backupRef, setBackupRef ] = useState< HTMLElement | null >();
	const [ monitorRef, setMonitorRef ] = useState< HTMLElement | null >();
	const [ scanRef, setScanRef ] = useState< HTMLElement | null >();
	const [ pluginsRef, setPluginsRef ] = useState< HTMLElement | null >();
	const [ actionsRef, setActionsRef ] = useState< HTMLElement | null >();

	const fields = useMemo< DataViewsColumn[] >(
		() => [
			{
				id: 'status',
				header: translate( 'Status' ),
				getValue: ( { item }: { item: SiteInfo } ) =>
					item.site.error || item.scan.status === 'critical',
				render: () => null,
				type: 'enumeration',
				elements: [
					{ value: 1, label: translate( 'Needs Attention' ) },
					{ value: 2, label: translate( 'Backup Failed' ) },
					{ value: 3, label: translate( 'Backup Warning' ) },
					{ value: 4, label: translate( 'Threat Found' ) },
					{ value: 5, label: translate( 'Site Disconnected' ) },
					{ value: 6, label: translate( 'Site Down' ) },
					{ value: 7, label: translate( 'Plugins Needing Updates' ) },
				],
				filterBy: {
					operators: [ 'in' ],
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'site',
				header: (
					<>
						<SiteSort isSortable={ true } columnKey="site">
							<span
								className="sites-dataview__site-header sites-dataview__site-header--sort"
								ref={ ( ref ) => setIntroRef( ref as HTMLElement | null ) }
							>
								{ translate( 'Site' ).toUpperCase() }
							</span>
						</SiteSort>
						<GuidedTourStep
							id="sites-walkthrough-intro"
							tourId="sitesWalkthrough"
							context={ introRef }
						/>
					</>
				),
				getValue: ( { item }: { item: SiteInfo } ) => item.site.value.url,
				render: ( { item }: { item: SiteInfo } ): ReactNode => {
					if ( isLoading ) {
						return <TextPlaceholder />;
					}
					const site = item.site.value;
					return (
						<SiteDataField
							site={ site }
							isLoading={ isLoading }
							onSiteTitleClick={ openSitePreviewPane }
						/>
					);
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'stats',
				header: (
					<div>
						<span
							className="sites-dataview__stats-header"
							ref={ ( ref ) => setStatsRef( ref as HTMLElement | null ) }
						>
							STATS
						</span>
						<GuidedTourStep
							id="sites-walkthrough-stats"
							tourId="sitesWalkthrough"
							context={ statsRef }
						/>
					</div>
				),
				getValue: () => '-',
				render: ( { item }: { item: SiteInfo } ) => renderField( 'stats', item ),
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'boost',
				header: (
					<>
						<span
							className="sites-dataview__boost-header"
							ref={ ( ref ) => setBoostRef( ref as HTMLElement | null ) }
						>
							BOOST
						</span>
						<GuidedTourStep
							id="sites-walkthrough-boost"
							tourId="sitesWalkthrough"
							context={ boostRef }
						/>
					</>
				),
				getValue: ( { item }: { item: SiteInfo } ) => item.boost.status,
				render: ( { item }: { item: SiteInfo } ) => renderField( 'boost', item ),
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'backup',
				header: (
					<>
						<span
							className="sites-dataview__backup-header"
							ref={ ( ref ) => setBackupRef( ref as HTMLElement | null ) }
						>
							BACKUP
						</span>
						<GuidedTourStep
							id="sites-walkthrough-backup"
							tourId="sitesWalkthrough"
							context={ backupRef }
						/>
					</>
				),
				getValue: () => '-',
				render: ( { item }: { item: SiteInfo } ) => renderField( 'backup', item ),
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'monitor',
				header: (
					<>
						<span
							className="sites-dataview__monitor-header"
							ref={ ( ref ) => setMonitorRef( ref as HTMLElement | null ) }
						>
							MONITOR
						</span>
						<GuidedTourStep
							id="sites-walkthrough-monitor"
							tourId="sitesWalkthrough"
							context={ monitorRef }
						/>
					</>
				),
				getValue: () => '-',
				render: ( { item }: { item: SiteInfo } ) => renderField( 'monitor', item ),
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'scan',
				header: (
					<>
						<span
							className="sites-dataview__scan-header"
							ref={ ( ref ) => setScanRef( ref as HTMLElement | null ) }
						>
							SCAN
						</span>
						<GuidedTourStep
							id="sites-walkthrough-scan"
							tourId="sitesWalkthrough"
							context={ scanRef }
						/>
					</>
				),
				getValue: () => '-',
				render: ( { item }: { item: SiteInfo } ) => renderField( 'scan', item ),
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'plugins',
				header: (
					<>
						<span
							className="sites-dataview__plugins-header"
							ref={ ( ref ) => setPluginsRef( ref as HTMLElement | null ) }
						>
							PLUGINS
						</span>
						<GuidedTourStep
							id="sites-walkthrough-plugins"
							tourId="sitesWalkthrough"
							context={ pluginsRef }
						/>
					</>
				),
				getValue: () => '-',
				render: ( { item }: { item: SiteInfo } ) => renderField( 'plugin', item ),
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'favorite',
				header: (
					<Icon
						className="site-table__favorite-icon sites-dataview__favorites-header"
						size={ 24 }
						icon={ starFilled }
					/>
				),
				getValue: ( { item }: { item: SiteInfo } ) => item.isFavorite,
				render: ( { item }: { item: SiteInfo } ) => {
					if ( isLoading ) {
						return <TextPlaceholder />;
					}
					return (
						<span className="sites-dataviews__favorite-btn-wrapper">
							<SiteSetFavorite
								isFavorite={ item.isFavorite || false }
								siteId={ item.site.value.blog_id }
								siteUrl={ item.site.value.url }
							/>
						</span>
					);
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'actions',
				getValue: ( { item }: { item: SiteInfo } ) => item.isFavorite,
				render: ( { item }: { item: SiteInfo } ) => {
					if ( isLoading ) {
						return <TextPlaceholder />;
					}
					return (
						<div className="sites-dataviews__actions">
							<SiteActions
								isLargeScreen={ isLargeScreen }
								site={ item.site }
								siteError={ item.site.error }
							/>
							<Button
								onClick={ () => openSitePreviewPane( item.site.value ) }
								className="site-preview__open"
								borderless
								ref={ ( ref ) => setActionsRef( ( current ) => current || ref ) }
							>
								<Gridicon icon="chevron-right" />
							</Button>
						</div>
					);
				},
				header: (
					<GuidedTourStep
						id="sites-walkthrough-site-preview"
						tourId="sitesWalkthrough"
						context={ actionsRef }
					/>
				),
				enableHiding: false,
				enableSorting: false,
			},
		],
		[
			translate,
			introRef,
			statsRef,
			boostRef,
			backupRef,
			monitorRef,
			scanRef,
			pluginsRef,
			actionsRef,
			isLoading,
			openSitePreviewPane,
			renderField,
			isLargeScreen,
		]
	);

	const urlParams = new URLSearchParams( window.location.search );
	const isOnboardingTourActive = urlParams.get( 'tour' ) !== null;
	const useExampleDataForTour =
		forceTourExampleSite || ( isOnboardingTourActive && ( ! sites || sites.length === 0 ) );

	const [ itemsData, setItemsData ] = useState< ItemsDataViewsType< SiteData > >( {
		items: ! useExampleDataForTour ? sites : JETPACK_MANAGE_ONBOARDING_TOURS_EXAMPLE_SITE,
		pagination: {
			totalItems: totalSites,
			totalPages: totalPages,
		},
		itemFieldId: 'site.value.blog_id',
		searchLabel: translate( 'Search for Sites' ),
		fields: [],
		actions: [],
		setDataViewsState: setDataViewsState,
		dataViewsState: dataViewsState,
	} );

	// Update the data packet
	useEffect( () => {
		setItemsData( ( prevState: ItemsDataViewsType< SiteData > ) => ( {
			...prevState,
			items: sites,
			fields: fields,
			setDataViewsState: setDataViewsState,
			dataViewsState: dataViewsState,
			selectedItem: dataViewsState.selectedItem,
		} ) );
	}, [ fields, dataViewsState, setDataViewsState, data ] );

	return (
		<ItemsDataViews
			data={ itemsData }
			isLoading={ isLoading }
			isLargeScreen={ isLargeScreen }
			className={ className }
		/>
	);
};

export default JetpackSitesDataViews;
