import { isEnabled } from '@automattic/calypso-config';
import { Button, Gridicon, Spinner } from '@automattic/components';
import { SiteExcerptData } from '@automattic/sites';
import { DataViews } from '@wordpress/dataviews';
import { Icon, starFilled } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useContext, useMemo } from 'react';
import ReactDOM from 'react-dom';
import A4ASiteSetFavorite from 'calypso/a8c-for-agencies/sections/sites/site-set-favorite';
import SitesDashboardContext from 'calypso/a8c-for-agencies/sections/sites/sites-dashboard-context';
import SiteActions from 'calypso/sites-dashboard/sections/sites/sites-overview/site-actions';
import useFormattedSites from 'calypso/sites-dashboard/sections/sites/sites-overview/site-content/hooks/use-formatted-sites';
import SiteStatusContent from 'calypso/sites-dashboard/sections/sites/sites-overview/site-status-content';
import SiteDataField from '../sites-dataviews/site-data-field';
import { JETPACK_MANAGE_ONBOARDING_TOURS_EXAMPLE_SITE } from 'calypso/jetpack-cloud/sections/onboarding-tours/constants';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import SiteSetFavorite from '../site-set-favorite';
import SiteSort from '../site-sort';
import { AllowedTypes } from '../types';
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
	const sites = useFormattedSites( data?.sites ?? [] );

	const openSitePreviewPane = useCallback(
		( site: SiteExcerptData ) => {
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
						siteError={ item.site.error }
					/>
				);
			}
		},
		[ isLoading, isLargeScreen ]
	);

	// todo - refactor: extract fields, along actions, to the upper component
	const fields = useMemo(
		() => [
			{
				id: 'site',
				header: (
					<>
						<SiteSort isSortable={ true } columnKey="site">
							<span className="sites-dataview__site-header">
								{ translate( 'Site' ).toUpperCase() }
							</span>
						</SiteSort>
					</>
				),
				getValue: ( { item }: { item: SiteInfo } ) => item.site.value.URL,
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
				header: <span className="sites-dataview__stats-header">STATS</span>,
				getValue: () => '-',
				render: ( { item }: { item: SiteInfo } ) => renderField( 'stats', item ),
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'plan',
				header: <span className="sites-dataview__boost-header">PLAN</span>,
				getValue: ( { item }: { item: SiteInfo } ) => item.site?.value?.plan?.product_name,
				render: ( { item }: { item: SiteInfo } ) => renderField( 'plan', item ),
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'last_publish',
				header: <span className="sites-dataview__backup-header">LAST PUBLISH</span>,
				getValue: () => '-',
				render: ( { item }: { item: SiteInfo } ) => renderField( 'last_publish', item ),
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'status',
				header: <span className="sites-dataview__backup-header">STATUS</span>,
				getValue: () => '-',
				render: ( { item }: { item: SiteInfo } ) => renderField( 'status', item ),
				enableHiding: false,
				enableSorting: false,
			},
		],
		[ isLoading, isLargeScreen, openSitePreviewPane, renderField, translate ]
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
					item.id = item.site.value.ID; // setting the id because of a issue with the DataViews component
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
