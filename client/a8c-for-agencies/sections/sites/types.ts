export interface SitesDashboardContextInterface {
	selectedCategory?: string;
	setSelectedCategory: ( category: string ) => void;

	selectedSiteUrl?: string;
	setSelectedSiteUrl: ( siteUrl: string ) => void;

	selectedSiteFeature?: string;
	setSelectedSiteFeature: ( siteFeature: string ) => void;

	hideListing?: boolean;
	setHideListing: ( hideListing: boolean ) => void;
}
