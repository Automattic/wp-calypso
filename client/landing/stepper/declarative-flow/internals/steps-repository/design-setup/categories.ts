import { Onboard } from '@automattic/data-stores';
import { CATEGORIES } from '@automattic/design-picker';
import type { Category } from '@automattic/design-picker';

const GOALS_TO_CATEGORIES: { [ key in Onboard.SiteGoal ]: string[] } = {
	[ Onboard.SiteGoal.Write ]: [ CATEGORIES.BLOG, CATEGORIES.NEWSLETTER ],
	[ Onboard.SiteGoal.Courses ]: [ CATEGORIES.EDUCATION ],
	[ Onboard.SiteGoal.AnnounceEvents ]: [ CATEGORIES.EVENTS ],
	[ Onboard.SiteGoal.Porfolio ]: [ CATEGORIES.PORTFOLIO ],
	[ Onboard.SiteGoal.PaidSubscribers ]: [ CATEGORIES.NEWSLETTER, CATEGORIES.BLOG ],
	[ Onboard.SiteGoal.Promote ]: [ CATEGORIES.BUSINESS ],
	[ Onboard.SiteGoal.CollectDonations ]: [ CATEGORIES.COMMUNITY_NON_PROFIT ],
	[ Onboard.SiteGoal.Newsletter ]: [ CATEGORIES.NEWSLETTER, CATEGORIES.BLOG ],
	[ Onboard.SiteGoal.Engagement ]: [ CATEGORIES.BLOG ],
	[ Onboard.SiteGoal.SellPhysical ]: [ CATEGORIES.STORE ],
	[ Onboard.SiteGoal.Videos ]: [ CATEGORIES.PORTFOLIO ],
	[ Onboard.SiteGoal.ContactForm ]: [ CATEGORIES.BUSINESS ],
	[ Onboard.SiteGoal.BuildNonprofit ]: [ CATEGORIES.COMMUNITY_NON_PROFIT, CATEGORIES.EDUCATION ],
	[ Onboard.SiteGoal.SellDigital ]: [ CATEGORIES.STORE, CATEGORIES.BUSINESS ],

	// The following goals are deprecated. They are no longer available in the goals
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

interface CategorizationOptions {
	isMultiSelection?: boolean;
}

export function getCategorizationOptions(
	goals: Onboard.SiteGoal[],
	{ isMultiSelection = false }: CategorizationOptions = {}
) {
	let defaultSelections = Array.from(
		new Set(
			goals
				.map( ( goal ) => {
					const preferredCategories = getGoalsPreferredCategories( goal );
					return isMultiSelection ? preferredCategories : preferredCategories.slice( 0, 1 );
				} )
				.flat()
		)
	);

	if ( defaultSelections.length === 0 ) {
		defaultSelections = [ CATEGORIES.BLOG ];
	}

	return {
		defaultSelections,
		sort: makeSortCategoryToTop( defaultSelections ),
	};
}

function getGoalsPreferredCategories( goal: Onboard.SiteGoal ): string[] {
	return GOALS_TO_CATEGORIES[ goal ] || [];
}
