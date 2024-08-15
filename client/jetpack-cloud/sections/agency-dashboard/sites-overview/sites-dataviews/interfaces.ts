import { type Site } from '../types';
import type { View } from '@wordpress/dataviews';

export interface SitesDataResponse {
	sites: Array< Site >;
	total: number;
	perPage: number;
	totalDevelopmentSites: number;
	totalFavorites: number;
}

export interface SitesDataViewsProps {
	className?: string;
	data: SitesDataResponse | undefined;
	forceTourExampleSite?: boolean;
	isLargeScreen: boolean;
	isLoading: boolean;
	onSitesViewChange: ( view: SitesViewState ) => void;
	sitesViewState: SitesViewState;
}

export type SitesViewState = View & {
	selectedSite?: Site | undefined;
};
