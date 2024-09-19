import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import { Site } from '../types';

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
	setDataViewsState: ( callback: ( prevState: DataViewsState ) => DataViewsState ) => void;
	dataViewsState: DataViewsState;
	onRefetchSite?: () => Promise< unknown >;
}
