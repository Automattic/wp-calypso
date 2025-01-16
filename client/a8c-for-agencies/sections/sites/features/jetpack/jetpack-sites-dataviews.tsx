import config from '@automattic/calypso-config';
import { Icon, starFilled } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useContext, useMemo, useState, ReactNode } from 'react';
import { DATAVIEWS_LIST } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import {
	DataViewsState,
	ItemsDataViewsType,
} from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import SiteSetFavorite from 'calypso/a8c-for-agencies/sections/sites/site-set-favorite';
import SitesDashboardContext from 'calypso/a8c-for-agencies/sections/sites/sites-dashboard-context';
import { SitesDataViewsProps } from 'calypso/a8c-for-agencies/sections/sites/sites-dataviews/interfaces';
import SiteDataField from 'calypso/a8c-for-agencies/sections/sites/sites-dataviews/site-data-field';
import { GuidedTourStep } from 'calypso/components/guided-tour/step';
import SiteStatusContent from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-status-content';
import { JETPACK_MANAGE_ONBOARDING_TOURS_EXAMPLE_SITE } from 'calypso/jetpack-cloud/sections/onboarding-tours/constants';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import { useFetchTestConnections } from '../../hooks/use-fetch-test-connection';
import useFormattedSites from '../../hooks/use-formatted-sites';
import { useSiteActionsDataViews } from '../../site-actions/use-site-actions';
import useGetSiteErrors from '../../sites-dataviews/hooks/use-get-site-errors';
import { AllowedTypes, Site, SiteData } from '../../types';
import type { Action, Field } from '@wordpress/dataviews';

