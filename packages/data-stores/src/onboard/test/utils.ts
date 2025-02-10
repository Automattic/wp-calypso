/*
 * @jest-environment jsdom
 */

import config from '@automattic/calypso-config';
import { SiteGoal, SiteIntent } from '../constants';
import { goalsToIntent } from '../utils';

jest.mock( '@automattic/calypso-config' );

describe( 'Test onboard utils', () => {
	beforeEach( () => {
		( config.isEnabled as jest.Mock ).mockReset();
	} );

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
			expectedIntent: SiteIntent.Write,
			isIntentNewsletterGoalsEnabled: false,
		},
		{
			goals: [ SiteGoal.Write, SiteGoal.Newsletter ],
			expectedIntent: SiteIntent.NewsletterGoal,
			isIntentNewsletterGoalsEnabled: true,
		},
		{
			goals: [ SiteGoal.Sell, SiteGoal.Newsletter ],
			expectedIntent: SiteIntent.Sell,
			isIntentNewsletterGoalsEnabled: false,
		},
		{
			goals: [ SiteGoal.Sell, SiteGoal.Newsletter ],
			expectedIntent: SiteIntent.NewsletterGoal,
			isIntentNewsletterGoalsEnabled: true,
		},
	] )(
		'Should map the $goals to $expectedIntent intent ($featureFlags)',
		( { goals, expectedIntent, featureFlags = {}, isIntentNewsletterGoalsEnabled = false } ) => {
			( config.isEnabled as jest.Mock ).mockImplementation( ( flag ) =>
				Boolean( featureFlags[ flag ] )
			);
			expect( goalsToIntent( goals, isIntentNewsletterGoalsEnabled ) ).toBe( expectedIntent );
		}
	);
} );
