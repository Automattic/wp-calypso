import { isEnabled } from '@automattic/calypso-config';
import { Button, Gridicon, Spinner } from '@automattic/components';
import { DataViews } from '@wordpress/dataviews';
import { Icon, starFilled } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useContext, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { GuidedTourStep } from 'calypso/a8c-for-agencies/components/guided-tour-step';
import SiteActions from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-actions';
import useFormattedSites from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-content/hooks/use-formatted-sites';
import SiteSort from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-sort';
import SiteStatusContent from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-status-content';
import SiteDataField from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/sites-dataviews/site-data-field';
import { JETPACK_MANAGE_ONBOARDING_TOURS_EXAMPLE_SITE } from 'calypso/jetpack-cloud/sections/onboarding-tours/constants';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import SiteSetFavorite from '../site-set-favorite';
import SitesDashboardContext from '../sites-dashboard-context';
import { AllowedTypes, Site } from '../types';
import { SitesDataViewsProps, SiteInfo } from './interfaces';
import './style.scss';

const SitesDataViews = ( {
	data,
	isLoading,
	isLargeScreen,
	onSitesViewChange,
	sitesViewState,
	forceTourExampleSite = false,
	className,
}: SitesDataViewsProps ) => {
	const translate = useTranslate();
	const { showOnlyFavorites } = useContext( SitesDashboardContext );
	const totalSites = showOnlyFavorites ? data?.totalFavorites || 0 : data?.total || 0;
	const sitesPerPage = sitesViewState.perPage > 0 ? sitesViewState.perPage : 20;
	const totalPages = Math.ceil( totalSites / sitesPerPage );
	const sites = useFormattedSites( data || [] );
	const isA4AEnabled = isEnabled( 'a8c-for-agencies' );

	const openSitePreviewPane = useCallback(
		( site: Site ) => {
			onSitesViewChange( {
				...sitesViewState,
				selectedSite: site,
				type: 'list',
			} );
		},
		[ onSitesViewChange, sitesViewState ]
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

	// todo - refactor: extract fields, along actions, to the upper component
	const fields = useMemo(
		() => [
			{
				id: 'status',
				header: translate( 'Status' ),
				getValue: ( { item }: { item: SiteInfo } ) =>
					item.site.error || item.scan.status === 'critical',
				render: () => {},
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
				render: ( { item }: { item: SiteInfo } ) => {
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
			isA4AEnabled,
			isLargeScreen,
		]
	);

	// Actions: Pause Monitor, Resume Monitor, Custom Notification, Reset Notification
	// todo - refactor: extract actions, along fields, to the upper component
	// Currently not in use until bulk selections are properly implemented.
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const actions = useMemo(
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
	);

	// Until the DataViews package is updated to support the spinner, we need to manually add the (loading) spinner to the table wrapper for now.
	const SpinnerWrapper = () => {
		return (
			<div className="spinner-wrapper">
				<Spinner />
			</div>
		);
	};

	const dataviewsWrapper = document.getElementsByClassName( 'dataviews-wrapper' )[ 0 ];
	if ( dataviewsWrapper ) {
		// Remove any existing spinner if present
		const existingSpinner = dataviewsWrapper.querySelector( '.spinner-wrapper' );
		if ( existingSpinner ) {
			existingSpinner.remove();
		}

		const spinnerWrapper = dataviewsWrapper.appendChild( document.createElement( 'div' ) );
		spinnerWrapper.classList.add( 'spinner-wrapper' );
		// Render the SpinnerWrapper component inside the spinner wrapper
		ReactDOM.hydrate( <SpinnerWrapper />, spinnerWrapper );
		//}
	}

	const urlParams = new URLSearchParams( window.location.search );
	const isOnboardingTourActive = urlParams.get( 'tour' ) !== null;
	const useExampleDataForTour =
		forceTourExampleSite || ( isOnboardingTourActive && ( ! sites || sites.length === 0 ) );

	return (
		<div className={ className }>
			<DataViews
				data={ ! useExampleDataForTour ? sites : JETPACK_MANAGE_ONBOARDING_TOURS_EXAMPLE_SITE }
				paginationInfo={ { totalItems: totalSites, totalPages: totalPages } }
				fields={ fields }
				view={ sitesViewState }
				search={ true }
				searchLabel={ translate( 'Search for sites' ) }
				getItemId={ ( item: SiteInfo ) => {
					item.id = item.site.value.blog_id; // setting the id because of a issue with the DataViews component
					return item.id;
				} }
				onChangeView={ onSitesViewChange }
				supportedLayouts={ [ 'table' ] }
				actions={ [] } // Replace with actions when bulk selections are implemented.
				isLoading={ isLoading }
			/>
		</div>
	);
};

export default SitesDataViews;
