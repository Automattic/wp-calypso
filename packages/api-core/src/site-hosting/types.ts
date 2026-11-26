export type DataCenterOption = 'bur' | 'dfw' | 'dca' | 'ams';

export const DATA_CENTER_OPTIONS: readonly DataCenterOption[] = [ 'bur', 'dfw', 'dca', 'ams' ];

export function isDataCenterOption( value: unknown ): value is DataCenterOption {
	return DATA_CENTER_OPTIONS.includes( value as DataCenterOption );
}

export interface SiteDataCenter {
	/** Where the site runs now. */
	current: DataCenterOption | null;
	/** The data center the site asked for, if any. */
	preferred: DataCenterOption | null;
	/** The data center nearest most of the site's visitors, when known. */
	recommended: DataCenterOption | null;
	/** Data centers with room for a site. */
	available: DataCenterOption[];
}

export interface WordPressTrackVersions {
	latest: string | null;
	beta: string | null;
}

export interface WordPressPrerelease {
	version: string;
	auto_enrolled: boolean;
	opted_out: boolean;
	auto_enrollable: boolean;
}
