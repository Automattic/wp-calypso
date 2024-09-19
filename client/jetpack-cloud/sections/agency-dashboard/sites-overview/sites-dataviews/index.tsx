import { Button, Gridicon, Spinner } from '@automattic/components';
import { DataViews } from '@wordpress/dataviews';
import { Icon, starFilled } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useContext, useMemo } from 'react';
import ReactDOM from 'react-dom';
import SitesDashboardContext from 'calypso/a8c-for-agencies/sections/sites/sites-dashboard-context';
import SiteActions from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-actions';
import useFormattedSites from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-content/hooks/use-formatted-sites';
import SiteStatusContent from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-status-content';
import SiteDataField from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/sites-dataviews/site-data-field';
import { JETPACK_MANAGE_ONBOARDING_TOURS_EXAMPLE_SITE } from 'calypso/jetpack-cloud/sections/onboarding-tours/constants';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import SiteSetFavorite from '../site-set-favorite';
import SiteSort from '../site-sort';
import { AllowedTypes, Site, SiteData } from '../types';
import { SitesDataViewsProps } from './interfaces';
import type { Field } from '@wordpress/dataviews';

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
	const sitesPerPage =
		sitesViewState.perPage && sitesViewState.perPage > 0 ? sitesViewState.perPage : 20;
	const totalPages = Math.ceil( totalSites / sitesPerPage );
	const sites = useFormattedSites( data?.sites ?? [] );

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

	// todo - refactor: extract fields, along actions, to the upper component
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
							<span className="sites-dataview__site-header">
								{ translate( 'Site' ).toUpperCase() }
							</span>
						</SiteSort>
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
				label: <span className="sites-dataview__stats-header">STATS</span>,
				getValue: () => '-',
				render: ( { item }: { item: SiteData } ) => renderField( 'stats', item ),
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'boost',
				// @ts-expect-error -- Need to fix the label type upstream in @wordpress/dataviews to support React elements.
				label: <span className="sites-dataview__boost-header">BOOST</span>,
				getValue: ( { item }: { item: SiteData } ) => item.boost.status,
				render: ( { item }: { item: SiteData } ) => renderField( 'boost', item ),
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'backup',
				// @ts-expect-error -- Need to fix the label type upstream in @wordpress/dataviews to support React elements.
				label: <span className="sites-dataview__backup-header">BACKUP</span>,
				getValue: () => '-',
				render: ( { item }: { item: SiteData } ) => renderField( 'backup', item ),
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'monitor',
				// @ts-expect-error -- Need to fix the label type upstream in @wordpress/dataviews to support React elements.
				label: <span className="sites-dataview__monitor-header">MONITOR</span>,
				getValue: () => '-',
				render: ( { item }: { item: SiteData } ) => renderField( 'monitor', item ),
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'scan',
				// @ts-expect-error -- Need to fix the label type upstream in @wordpress/dataviews to support React elements.
				label: <span className="sites-dataview__scan-header">SCAN</span>,
				getValue: () => '-',
				render: ( { item }: { item: SiteData } ) => renderField( 'scan', item ),
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'plugins',
				// @ts-expect-error -- Need to fix the label type upstream in @wordpress/dataviews to support React elements.
				label: <span className="sites-dataview__plugins-header">PLUGINS</span>,
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
							>
								<Gridicon icon="chevron-right" />
							</Button>
						</div>
					);
				},
				enableHiding: false,
				enableSorting: false,
			},
		],
		[ isLoading, isLargeScreen, openSitePreviewPane, renderField, translate ]
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
				view={ sitesViewState }
				search
				searchLabel={ translate( 'Search for sites' ) }
				getItemId={ ( item: SiteData ) => {
					return item.site.value.blog_id.toString();
				} }
				onChangeView={ onSitesViewChange }
				defaultLayouts={ { table: {} } }
				actions={ [] } // Replace with actions when bulk selections are implemented.
				isLoading={ isLoading }
			/>
		</div>
	);
};

export default SitesDataViews;
