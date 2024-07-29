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
	| 'xanga'
	| 'substack';
export type ImporterPlatformExtra = 'godaddy-central';
export type ImporterPlatform =
	| ImporterMainPlatform
	| ImporterPlatformOther
	| ImporterPlatformExtra
	| 'unknown';
