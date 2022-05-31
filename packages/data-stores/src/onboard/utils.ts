import { GoalKey, IntentKey } from './constants';

const INTENT_DECIDING_GOALS = [ GoalKey.Write, GoalKey.Sell, GoalKey.Promote ] as const;
type IntentDecidingGoal = typeof INTENT_DECIDING_GOALS[ number ];

const GOAL_TO_INSTANT_MAP: { [ key in IntentDecidingGoal ]: IntentKey } = {
	[ GoalKey.Write ]: IntentKey.Write,
	[ GoalKey.Sell ]: IntentKey.Sell,
	[ GoalKey.Promote ]: IntentKey.Build,
};

export const goalsToIntent = ( goals: GoalKey[] ): IntentKey => {
	// Including DIFM goal overwrites any other goal selection made
	if ( goals.includes( GoalKey.DIFM ) ) {
		return IntentKey.DIFM;
	}

	const intentDecidingGoal = ( goals as IntentDecidingGoal[] ).find( ( goal ) =>
		INTENT_DECIDING_GOALS.includes( goal )
	);

	if ( intentDecidingGoal ) {
		return GOAL_TO_INSTANT_MAP[ intentDecidingGoal ];
	}

	return IntentKey.Build;
};
