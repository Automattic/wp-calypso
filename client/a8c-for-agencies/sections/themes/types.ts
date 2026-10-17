export interface SiteTheme {
	id: string;
	name: string;
	version: string;
	active: boolean;
	autoupdate: boolean;
	update: { new_version: string } | null;
	author?: string;
	screenshot?: string;
}

export interface SiteThemesApiResponse {
	found: number;
	themes: SiteTheme[];
}

export interface ThemeSiteInstance {
	siteId: number;
	siteTitle: string;
	siteUrl: string;
	version: string;
	active: boolean;
	newVersion: string | null;
}

export const THEME_STATUS = {
	ACTIVE: 'active',
	INACTIVE: 'inactive',
	UPDATE: 'update',
} as const;

export interface AggregatedTheme {
	id: string;
	name: string;
	author?: string;
	screenshot?: string;
	status: string[];
	sites: ThemeSiteInstance[];
	pendingUpdates: ThemeSiteInstance[];
}

export interface ThemesDashboardSite {
	ID: number;
	title: string;
	URL: string;
}
