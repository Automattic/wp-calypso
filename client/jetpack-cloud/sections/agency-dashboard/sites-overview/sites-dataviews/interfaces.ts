import { Site } from '../types';

export interface ViewChangeProps {
	search: string;
	sort: any;
	filters: any;
	page: number;
	selectedSite: Site | undefined;
}

export interface SitesDataViewsProps {
	data:
		| { sites: Array< Site >; total: number; perPage: number; totalFavorites: number }
		| undefined;
	isLoading: boolean;
	onViewChange: ( view: ViewChangeProps ) => void;
}
