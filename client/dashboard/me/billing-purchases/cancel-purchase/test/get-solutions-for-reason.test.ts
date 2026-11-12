/**
 * @vitest-environment jsdom
 */

import { getSolutionsForReason } from '../get-solutions-for-reason';

describe( 'getSolutionsForReason', () => {
	test( 'shows support, then WordPress Agent, then guides for "Could not easily reach a human support agent"', () => {
		expect( getSolutionsForReason( 'noHumanSupport' )?.map( ( { id } ) => id ) ).toEqual( [
			'speak-with-support',
			'ask-ai-assistant',
			'find-guides',
		] );
	} );

	test.each( [
		'complicatedDashboard',
		'difficultEditor',
		'tooMuchTimeToLearn',
		'inadequateOnboarding',
	] )( 'offers the 1:1 session card first for %s', ( reason ) => {
		expect( getSolutionsForReason( reason )?.map( ( { id } ) => id ) ).toEqual( [
			'book-expert-session',
			'built-by',
			'ask-ai-assistant',
			'speak-with-support',
		] );
	} );

	test.each( [
		'tooExpensive',
		'lackOfCustomization',
		'foundBetterValue',
		'freeIsGoodEnough',
		'budgetConstraints',
		'cannotInstallPlugins',
		'cannotUploadThemes',
		'limitedCustomization',
		'missingFunctionality',
		'coreFeaturesMissing',
		'tooSlow',
		'bugsOrGlitches',
		'migrationProblems',
		'downtime',
		'troubleConnectingOrTransferring',
		'confusedAboutDomains',
		'domainIncorrect',
		'wrongPlan',
		'wrongSite',
		'noMatch',
		'slowOrUnhelpful',
		'noHumanSupport',
		'AIInsufficient',
		'projectChanged',
		'justExploring',
		'mayReturn',
		'noLongerNeedSite',
		'otherNoLongerNeedSite',
	] )( 'leaves out the 1:1 session card for %s', ( reason ) => {
		expect( getSolutionsForReason( reason )?.map( ( { id } ) => id ) ).not.toContain(
			'book-expert-session'
		);
	} );

	test.each( [
		'otherTooHardToUse',
		'anotherReasonOne',
		'otherPriceValue',
		'otherMissingFeatures',
		'otherTechnicalIssues',
		'otherDomain',
		'otherWrongPlanOrSite',
		'otherBadSupport',
	] )( 'skips the solution cards step for %s', ( reason ) => {
		expect( getSolutionsForReason( reason ) ).toBeNull();
	} );
} );