export const JetpackSitesDataViews = ( {
	data,
	isLoading,
	isLargeScreen,
	setDataViewsState,
	setSelectedSiteFeature,
	dataViewsState,
	forceTourExampleSite = false,
	className,
	onRefetchSite,
}: SitesDataViewsProps ) => {
	const translate = useTranslate();

	const { showOnlyFavorites, showOnlyDevelopmentSites } = useContext( SitesDashboardContext );
	const totalSites = ( () => {
		if ( showOnlyFavorites ) {
			return data?.totalFavorites || 0;
		}
		if ( showOnlyDevelopmentSites ) {
			return data?.totalDevelopmentSites || 0;
		}
		return data?.total || 0;
	} )();
	const sitesPerPage =
		dataViewsState.perPage && dataViewsState.perPage > 0 ? dataViewsState.perPage : 20;
	const totalPages = Math.ceil( totalSites / sitesPerPage );

	const possibleSites = data?.sites ?? [];
	const connectionStatus = useFetchTestConnections( true, possibleSites );

	const sites = useFormattedSites( possibleSites, connectionStatus ).reduce< SiteData[] >(
		( acc, item ) => {
			item.ref = item.site.value.blog_id;
			acc.push( item );
			return acc;
		},
		[]
	);

	const getSiteErrors = useGetSiteErrors();

	const isNotProduction = config( 'env_id' ) !== 'a8c-for-agencies-production';

	const openSitePreviewPane = useCallback(
		( site: Site ) => {
			if ( site.sticker?.includes( 'migration-in-progress' ) && ! isNotProduction ) {
				return;
			}

			if ( site.is_simple ) {
				// We don't want to open the site preview pane for simple sites.
				return;
			}

			setDataViewsState( ( prevState: DataViewsState ) => ( {
				...prevState,
				selectedItem: site,
				type: DATAVIEWS_LIST,
			} ) );
		},
		[ isNotProduction, setDataViewsState ]
	);

	const renderField = useCallback(
		( column: AllowedTypes, item: SiteData ) => {
			if ( isLoading ) {
				return <TextPlaceholder />;
			}

			if ( column ) {
				return (
					<>
						<SiteStatusContent
							rows={ item }
							type={ column }
							isLargeScreen={ isLargeScreen }
							isFavorite={ item.isFavorite }
							siteError={ item.site.error }
						/>
					</>
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

	const fields = useMemo< Field< SiteData >[] >(
		() => [
			{
				id: 'status',
				label: translate( 'Status' ),
				getValue: ( { item }: { item: SiteData } ) =>
					item.site.error || item.scan.status === 'critical',
				render: () => null,
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
					operators: [ 'is' ],
					isPrimary: true,
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'url',
				// @ts-expect-error -- Need to fix the label type upstream in @wordpress/dataviews to support React elements.
				label: (
					<>
						<span
							className="sites-dataview__site-header sites-dataview__site-header--sort"
							ref={ ( ref ) => setIntroRef( ref as HTMLElement | null ) }
						>
							{ translate( 'Site' ).toUpperCase() }
						</span>
						<GuidedTourStep
							id="sites-walkthrough-intro"
							tourId="sitesWalkthrough"
							context={ introRef }
						/>
					</>
				),
				getValue: ( { item }: { item: SiteData } ) => item.site.value.url,
				render: ( { item }: { item: SiteData } ): ReactNode => {
					if ( isLoading ) {
						return <TextPlaceholder />;
					}
					const site = item.site.value;

					return (
						<div
							className={ clsx( {
								'is-site-selected': site.blog_id === dataViewsState.selectedItem?.blog_id,
							} ) }
						>
							<SiteDataField
								site={ site }
								isLoading={ isLoading }
								isDevSite={ item.isDevSite }
								onSiteTitleClick={ openSitePreviewPane }
								errors={ getSiteErrors( item ) }
							/>
						</div>
					);
				},
				enableHiding: false,
				enableSorting: true,
			},
			{
				id: 'stats',
				// @ts-expect-error -- Need to fix the label type upstream in @wordpress/dataviews to support React elements.
				label: (
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
				render: ( { item }: { item: SiteData } ) => renderField( 'stats', item ),
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'boost',
				// @ts-expect-error -- Need to fix the label type upstream in @wordpress/dataviews to support React elements.
				label: (
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
				getValue: ( { item }: { item: SiteData } ) => item.boost.status,
				render: ( { item }: { item: SiteData } ) => renderField( 'boost', item ),
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'backup',
				// @ts-expect-error -- Need to fix the label type upstream in @wordpress/dataviews to support React elements.
				label: (
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
				render: ( { item }: { item: SiteData } ) => renderField( 'backup', item ),
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'monitor',
				// @ts-expect-error -- Need to fix the label type upstream in @wordpress/dataviews to support React elements.
				label: (
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
				render: ( { item }: { item: SiteData } ) => renderField( 'monitor', item ),
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'scan',
				// @ts-expect-error -- Need to fix the label type upstream in @wordpress/dataviews to support React elements.
				label: (
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
				render: ( { item }: { item: SiteData } ) => renderField( 'scan', item ),
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'plugins',
				// @ts-expect-error -- Need to fix the label type upstream in @wordpress/dataviews to support React elements.
				label: (
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
				render: ( { item }: { item: SiteData } ) => renderField( 'plugin', item ),
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'favorite',
				// @ts-expect-error -- Need to fix the label type upstream in @wordpress/dataviews to support React elements.
				label: (
					<Icon
						className="site-table__favorite-icon sites-dataview__favorites-header"
						size={ 24 }
						icon={ starFilled }
					/>
				),
				getValue: ( { item }: { item: SiteData } ) => item.isFavorite,
				render: ( { item }: { item: SiteData } ) => {
					if ( isLoading ) {
						return <TextPlaceholder />;
					}

					return (
						<>
							<span className="sites-dataviews__favorite-btn-wrapper">
								<SiteSetFavorite
									isFavorite={ item.isFavorite || false }
									siteId={ item.site.value.blog_id }
									siteUrl={ item.site.value.url }
								/>
							</span>
						</>
					);
				},
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
			isLoading,
			dataViewsState.selectedItem?.blog_id,
			openSitePreviewPane,
			getSiteErrors,
			renderField,
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
		itemFieldId: 'ref',
		searchLabel: translate( 'Search for sites' ),
		fields: [],
		actions: [],
		setDataViewsState: setDataViewsState,
		dataViewsState: dataViewsState,
		onSelectionChange: ( items: string[] ) => {
			const selectedItem = sites.find( ( site ) => site.ref === items[ 0 ] );
			if ( selectedItem ) {
				openSitePreviewPane( selectedItem.site.value );
			}
		},
		defaultLayouts: { table: {} },
	} );

	useEffect( () => {
		// If the user clicks on a row, open the preview pane by triggering the View details button click.
		const handleRowClick = ( event: Event ) => {
			const target = event.target as HTMLElement;
			const row = target.closest(
				'.dataviews-view-table__row, li:has(.dataviews-view-list__item)'
			);

			if ( row ) {
				const isButtonOrLink = target.closest( 'button, a' );
				if ( ! isButtonOrLink ) {
					const button = row.querySelector( '.sites-dataviews__site' ) as HTMLButtonElement;
					if ( button ) {
						button.click();
					}
				}
			}
		};

		const rowsContainer = document.querySelector( '.dataviews-view-table, .dataviews-view-list' );

		if ( rowsContainer ) {
			rowsContainer.addEventListener( 'click', handleRowClick as EventListener );
		}

		// We need to trigger the click event on the View details button when the selected item changes to ensure highlighted row is correct.
		if (
			rowsContainer?.classList.contains( 'dataviews-view-list' ) &&
			dataViewsState?.selectedItem?.client_id
		) {
			const trigger: HTMLButtonElement | null = rowsContainer.querySelector(
				`li:not(.is-selected) .sites-dataviews__site`
			);
			if ( trigger ) {
				trigger.click();
			}
		}

		return () => {
			if ( rowsContainer ) {
				rowsContainer.removeEventListener( 'click', handleRowClick as EventListener );
			}
		};
	}, [ dataViewsState ] );

	const actions = useSiteActionsDataViews( {
		isLoading,
		isLargeScreen,
		onRefetchSite,
		setDataViewsState,
		setSelectedSiteFeature,
	} );

	// Update the data packet
	useEffect( () => {
		setItemsData( ( prevState: ItemsDataViewsType< SiteData > ) => ( {
			...prevState,
			items: sites,
			fields: fields,
			actions: actions as Action< SiteData >[],
			pagination: {
				totalItems: totalSites,
				totalPages: totalPages,
			},
			setDataViewsState: setDataViewsState,
			dataViewsState: dataViewsState,
			selectedItem: dataViewsState.selectedItem,
		} ) );
	}, [ fields, dataViewsState, setDataViewsState, data, actions ] );

	return <ItemsDataViews data={ itemsData } isLoading={ isLoading } className={ className } />;
};

export default JetpackSitesDataViews;
