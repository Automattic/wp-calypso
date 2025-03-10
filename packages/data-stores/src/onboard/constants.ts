export const STORE_KEY = 'automattic/onboard';

export enum SiteGoal {
	Write = 'write',
	Promote = 'promote',
	CollectDonations = 'collect-donations',
	BuildNonprofit = 'build-nonprofit',
	SellDigital = 'sell-digital',
	ContactForm = 'contact-form',
	PaidSubscribers = 'paid-subscribers',
	Engagement = 'engagement',
	Porfolio = 'portfolio',
	Newsletter = 'newsletter',
	SellPhysical = 'sell-physical',
	Courses = 'courses',
	Videos = 'videos',
	AnnounceEvents = 'announce-events',

	// The following goals are deprecated. They are no longer availabe in the goals
	// signup step, but existing sites still use them.
	Sell = 'sell',
	DIFM = 'difm', // "Do It For Me"
	Import = 'import',
	Other = 'other',
	ImportSubscribers = 'import-subscribers',
}

export enum SiteIntent {
	Write = 'write',
	StartWriting = 'start-writing',
	Sell = 'sell',
	Build = 'build',
	DIFM = 'difm', // "Do It For Me"
	WpAdmin = 'wpadmin',
	Import = 'import', // deprecated
	ReadyMadeTemplate = 'readymade-template',
	AIAssembler = 'ai-assembler',
	Newsletter = 'newsletter',
	NewsletterGoal = 'intent-newsletter-goal',
	CreateCourseGoal = 'create-course-goal',
	FreePostSetup = 'free-post-setup', // non-signup flow
	SiteMigration = 'site-migration',
	UpdateDesign = 'update-design', // non-signup flow
	UpdateOptions = 'update-options', // non-signup flow
}
