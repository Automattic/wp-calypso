import { Onboard } from '@automattic/data-stores';
import { Category } from '@automattic/design-picker';

const CATEGORY_BLOG = 'blog';
const CATEGORY_STORE = 'store';
const CATEGORY_BUSINESS = 'business';
const CATEGORY_COMMUNITY_NON_PROFIT = 'community-non-profit';
const CATEGORY_PORTFOLIO = 'portfolio';
const CATEGORY_AUTHORS_WRITERS = 'authors-writers';
const CATEGORY_EDUCATION = 'education';
const CATEGORY_ENTERTAINMENT = 'entertainment';

/**
 * Ensures the category appears at the top of the design category list
 * (directly below the Show All filter).
 */
function makeSortCategoryToTop( slug: string ) {
	return ( a: Category, b: Category ) => {
		if ( a.slug === b.slug ) {
			return 0;
		} else if ( a.slug === slug ) {
			return -1;
		} else if ( b.slug === slug ) {
			return 1;
		}
		return 0;
	};
}

const sortBlogToTop = makeSortCategoryToTop( CATEGORY_BLOG );
const sortStoreToTop = makeSortCategoryToTop( CATEGORY_STORE );
const sortBusinessToTop = makeSortCategoryToTop( CATEGORY_BUSINESS );

export function getCategorizationOptions(
	intent: string,
	goals: Onboard.SiteGoal[],
	useGoals: boolean
) {
	if ( useGoals ) {
		return getCategorizationFromGoals( goals );
	}
	return getCategorizationFromIntent( intent );
}

function getCategorizationFromIntent( intent: string ) {
	const result = {
		defaultSelection: null,
	} as {
		defaultSelection: string | null;
		sort: ( a: Category, b: Category ) => 0 | 1 | -1;
	};

	switch ( intent ) {
		case 'write':
			return {
				...result,
				defaultSelection: CATEGORY_BLOG,
				sort: sortBlogToTop,
			};
		case 'sell':
			return {
				...result,
				defaultSelection: CATEGORY_STORE,
				sort: sortStoreToTop,
			};
		case 'build':
			return {
				...result,
				defaultSelection: CATEGORY_BUSINESS,
				sort: sortBusinessToTop,
			};
		default:
			return {
				...result,
				sort: sortBlogToTop,
			};
	}
}

function getCategorizationFromGoals( goals: Onboard.SiteGoal[] ) {
	// Sorted according to which theme category makes the most consequential impact
	// on the user's site e.g. if you want a store, then choosing a Woo compatible
	// theme is more important than choosing a theme that is good for blogging.
	// Missing categories are treated as equally inconsequential.
	const mostConsequentialDesignCategories = [
		CATEGORY_STORE,
		CATEGORY_EDUCATION,
		CATEGORY_COMMUNITY_NON_PROFIT,
		CATEGORY_ENTERTAINMENT,
		CATEGORY_PORTFOLIO,
		CATEGORY_BLOG,
		CATEGORY_AUTHORS_WRITERS,
	];

	const defaultSelection =
		goals
			.map( getGoalsPreferredCategory )
			.sort( ( a, b ) => {
				let aIndex = mostConsequentialDesignCategories.indexOf( a );
				let bIndex = mostConsequentialDesignCategories.indexOf( b );

				// If the category is not in the list, it should be sorted to the end.
				if ( aIndex === -1 ) {
					aIndex = mostConsequentialDesignCategories.length;
				}
				if ( bIndex === -1 ) {
					bIndex = mostConsequentialDesignCategories.length;
				}

				return aIndex - bIndex;
			} )
			.shift() ?? CATEGORY_BUSINESS;

	return {
		defaultSelection,
		sort: makeSortCategoryToTop( defaultSelection ),
	};
}

function getGoalsPreferredCategory( goal: Onboard.SiteGoal ): string {
	switch ( goal ) {
		case Onboard.SiteGoal.Write:
			return CATEGORY_BLOG;

		case Onboard.SiteGoal.CollectDonations:
		case Onboard.SiteGoal.BuildNonprofit:
			return CATEGORY_COMMUNITY_NON_PROFIT;

		case Onboard.SiteGoal.Porfolio:
			return CATEGORY_PORTFOLIO;

		case Onboard.SiteGoal.Newsletter:
		case Onboard.SiteGoal.PaidSubscribers:
			return CATEGORY_AUTHORS_WRITERS;

		case Onboard.SiteGoal.SellDigital:
		case Onboard.SiteGoal.SellPhysical:
		case Onboard.SiteGoal.Sell:
			return CATEGORY_STORE;

		case Onboard.SiteGoal.Courses:
			return CATEGORY_EDUCATION;

		case Onboard.SiteGoal.Videos:
		case Onboard.SiteGoal.AnnounceEvents:
			return CATEGORY_ENTERTAINMENT;

		case Onboard.SiteGoal.Engagement:
		case Onboard.SiteGoal.Promote:
		case Onboard.SiteGoal.ContactForm:
		case Onboard.SiteGoal.Import:
		case Onboard.SiteGoal.ImportSubscribers:
		case Onboard.SiteGoal.Other:
		case Onboard.SiteGoal.DIFM:
			return CATEGORY_BUSINESS;
	}
}
