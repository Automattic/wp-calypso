import { GoalKey, IntentKey } from '../constants';
import { goalsToIntent } from '../utils';

describe( 'Test onboard utils', () => {
	it.each( [
		{
			goals: [],
			expectedIntent: IntentKey.Build,
		},
		{
			goals: [ GoalKey.Write, GoalKey.Import, GoalKey.DIFM ],
			expectedIntent: IntentKey.DIFM,
		},
		{
			goals: [ GoalKey.Write, GoalKey.Sell, GoalKey.Promote ],
			expectedIntent: IntentKey.Write,
		},
		{
			goals: [ GoalKey.Sell, GoalKey.Write, GoalKey.Promote ],
			expectedIntent: IntentKey.Sell,
		},
		{
			goals: [ GoalKey.Promote, GoalKey.Sell, GoalKey.Write ],
			expectedIntent: IntentKey.Build,
		},
	] )( 'Should map the $goals to $expectedIntent intent', ( { goals, expectedIntent } ) => {
		expect( goalsToIntent( goals ) ).toBe( expectedIntent );
	} );
} );
