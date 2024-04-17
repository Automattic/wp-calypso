import { Spinner } from '@automattic/components';
import { DataViews } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import ReactDOM from 'react-dom';
// todo: extract
//import { GuidedTourStep } from 'calypso/a8c-for-agencies/components/guided-tour-step';
// todo: extract
//import SiteSetFavorite from 'calypso/a8c-for-agencies/sections/sites/site-set-favorite';
// todo: extract?? We could keep a common context through the ItemsDashboard environment.
//import SitesDashboardContext from 'calypso/a8c-for-agencies/sections/sites/sites-dashboard-context';
// todo: extract. Customizable via columns
//import SiteDataField from 'calypso/a8c-for-agencies/sections/sites/sites-dataviews/site-data-field';
// todo: extract/refactor
//import { AllowedTypes, Site } from 'calypso/a8c-for-agencies/sections/sites/types';
//import SiteActions from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-actions';
// todo: extract??
//import useFormattedSites from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-content/hooks/use-formatted-sites';
// todo: extract
//import SiteStatusContent from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-status-content';
// todo: extract
//import { JETPACK_MANAGE_ONBOARDING_TOURS_EXAMPLE_SITE } from 'calypso/jetpack-cloud/sections/onboarding-tours/constants';
// todo: extract
//import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import { ItemsDataViews, DataViewsColumn } from './interfaces';
//import SiteSort from './site-sort';
// todo: extract partially. Extract common styles
import './style.scss';

const getIdByPath = ( item: object, path: string ) => {
	const fields = path.split( '.' );
	let result: any = item;
	for ( const field of fields ) {
		if ( result[ field ] === undefined ) {
			return undefined;
		}
		result = result[ field ];
	}
	return result;
};

/**
 * Create an item column for the DataViews component
 * @param id
 * @param header
 * @param displayField
 * @param getValue
 * @param isSortable
 * @param canHide
 */
export const createItemColumn = (
	id: string,
	header: ReactNode,
	displayField: () => ReactNode,
	getValue: () => undefined,
	isSortable: boolean = false,
	canHide: boolean = false
): DataViewsColumn => {
	return {
		id,
		enableSorting: isSortable,
		enableHiding: canHide,
		getValue,
		header,
		render: displayField,
	};
};

export type ItemsDataViewsProps = {
	data: ItemsDataViews;
	isLoading?: boolean;
	// todo: is it necessary? Could we get it in this component?
	isLargeScreen?: boolean;
	className?: string;
};

const ItemsDataViews = ( {
	data,
	isLoading = false,
	// todo: extract
	//forceTourExampleSite = false,
	className,
}: ItemsDataViewsProps ) => {
	const translate = useTranslate();

	// todo: update/extract. We have to receive info about the total pages via props
	//const { showOnlyFavorites } = useContext( SitesDashboardContext );
	//const totalSites = showOnlyFavorites ? data?.totalFavorites || 0 : data?.total || 0;
	//const sitesPerPage = sitesViewState.perPage > 0 ? sitesViewState.perPage : 20;
	//const totalPages = Math.ceil( totalSites / sitesPerPage );

	// todo: extract
	//const sites = useFormattedSites( data?.sites ?? [] );

	// todo: extract
	/*const openSitePreviewPane = useCallback(
		( site: Site ) => {
			onSitesViewChange( {
				...sitesViewState,
				selectedSite: site,
				type: 'list',
			} );
		},
		[ onSitesViewChange, sitesViewState ]
	);*/

	// todo: extract
	/*const renderField = useCallback(
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
	);*/

	// todo: extract
	// Legacy refs for guided tour popovers
	/*
	const [ introRef, setIntroRef ] = useState< HTMLElement | null >();
	const [ statsRef, setStatsRef ] = useState< HTMLElement | null >();
	const [ boostRef, setBoostRef ] = useState< HTMLElement | null >();
	const [ backupRef, setBackupRef ] = useState< HTMLElement | null >();
	const [ monitorRef, setMonitorRef ] = useState< HTMLElement | null >();
	const [ scanRef, setScanRef ] = useState< HTMLElement | null >();
	const [ pluginsRef, setPluginsRef ] = useState< HTMLElement | null >();
	const [ actionsRef, setActionsRef ] = useState< HTMLElement | null >();
  */

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
	}

	// todo: extract
	//const urlParams = new URLSearchParams( window.location.search );
	//const isOnboardingTourActive = urlParams.get( 'tour' ) !== null;
	//const useExampleDataForTour = forceTourExampleSite || ( isOnboardingTourActive && ( ! sites || sites.length === 0 ) );

	return (
		<div className={ className }>
			<DataViews
				// todo: extract => data={ ! useExampleDataForTour ? sites : JETPACK_MANAGE_ONBOARDING_TOURS_EXAMPLE_SITE }
				data={ data.items }
				// todo: extract
				//paginationInfo={ { totalItems: totalSites, totalPages: totalPages } }
				paginationInfo={ data.pagination }
				fields={ data.fields }
				view={ data.dataViewsState }
				search={ true }
				searchLabel={ data.searchLabel ?? translate( 'Search' ) }
				// todo: update/extract this. DataViews should take the id info, from the item, if it exists.
				getItemId={
					data.getItemId ??
					( ( item: object ) => {
						return data.itemFieldId && getIdByPath( item, data.itemFieldId );
					} )
				}
				onChangeView={ data.onDataViewsStateChange }
				supportedLayouts={ [ 'table' ] }
				actions={ data.actions }
				isLoading={ isLoading }
			/>
		</div>
	);
};

export default ItemsDataViews;
