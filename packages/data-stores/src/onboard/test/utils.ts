/*
 * @vitest-environment jsdom
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
		{
			goals: [ SiteGoal.Write, SiteGoal.Engagement ],
			expectedIntent: SiteIntent.Write,
		},
		{
			goals: [ SiteGoal.Write, SiteGoal.Newsletter ],
			expectedIntent: SiteIntent.NewsletterGoal,
		},
		{
			goals: [ SiteGoal.Sell, SiteGoal.Courses ],
			expectedIntent: SiteIntent.CreateCourseGoal,
			featureFlags: {
				isIntentCreateCourseGoalEnabled: true,
			},
		},
		{
			goals: [ SiteGoal.Sell, SiteGoal.Newsletter ],
			expectedIntent: SiteIntent.NewsletterGoal,
		},
	] )(
		'Should map the $goals to $expectedIntent intent ($featureFlags)',
		( { goals, expectedIntent, featureFlags } ) => {
			expect( goalsToIntent( goals, featureFlags ) ).toBe( expectedIntent );
		}
	);
} );
