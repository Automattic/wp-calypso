import { Onboard } from '@automattic/data-stores';
import { Category } from '@automattic/design-picker';

const CATEGORIES = {
	/**
	 * Features
	 */
	BLOG: 'blog',
	NEWSLETTER: 'newsletter',
	PORTFOLIO: 'portfolio',
	PODCAST: 'podcast',
	STORE: 'store',

	/**
	 * Subjects
	 */
	BUSINESS: 'business',
	COMMUNITY_NON_PROFIT: 'community-non-profit',
	AUTHORS_WRITERS: 'authors-writers',
	EDUCATION: 'education',
	ENTERTAINMENT: 'entertainment',
	EVENTS: 'events',
	LINK_IN_BIO: 'link-in-bio',
};

const GOALS_TO_CATEGORIES: { [ key in Onboard.SiteGoal ]: string[] } = {
	[ Onboard.SiteGoal.Write ]: [ CATEGORIES.BLOG, CATEGORIES.NEWSLETTER ],
	[ Onboard.SiteGoal.Courses ]: [ CATEGORIES.EDUCATION ],
	[ Onboard.SiteGoal.AnnounceEvents ]: [ CATEGORIES.EVENTS ],
	[ Onboard.SiteGoal.Porfolio ]: [ CATEGORIES.PORTFOLIO ],
	[ Onboard.SiteGoal.PaidSubscribers ]: [ CATEGORIES.NEWSLETTER, CATEGORIES.BLOG ],
	[ Onboard.SiteGoal.Promote ]: [ CATEGORIES.BUSINESS, CATEGORIES.LINK_IN_BIO ],
	[ Onboard.SiteGoal.CollectDonations ]: [ CATEGORIES.COMMUNITY_NON_PROFIT ],
	[ Onboard.SiteGoal.Newsletter ]: [ CATEGORIES.NEWSLETTER, CATEGORIES.BLOG ],
	[ Onboard.SiteGoal.Engagement ]: [
		CATEGORIES.PODCAST,
		CATEGORIES.BLOG,
		CATEGORIES.NEWSLETTER,
		CATEGORIES.LINK_IN_BIO,
	],
	[ Onboard.SiteGoal.SellPhysical ]: [ CATEGORIES.STORE ],
	[ Onboard.SiteGoal.Videos ]: [ CATEGORIES.PORTFOLIO ],
	[ Onboard.SiteGoal.ContactForm ]: [ CATEGORIES.BUSINESS ],
	[ Onboard.SiteGoal.BuildNonprofit ]: [ CATEGORIES.COMMUNITY_NON_PROFIT, CATEGORIES.EDUCATION ],
	[ Onboard.SiteGoal.SellDigital ]: [ CATEGORIES.STORE, CATEGORIES.BUSINESS ],

	// The following goals are deprecated. They are no longer availabe in the goals
	// signup step, but existing sites still use them.
	[ Onboard.SiteGoal.Sell ]: [ CATEGORIES.STORE ],
	[ Onboard.SiteGoal.DIFM ]: [ CATEGORIES.BUSINESS ],
	[ Onboard.SiteGoal.Import ]: [ CATEGORIES.BUSINESS ],
	[ Onboard.SiteGoal.ImportSubscribers ]: [ CATEGORIES.BUSINESS ],
	[ Onboard.SiteGoal.Other ]: [ CATEGORIES.BUSINESS ],
};

/**
 * Ensures the category appears at the top of the design category list
 * (directly below the Show All filter).
 */
function makeSortCategoryToTop( slugs: string[] ) {
	const slugsSet = new Set( slugs );

	return ( a: Category, b: Category ) => {
		if ( slugsSet.has( a.slug ) && slugsSet.has( b.slug ) ) {
			return 0;
		} else if ( slugsSet.has( a.slug ) ) {
			return -1;
		} else if ( slugsSet.has( b.slug ) ) {
			return 1;
		}

		return 0;
	};
}

const sortBlogToTop = makeSortCategoryToTop( [ CATEGORIES.BLOG ] );
const sortStoreToTop = makeSortCategoryToTop( [ CATEGORIES.STORE ] );
const sortBusinessToTop = makeSortCategoryToTop( [ CATEGORIES.BUSINESS ] );

export function getCategorizationOptions(
	intent: string,
	goals: Onboard.SiteGoal[],
	options: {
		useGoals?: boolean;
		isMultiSelection?: boolean;
	} = {}
) {
	if ( options.useGoals ) {
		return getCategorizationFromGoals( goals, options.isMultiSelection );
	}
	return getCategorizationFromIntent( intent );
}

function getCategorizationFromIntent( intent: string ) {
	const result = {
		defaultSelections: [] as string[],
	} as {
		defaultSelections: string[];
		sort: ( a: Category, b: Category ) => 0 | 1 | -1;
	};

	switch ( intent ) {
		case 'write':
			return {
				...result,
				defaultSelections: [ CATEGORIES.BLOG ],
				sort: sortBlogToTop,
			};
		case 'sell':
			return {
				...result,
				defaultSelections: [ CATEGORIES.STORE ],
				sort: sortStoreToTop,
			};
		case 'build':
			return {
				...result,
				defaultSelections: [ CATEGORIES.BUSINESS ],
				sort: sortBusinessToTop,
			};
		default:
			return {
				...result,
				sort: sortBlogToTop,
			};
	}
}

function getCategorizationFromGoals(
	goals: Onboard.SiteGoal[],
	isMultiSelection: boolean = false
) {
	const defaultSelections = Array.from(
		new Set(
			goals
				.map( ( goal ) => {
					const preferredCategories = getGoalsPreferredCategories( goal );
					return isMultiSelection ? preferredCategories : preferredCategories.slice( 0, 1 );
				} )
				.flat() ?? [ CATEGORIES.BUSINESS ]
		)
	);

	return {
		defaultSelections,
		sort: makeSortCategoryToTop( defaultSelections ),
	};
}

function getGoalsPreferredCategories( goal: Onboard.SiteGoal ): string[] {
	return GOALS_TO_CATEGORIES[ goal ] || [];
}
