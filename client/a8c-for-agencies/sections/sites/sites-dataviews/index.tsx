import { Button, Gridicon, Spinner } from '@automattic/components';
import { Icon, starFilled } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useContext, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { GuidedTourStep } from 'calypso/a8c-for-agencies/components/guided-tour-step';
import { DATAVIEWS_LIST } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import SiteSetFavorite from 'calypso/a8c-for-agencies/sections/sites/site-set-favorite';
import SiteSort from 'calypso/a8c-for-agencies/sections/sites/site-sort';
import SitesDashboardContext from 'calypso/a8c-for-agencies/sections/sites/sites-dashboard-context';
import SiteDataField from 'calypso/a8c-for-agencies/sections/sites/sites-dataviews/site-data-field';
import { DataViews } from 'calypso/components/dataviews';
import useFormattedSites from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-content/hooks/use-formatted-sites';
import SiteStatusContent from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-status-content';
import { JETPACK_MANAGE_ONBOARDING_TOURS_EXAMPLE_SITE } from 'calypso/jetpack-cloud/sections/onboarding-tours/constants';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import SiteActions from '../site-actions';
import { AllowedTypes, Site, SiteData } from '../types';
import { SitesDataViewsProps } from './interfaces';
import type { Field } from '@wordpress/dataviews';

import './style.scss';

const SitesDataViews = ( {
	data,
	isLoading,
	isLargeScreen,
	setDataViewsState,
	dataViewsState,
	forceTourExampleSite = false,
	className,
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
	const sitesPerPage = dataViewsState.perPage && dataViewsState.perPage > 0 ? dataViewsState.perPage : 20;
	const totalPages = Math.ceil( totalSites / sitesPerPage );
	const sites = useFormattedSites( data?.sites ?? [] );

	const openSitePreviewPane = useCallback(
		( site: Site ) => {
			setDataViewsState( ( prevState: DataViewsState ) => ( {
				...prevState,
				selectedItem: site,
				type: DATAVIEWS_LIST,
			} ) );
		},
		[ setDataViewsState ]
	);

	const renderField = useCallback(
		( column: AllowedTypes, item: SiteData ) => {
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
	const fields = useMemo< Field< SiteData >[] >(
		() => [
			{
				id: 'status',
				label: translate( 'Status' ),
				getValue: ( { item }: { item: SiteData } ) =>
					item.site.error || item.scan.status === 'critical',
				render: () => {
					return null;
				},
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
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'site',
				// @ts-expect-error -- Need to fix the label type upstream in @wordpress/dataviews to support React elements.
				label: (
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
				getValue: ( { item }: { item: SiteData } ) => item.site.value.url,
				render: ( { item }: { item: SiteData } ) => {
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
				getValue: ( { item }: { item: SiteData } ) => item.isFavorite,
				render: ( { item }: { item: SiteData } ) => {
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
				// @ts-expect-error -- Need to fix the label type upstream in @wordpress/dataviews to support React elements.
				label: (
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
				isEligible( site: SiteData ) {
					return site.monitor.status === 'active';
				},
				callback() {
					// todo: pause monitor. Param: sites: SiteData[]
				},
			},
			{
				id: 'resume-monitor',
				label: translate( 'Resume Monitor' ),
				supportsBulk: true,
				isEligible( site: SiteData ) {
					return site.monitor.status === 'inactive';
				},
				callback() {
					// todo: resume monitor. Param: sites: SiteData[]
				},
			},
			{
				id: 'custom-notification',
				label: translate( 'Custom Notification' ),
				supportsBulk: true,
				isEligible( site: SiteData ) {
					return site.monitor.status === 'active';
				},
				callback() {
					// todo: custom notification. Param: sites: SiteData[]
				},
			},
			{
				id: 'reset-notification',
				label: translate( 'Reset Notification' ),
				supportsBulk: true,
				isEligible( site: SiteData ) {
					return site.monitor.status === 'active';
				},
				callback() {
					// todo: reset notification. Param: sites: SiteData[]
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
				view={ dataViewsState }
				search
				searchLabel={ translate( 'Search for sites' ) }
				getItemId={ ( item: SiteData ) => {
					return item.site.value.blog_id.toString();
				} }
				onChangeView={ ( view ) => setDataViewsState( () => view ) }
				defaultLayouts={ { table: {} } }
				actions={ [] } // Replace with actions when bulk selections are implemented.
				isLoading={ isLoading }
			/>
		</div>
	);
};

export default SitesDataViews;
