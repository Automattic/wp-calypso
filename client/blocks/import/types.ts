export type GoToStep = ( stepName: string, stepSectionName?: string, flowName?: string ) => void;
export type GoToNextStep = () => void;
export type RecordTracksEvent = ( name: string, properties: { [ key: string ]: string } ) => void;
export type UrlData = {
	url: string;
	platform: ImporterPlatform;
	platform_data?: {
		is_wpcom: boolean;
		is_wpengine: boolean;
		is_pressable: boolean;
		slug?: string;
		name?: string;
		support_url?: string;
		homepage_url?: string;
	};
	meta: {
		favicon: string | null;
		title: string | null;
	};
};
export type MShotParams = {
	vpw?: number;
	scale?: number;
};

export type FeatureName =
	| 'tags'
	| 'posts'
	| 'pages'
	| 'pages_static'
	| 'blocks'
	| 'images'
	| 'photos'
	| 'videos'
	| 'files'
	| 'styles'
	| 'themes'
	| 'themes_custom'
	| 'colors'
	| 'fonts'
	| 'plugins';

export type FeatureList = { [ key in FeatureName ]: string };

// List of supported importer platforms (most important)
export type ImporterMainPlatform =
	| 'blogger'
	| 'medium'
	| 'squarespace'
	| 'wordpress'
	| 'wix'
	| ImporterPlatformOther;
// List of supported importer platforms (others)
export type ImporterPlatformOther =
	| 'blogroll'
	| 'ghost'
	| 'livejournal'
	| 'movabletype'
	| 'tumblr'
	| 'xanga';
export type ImporterPlatformExtra = 'godaddy-central';
export type ImporterPlatform =
	| ImporterMainPlatform
	| ImporterPlatformOther
	| ImporterPlatformExtra
	| 'unknown';
