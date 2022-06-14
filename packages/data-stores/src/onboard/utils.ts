import { SiteGoal, SiteIntent } from './constants';

const INTENT_DECIDING_GOALS = [ SiteGoal.Write, SiteGoal.Sell, SiteGoal.Promote ] as const;
type IntentDecidingGoal = typeof INTENT_DECIDING_GOALS[ number ];

const GOAL_TO_INTENT_MAP: { [ key in IntentDecidingGoal ]: SiteIntent } = {
	[ SiteGoal.Write ]: SiteIntent.Write,
	[ SiteGoal.Sell ]: SiteIntent.Sell,
	[ SiteGoal.Promote ]: SiteIntent.Build,
};

export const goalsToIntent = ( goals: SiteGoal[] ): SiteIntent => {
	// Including DIFM goal overwrites any other goal selection made
	if ( goals.includes( SiteGoal.DIFM ) ) {
		return SiteIntent.DIFM;
	}

	const intentDecidingGoal = ( goals as IntentDecidingGoal[] ).find( ( goal ) =>
		INTENT_DECIDING_GOALS.includes( goal )
	);

	if ( intentDecidingGoal ) {
		return GOAL_TO_INTENT_MAP[ intentDecidingGoal ];
	}

	return SiteIntent.Build;
};
