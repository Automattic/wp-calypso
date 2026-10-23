/**
 * @jest-environment jsdom
 */

import { getSolutionsForReason } from '../get-solutions-for-reason';

const ids = ( reason: string ) => getSolutionsForReason( reason )?.map( ( card ) => card.id );

describe( 'getSolutionsForReason', () => {
	test( 'something else related to changed needs keeps its cards', () => {
		expect( ids( 'otherNoLongerNeedSite' ) ).toEqual( [ 'change-plan', 'speak-with-support' ] );
	} );

	test.each( [ 'pluginOrThemeConflicts', 'test reason' ] )( '%s has no cards', ( reason ) => {
		expect( getSolutionsForReason( reason ) ).toBeNull();
	} );

	test.each( [
		[
			'tooExpensive',
			[
				'change-plan',
				'renew-now-pay-less',
				'switch-to-monthly',
				'switch-to-yearly',
				'speak-with-support',
			],
		],
		[ 'noMatch', [ 'change-plan', 'ask-ai-assistant', 'switch-to-monthly', 'speak-with-support' ] ],
		[
			'wrongPlan',
			[ 'change-plan', 'switch-to-monthly', 'switch-to-yearly', 'speak-with-support' ],
		],
		[ 'missingFunctionality', [ 'change-plan', 'ask-ai-assistant', 'speak-with-support' ] ],
		[ 'limitedCustomization', [ 'change-plan', 'speak-with-support' ] ],
		[ 'projectChanged', [ 'change-plan', 'ask-ai-assistant', 'speak-with-support' ] ],
	] )( '%s keeps its cards', ( reason, expected ) => {
		expect( ids( reason ) ).toEqual( expected );
	} );
} );
