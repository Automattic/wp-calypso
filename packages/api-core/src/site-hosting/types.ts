export type DataCenterOption = 'bur' | 'dfw' | 'dca' | 'ams';

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
