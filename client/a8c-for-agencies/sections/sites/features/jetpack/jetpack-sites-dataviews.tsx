import config from '@automattic/calypso-config';
import { Icon, starFilled } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useContext, useMemo, useState, ReactNode } from 'react';
import { GuidedTourStep } from 'calypso/a8c-for-agencies/components/guided-tour-step';
import { DATAVIEWS_LIST } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
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
import SiteStatusContent from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-status-content';
import { JETPACK_MANAGE_ONBOARDING_TOURS_EXAMPLE_SITE } from 'calypso/jetpack-cloud/sections/onboarding-tours/constants';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import { useFetchTestConnections } from '../../hooks/use-fetch-test-connection';
import useFormattedSites from '../../hooks/use-formatted-sites';
import SiteActions from '../../site-actions';
import { AllowedTypes, Site, SiteData } from '../../types';
import SiteErrorColumn from '../a4a/site-error-column';
import { A4A_PLUGIN_SLUG } from '../a4a/site-error-preview';
import type { MouseEvent, KeyboardEvent } from 'react';

export const JetpackSitesDataViews = ( {
	data,
	isLoading,
	isLargeScreen,
	setDataViewsState,
	dataViewsState,
	forceTourExampleSite = false,
	className,
	onRefetchSite,
}: SitesDataViewsProps ) => {
	const translate = useTranslate();

	const { showOnlyFavorites } = useContext( SitesDashboardContext );
	const totalSites = showOnlyFavorites ? data?.totalFavorites || 0 : data?.total || 0;
	const sitesPerPage = dataViewsState.perPage > 0 ? dataViewsState.perPage : 20;
	const totalPages = Math.ceil( totalSites / sitesPerPage );

	const possibleSites = data?.sites ?? [];
	const connectionStatus = useFetchTestConnections( true, possibleSites );

	const sites = useFormattedSites( possibleSites, connectionStatus ).reduce< SiteData[] >(
		( acc, item ) => {
			item.ref = item.site.value.blog_id;
			acc.push( item );
			// If this site has an error, we duplicate this row - while changing the duplicate's type to 'error' - to display an error message below it.
			if ( item.site.error ) {
				acc.push( {
					...item,
					site: {
						...item.site,
						type: 'error',
					},
					ref: `error-${ item.ref }`,
				} );
			}
			return acc;
		},
		[]
	);

	const isNotProduction = config( 'env_id' ) !== 'a8c-for-agencies-production';

	const openSitePreviewPane = useCallback(
		( site: Site ) => {
			if ( site.sticker?.includes( 'migration-in-progress' ) && ! isNotProduction ) {
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
		( column: AllowedTypes, item: SiteInfo ) => {
			if ( isLoading ) {
				return <TextPlaceholder />;
			}

			if ( item.site.type === 'error' ) {
				return <div className="sites-dataview__site-error"></div>;
			}

			if ( column ) {
				return (
					<>
						{ item.site.error && <span className="sites-dataview__site-error-span"></span> }
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
	const [ actionsRef ] = useState< HTMLElement | null >();

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
						<SiteSort isSortable columnKey="site">
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

					const isA4APluginInstalled = site.enabled_plugin_slugs?.includes( A4A_PLUGIN_SLUG );

					if ( item.site.type === 'error' ) {
						return (
							<SiteErrorColumn
								isA4APluginInstalled={ isA4APluginInstalled }
								openSitePreviewPane={ () => openSitePreviewPane( item.site.value ) }
							/>
						);
					}

					const isDevSite = item.isDevSite ?? false;

					return (
						<>
							{ item.site.error && <span className="sites-dataview__site-error-span"></span> }
							<SiteDataField
								site={ site }
								isLoading={ isLoading }
								isDevSite={ isDevSite }
								onSiteTitleClick={ openSitePreviewPane }
							/>
						</>
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

					if ( item.site.type === 'error' ) {
						return <div className="sites-dataview__site-error"></div>;
					}

					return (
						<>
							{ item.site.error && <span className="sites-dataview__site-error-span"></span> }
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
			{
				id: 'actions',
				getValue: ( { item }: { item: SiteInfo } ) => item.isFavorite,
				render: ( { item }: { item: SiteInfo } ) => {
					if ( isLoading ) {
						return <TextPlaceholder />;
					}

					if ( item.site.type === 'error' ) {
						return <div className="sites-dataview__site-error"></div>;
					}

					const isDevSite = item.isDevSite ?? false;

					return (
						<>
							{ item.site.error && <span className="sites-dataview__site-error-span"></span> }
							{ /* eslint-disable-next-line jsx-a11y/no-static-element-interactions */ }
							<div
								className="sites-dataviews__actions"
								onClick={ ( e: MouseEvent ) => e.stopPropagation() }
								onKeyDown={ ( e: KeyboardEvent ) => e.stopPropagation() }
							>
								{ ( ! item.site.value.sticker?.includes( 'migration-in-progress' ) ||
									isNotProduction ) && (
									<>
										{ ! item.site.error && (
											<SiteActions
												isLargeScreen={ isLargeScreen }
												isDevSite={ isDevSite }
												site={ item.site }
												siteError={ item.site.error }
												onRefetchSite={ onRefetchSite }
											/>
										) }
									</>
								) }
							</div>
						</>
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
			isNotProduction,
			isLargeScreen,
			onRefetchSite,
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
		onSelectionChange: ( [ item ]: SiteData[] ) => openSitePreviewPane( item.site.value ),
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

	// Actions: Pause Monitor, Resume Monitor, Custom Notification, Reset Notification
	// todo: Currently not in use until bulk selections are properly implemented.
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	/*const actions = useMemo(
		() => [
			{
				id: 'pause-monitor',
				label: translate( 'Pause Monitor' ),
				supportsBulk: true,
				isEligible( site: SiteInfo ) {
					return site.monitor.status === 'active';
				},
				callback() {
					// todo: pause monitor. Param: sites: SiteInfo[]
				},
			},
			{
				id: 'resume-monitor',
				label: translate( 'Resume Monitor' ),
				supportsBulk: true,
				isEligible( site: SiteInfo ) {
					return site.monitor.status === 'inactive';
				},
				callback() {
					// todo: resume monitor. Param: sites: SiteInfo[]
				},
			},
			{
				id: 'custom-notification',
				label: translate( 'Custom Notification' ),
				supportsBulk: true,
				isEligible( site: SiteInfo ) {
					return site.monitor.status === 'active';
				},
				callback() {
					// todo: custom notification. Param: sites: SiteInfo[]
				},
			},
			{
				id: 'reset-notification',
				label: translate( 'Reset Notification' ),
				supportsBulk: true,
				isEligible( site: SiteInfo ) {
					return site.monitor.status === 'active';
				},
				callback() {
					// todo: reset notification. Param: sites: SiteInfo[]
				},
			},
		],
		[ translate ]
	);*/

	// Update the data packet
	useEffect( () => {
		setItemsData( ( prevState: ItemsDataViewsType< SiteData > ) => ( {
			...prevState,
			items: sites,
			fields: fields,
			//actions: actions,
			pagination: {
				totalItems: totalSites,
				totalPages: totalPages,
			},
			setDataViewsState: setDataViewsState,
			dataViewsState: dataViewsState,
			selectedItem: dataViewsState.selectedItem,
		} ) );
	}, [ fields, dataViewsState, setDataViewsState, data ] ); // add actions when implemented

	return <ItemsDataViews data={ itemsData } isLoading={ isLoading } className={ className } />;
};

export default JetpackSitesDataViews;
