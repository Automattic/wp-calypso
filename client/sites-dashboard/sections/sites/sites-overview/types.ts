import { SiteDetailsPlan } from '@automattic/data-stores';
import { SiteExcerptData } from '@automattic/sites';
import { TranslateResult } from 'i18n-calypso';

// All types based on which the data is populated on the agency dashboard table rows
export type AllowedTypes = 'site' | 'stats' | 'plan' | 'status' | 'last_publish';

// Site column object which holds key and title of each column
export type SiteColumns = Array< {
	key: AllowedTypes;
	title: string;
	className?: string;
	isExpandable?: boolean;
	isSortable?: boolean;
	showInfo?: boolean;
} >;

export type AllowedStatusTypes =
	| 'active'
	| 'inactive'
	| 'progress'
	| 'failed'
	| 'warning'
	| 'success'
	| 'disabled'
	| 'critical';

export interface SiteNode {
	value: SiteExcerptData;
	error: boolean;
	type: AllowedTypes;
	status: AllowedStatusTypes;
}
export interface SiteData {
	site: SiteNode;
	stats: StatsNode;
	plan: SiteDetailsPlan;
	status: string;
	last_publish: string;
}

export interface RowMetaData {
	row: {
		value: SiteExcerptData | string;
		status: AllowedStatusTypes;
	};
	link: string;
	isExternalLink: boolean;
	tooltip?: TranslateResult;
	tooltipId: string;
	siteDown?: boolean;
	isSupported: boolean;
	eventName: string | undefined;
}

export type PreferenceType = 'dismiss' | 'view' | 'view_date';

export type Preference = {
	dismiss?: boolean;
	view?: boolean;
	view_date?: string;
};

export interface DashboardSortInterface {
	field: string;
	direction: 'asc' | 'desc' | '';
}
export interface DashboardOverviewContextInterface {
	path: string;
	search: string;
	currentPage: number;
	filter: { siteStatus: Array< DashboardFilterOption > };
	sort: DashboardSortInterface;
	showSitesDashboardV2: boolean;
}

export interface SitesOverviewContextInterface extends DashboardOverviewContextInterface {
	isBulkManagementActive: boolean;
	setIsBulkManagementActive: ( value: boolean ) => void;
	selectedSites: Array< SiteExcerptData >;
	setSelectedSites: ( value: Array< SiteExcerptData > ) => void;
	currentLicenseInfo: string | null;
	showLicenseInfo: ( license: string ) => void;
	hideLicenseInfo: () => void;
	mostRecentConnectedSite: string | null;
	setMostRecentConnectedSite: ( mostRecentConnectedSite: string ) => void;
	isPopoverOpen: boolean;
	setIsPopoverOpen: React.Dispatch< React.SetStateAction< boolean > >;
}

export interface StatsNode {
	type: AllowedTypes;
	status: AllowedStatusTypes;
	value: SiteStats;
}

interface StatsObject {
	total: number;
	trend: 'up' | 'down' | 'same';
	trend_change: number;
}
export interface SiteStats {
	views: StatsObject;
	visitors: StatsObject;
}

export interface DashboardDataContextInterface {
	isLargeScreen: boolean;
}

export type DashboardFilterOption =
	| 'all_sites'
	| 'public'
	| 'private'
	| 'coming_soon'
	| 'redirect'
	| 'deleted';

export interface DashboardFilterMap {
	filterType: DashboardFilterOption;
	ref: number;
}

export type DashboardFilter = {
	siteStatus: Array< DashboardFilterOption >;
};

export interface APIError {
	status: number;
	code: string | null;
	message: string;
	data?: any;
}
