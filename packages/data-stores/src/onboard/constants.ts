export const STORE_KEY = 'automattic/onboard';

export enum SiteGoal {
	Write = 'write',
	Sell = 'sell',
	Promote = 'promote',
	DIFM = 'difm', // "Do It For Me"
	Import = 'import',
	Other = 'other',
}

export enum SiteIntent {
	Write = 'write',
	Sell = 'sell',
	Build = 'build',
	DIFM = 'difm', // "Do It For Me"
	WpAdmin = 'wpadmin',
	Import = 'import', // deprecated
	WithThemeAssembler = 'with-theme-assembler',
}
