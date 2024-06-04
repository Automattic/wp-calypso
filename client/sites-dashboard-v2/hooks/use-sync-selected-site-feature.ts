import page from '@automattic/calypso-router';
import { useEffect, useState } from 'react';
import type { SiteDetails } from '@automattic/data-stores';
import type { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';

export function useSyncSelectedSiteFeature( {
	selectedSite,
	initialSiteFeature,
	dataViewsState,
	featureToRouteMap,
	queryParamKeys,
}: {
	selectedSite?: SiteDetails | null;
	initialSiteFeature: string;
	dataViewsState: DataViewsState;
	featureToRouteMap: { [ key: string ]: string };
	queryParamKeys: string[];
} ) {
	const [ selectedSiteFeature, setSelectedSiteFeature ] = useState( initialSiteFeature );

	// Reset selected feature when the component is re-mounted with different initial path.
	useEffect( () => {
		setSelectedSiteFeature( initialSiteFeature );
	}, [ initialSiteFeature ] );

	const syncUrl = () => {
		const siteSlug = dataViewsState.selectedItem?.slug;
		const newSearchParams = new URLSearchParams();

		// Retain sites dashboard query params only.
		const currentSearchParams = new URL( window.location.href ).searchParams;
		queryParamKeys.forEach( ( key ) => {
			if ( currentSearchParams.has( key ) ) {
				newSearchParams.set( key, currentSearchParams.get( key ) ?? '' );
			}
		} );

		let newUrl = siteSlug
			? '/' + featureToRouteMap[ selectedSiteFeature ].replace( ':site', siteSlug )
			: '/sites';
		if ( newSearchParams.size > 0 ) {
			newUrl += '?' + newSearchParams.toString();
		}

		if ( page.current !== newUrl ) {
			page.show( newUrl );
		}
	};

	// Update URL when a new site or feature is selected.
	useEffect( () => {
		if (
			selectedSite?.slug === dataViewsState.selectedItem?.slug &&
			selectedSiteFeature === initialSiteFeature
		) {
			return;
		}

		// Whether the left sidebar should animate (grow or collapse)
		const shouldAnimate = Boolean( selectedSite ) !== Boolean( dataViewsState.selectedItem?.slug );

		window.setTimeout(
			syncUrl,
			// Delay the update while the left sidebar is animating.
			shouldAnimate ? 300 : 0
		);
	}, [ dataViewsState.selectedItem?.slug, selectedSiteFeature ] );

	return { selectedSiteFeature, setSelectedSiteFeature };
}
