/*
 * @jest-environment jsdom
 */

import { SiteGoal, SiteIntent } from '../constants';
import { goalsToIntent } from '../utils';

describe( 'Test onboard utils', () => {
	it.each( [
		{
			goals: [],
			expectedIntent: SiteIntent.Build,
		},
		{
			goals: [ SiteGoal.Write, SiteGoal.Import, SiteGoal.DIFM ],
			expectedIntent: SiteIntent.DIFM,
		},
		{
			goals: [ SiteGoal.Write, SiteGoal.Sell, SiteGoal.Promote ],
			expectedIntent: SiteIntent.Sell,
		},
		{
			goals: [ SiteGoal.Sell, SiteGoal.Write, SiteGoal.Promote ],
			expectedIntent: SiteIntent.Sell,
		},
		{
			goals: [ SiteGoal.Promote, SiteGoal.Sell, SiteGoal.Write ],
			expectedIntent: SiteIntent.Sell,
		},
	] )( 'Should map the $goals to $expectedIntent intent', ( { goals, expectedIntent } ) => {
		expect( goalsToIntent( goals ) ).toBe( expectedIntent );
	} );
} );
