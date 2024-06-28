/**
 * @jest-environment jsdom
 */

import { recordTracksEvent } from '@automattic/calypso-analytics';
import { SENSEI_FLOW } from '@automattic/onboarding';
import { addQueryArgs } from '@wordpress/url';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import { TRACKING_LOCAL_STORAGE_KEY, useSignUpStartTracking } from '../';
import type { Flow, StepperStep } from '../../../types';

const steps = [ { slug: 'step-1' }, { slug: 'step-2' } ] as StepperStep[];

const regularFlow: Flow = {
	name: 'regular-flow',
	useSteps: () => steps,
	useStepNavigation: () => ( {
		submit: () => {},
	} ),
	isSignupFlow: false,
};

const signUpFlow: Flow = {
	...regularFlow,
	name: 'sign-up-flow',
	isSignupFlow: true,
};

const senseiFlow: Flow = {
	...regularFlow,
	name: SENSEI_FLOW,
	// The original sensei flow is missing the isSignupFlow flag as true, it will be addressed by wp-calypso/pull/91593
	isSignupFlow: true,
};

jest.mock( '@automattic/calypso-analytics' );

const render = ( { flow, currentStepRoute, queryParams = {} } ) => {
	return renderHookWithProvider(
		() =>
			useSignUpStartTracking( {
				flow,
				currentStepRoute,
			} ),
		{
			wrapper: ( { children } ) => (
				<MemoryRouter initialEntries={ [ addQueryArgs( `/setup/${ flow.name }`, queryParams ) ] }>
					{ children }
				</MemoryRouter>
			),
		}
	);
};

describe( 'useSignUpTracking', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'does not track event when the flow is not a isSignupFlow', () => {
		render( { flow: regularFlow, currentStepRoute: 'step-1' } );

		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );

	describe( 'sign-up-flow', () => {
		beforeEach( () => {
			localStorage.clear();
		} );

		it( 'tracks the event current step is first step', () => {
			render( {
				flow: signUpFlow,
				currentStepRoute: 'step-1',
				queryParams: { ref: 'another-flow-or-cta' },
			} );

			expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_signup_start', {
				flow: 'sign-up-flow',
				ref: 'another-flow-or-cta',
			} );
		} );

		it( 'skips the tracking when the event was already tracked', () => {
			localStorage.setItem(
				TRACKING_LOCAL_STORAGE_KEY,
				JSON.stringify( { [ signUpFlow.name ]: true } )
			);

			render( {
				flow: signUpFlow,
				currentStepRoute: 'step-1',
			} );

			expect( recordTracksEvent ).not.toHaveBeenCalled();
		} );

		it( 'maintains the tracking state of multiple flows', () => {
			const A = { ...signUpFlow, name: 'flow-a' };
			const B = { ...signUpFlow, name: 'flow-b' };

			render( {
				flow: A,
				currentStepRoute: 'step-1',
			} );

			render( {
				flow: B,
				currentStepRoute: 'step-1',
			} );

			// remove the tracking state of flow-a
			render( {
				flow: A,
				currentStepRoute: 'step-1',
			} );

			expect( recordTracksEvent ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'tracks the event with extra props from useSighupStartEventProps', () => {
			render( {
				flow: {
					...signUpFlow,
					useSignupStartEventProps: () => ( { extra: 'props' } ),
				} satisfies Flow,
				currentStepRoute: 'step-1',
				queryParams: { ref: 'another-flow-or-cta' },
			} );

			expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_signup_start', {
				flow: 'sign-up-flow',
				ref: 'another-flow-or-cta',
				extra: 'props',
			} );
		} );

		it( 'tracks the calypso_signup_start event includes the flowVariant if the flow has one', () => {
			render( {
				flow: {
					...signUpFlow,
					variantSlug: 'variant-slug',
				} satisfies Flow,
				currentStepRoute: 'step-1',
			} );

			expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_signup_start', {
				flow: 'sign-up-flow',
				flow_variant: 'variant-slug',
				ref: '',
			} );
		} );

		// Check if sensei is a sign-up flow;
		it( "tracks when the user is on the sensei's flow second step", () => {
			render( { flow: senseiFlow, currentStepRoute: 'step-2' } );

			expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_signup_start', {
				flow: SENSEI_FLOW,
				ref: '',
			} );
		} );

		it( 'does not trigger the event on rerender', () => {
			const { rerender } = render( {
				flow: { ...signUpFlow, useSignupStartEventProps: () => ( { extra: 'props' } ) },
				currentStepRoute: 'step-1',
				queryParams: { ref: 'another-flow-or-cta' },
			} );

			rerender();

			expect( recordTracksEvent ).toHaveBeenNthCalledWith( 1, 'calypso_signup_start', {
				flow: 'sign-up-flow',
				ref: 'another-flow-or-cta',
				extra: 'props',
			} );
		} );
	} );
} );
