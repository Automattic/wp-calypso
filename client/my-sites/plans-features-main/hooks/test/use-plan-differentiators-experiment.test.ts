/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import usePlanDifferentiatorsExperiment from '../use-plan-differentiators-experiment';

const ELIGIBLE_RESULT = {
	showDifferentiatorHeader: false,
	useVar42NoAiFeatures: true,
	showPricingDifferentiationFeaturePills: true,
	useFocusedNewCopyTaglines: true,
	isExperimentVariant: true,
};

describe( 'usePlanDifferentiatorsExperiment', () => {
	test( 'is eligible in signup before a site exists', () => {
		const { result } = renderHook( () =>
			usePlanDifferentiatorsExperiment( { isInSignup: true, siteId: null } )
		);

		expect( result.current ).toEqual( ELIGIBLE_RESULT );
	} );

	test( 'is eligible for an existing site, whichever stickers it carries', () => {
		const { result } = renderHook( () =>
			usePlanDifferentiatorsExperiment( { isInSignup: false, siteId: 123 } )
		);

		expect( result.current ).toEqual( ELIGIBLE_RESULT );
	} );
} );
