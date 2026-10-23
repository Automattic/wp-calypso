/**
 * @jest-environment jsdom
 */

import { getSolutionsForReason, getSolutionsReason } from '../get-solutions-for-reason';

const OTHER_SUB_ANSWERS = [
	[ 'otherPriceValue', 'price/budget' ],
	[ 'otherTooHardToUse', 'tooHardToUse' ],
	[ 'otherMissingFeatures', 'missingFeatures' ],
	[ 'otherTechnicalIssues', 'technicalIssues' ],
	[ 'otherDomain', 'domain' ],
	[ 'otherWrongPlanOrSite', 'wrongPlanOrSite' ],
	[ 'otherBadSupport', 'badSupport' ],
];

const ids = ( reason: string ) => getSolutionsForReason( reason )?.map( ( card ) => card.id );

describe( 'getSolutionsForReason', () => {
	test( 'lack of flexibility offers switch to monthly before support', () => {
		expect( ids( 'lackOfCustomization' ) ).toEqual( [
			'change-plan',
			'renew-now-pay-less',
			'switch-to-monthly',
			'speak-with-support',
		] );
	} );

	test( 'core features missing offers change plan first', () => {
		expect( ids( 'coreFeaturesMissing' ) ).toEqual( [
			'change-plan',
			'find-guides',
			'ask-ai-assistant',
			'speak-with-support',
		] );
	} );

	test.each( [ 'anotherReasonOne', ...OTHER_SUB_ANSWERS.map( ( [ id ] ) => id ) ] )(
		'%s offers Ask AI and support',
		( reason ) => {
			expect( ids( reason ) ).toEqual( [ 'ask-ai-assistant', 'speak-with-support' ] );
		}
	);

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

describe( 'getSolutionsReason', () => {
	test( 'uses the sub-answer when it is picked and the box is empty', () => {
		expect( getSolutionsReason( 'otherPriceValue', undefined, 'price/budget' ) ).toBe(
			'otherPriceValue'
		);
	} );

	test.each( OTHER_SUB_ANSWERS )(
		'uses %s, not the typed text, when text is typed in its box',
		( id, parent ) => {
			expect( getSolutionsReason( 'test reason', id, parent ) ).toBe( id );
		}
	);

	test( 'uses "Another reason" when text is typed in its box', () => {
		expect( getSolutionsReason( 'test reason', undefined, 'anotherReasonOne' ) ).toBe(
			'anotherReasonOne'
		);
	} );

	test( 'keeps the typed text for something else related to changed needs', () => {
		expect( getSolutionsReason( 'test reason', 'otherNoLongerNeedSite', 'noLongerNeedSite' ) ).toBe(
			'test reason'
		);
	} );

	test( 'keeps every other answer as is', () => {
		expect( getSolutionsReason( 'tooExpensive', undefined, 'price/budget' ) ).toBe(
			'tooExpensive'
		);
	} );
} );
