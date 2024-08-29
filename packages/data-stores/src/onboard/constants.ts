export const STORE_KEY = 'automattic/onboard';

export enum SiteGoal {
	Write = 'write',
	Sell = 'sell',
	Promote = 'promote',
	DIFM = 'difm', // "Do It For Me"
	Import = 'import',
	ImportSubscribers = 'import-subscribers',
	Other = 'other',
	PaidSubscribers = 'paid-subscribers',
}

export enum SiteIntent {
	Write = 'write',
	StartWriting = 'start-writing',
	Sell = 'sell',
	Build = 'build',
	DIFM = 'difm', // "Do It For Me"
	WpAdmin = 'wpadmin',
	Import = 'import', // deprecated
	WithThemeAssembler = 'with-theme-assembler',
	AssemblerFirst = 'assembler-first',
	ReadyMadeTemplate = 'readymade-template',
	AIAssembler = 'ai-assembler',
	Newsletter = 'newsletter',
	FreePostSetup = 'free-post-setup', // non-signup flow
	SiteMigration = 'site-migration',
	LinkInBioPostSetup = 'link-in-bio-post-setup', // non-signup flow
	NewsletterPostSetup = 'newsletter-post-setup', // non-signup flow
	UpdateDesign = 'update-design', // non-signup flow
	UpdateOptions = 'update-options', // non-signup flow
}
