/**
 * @jest-environment jsdom
 */
import { addQueryArgs } from '@wordpress/url';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import recordSignupStart from 'calypso/landing/stepper/declarative-flow/internals/analytics/record-signup-start';
import { adTrackSignupStart } from 'calypso/lib/analytics/ad-tracking';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { setSignupStartTime } from 'calypso/signup/storageUtils';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import { useSignUpStartTracking } from '../';
import { STEPPER_TRACKS_EVENT_SIGNUP_START } from '../../../../../constants';
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

jest.mock( '@automattic/calypso-analytics' );
jest.mock( 'calypso/landing/stepper/declarative-flow/internals/analytics/record-signup-start' );
jest.mock( 'calypso/lib/analytics/ad-tracking' );
jest.mock( 'calypso/lib/analytics/ga' );
jest.mock( 'calypso/signup/storageUtils' );

const render = ( { flow, queryParams = {} } ) => {
	return renderHookWithProvider(
		() =>
			useSignUpStartTracking( {
				flow,
			} ),
		{
			wrapper: ( { children } ) => {
				// The hook depends on window.location.search to determine the query params.
				Reflect.deleteProperty( global.window, 'location' );
				window.location = new URL(
					'https://example.com/' + addQueryArgs( `/setup/${ flow.name }`, queryParams )
				) as unknown as Location;
				return <MemoryRouter initialEntries={ [ '/setup' ] }>{ children }</MemoryRouter>;
			},
		}
	);
};

describe( 'useSignUpTracking', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'does not track event when the flow is not a isSignupFlow', () => {
		render( { flow: regularFlow } );

		expect( recordSignupStart ).not.toHaveBeenCalled();
	} );

	it( 'does not track event when the flow is not a isSignupFlow and the signup flag is set', () => {
		render( { flow: regularFlow, queryParams: { start: 1 } } );

		expect( recordSignupStart ).not.toHaveBeenCalled();
	} );

	describe( 'sign-up-flow', () => {
		it( 'tracks the event current', () => {
			render( {
				flow: signUpFlow,
				queryParams: { ref: 'another-flow-or-cta' },
			} );

			expect( recordSignupStart ).toHaveBeenCalledWith( {
				flow: 'sign-up-flow',
				ref: 'another-flow-or-cta',
				optionalProps: {},
			} );
		} );

		it( 'tracks the event with extra props from useSighupStartEventProps', () => {
			render( {
				flow: {
					...signUpFlow,
					useTracksEventProps: () => ( {
						eventsProperties: {
							[ STEPPER_TRACKS_EVENT_SIGNUP_START ]: { extra: 'props' },
						},
					} ),
				} satisfies Flow,
				queryParams: { ref: 'another-flow-or-cta' },
			} );

			expect( recordSignupStart ).toHaveBeenCalledWith( {
				flow: 'sign-up-flow',
				ref: 'another-flow-or-cta',
				optionalProps: {
					extra: 'props',
				},
			} );
		} );

		it( 'tracks the calypso_signup_start event includes the flowVariant if the flow has one', () => {
			render( {
				flow: {
					...signUpFlow,
					variantSlug: 'variant-slug',
				} satisfies Flow,
			} );

			expect( recordSignupStart ).toHaveBeenCalledWith( {
				flow: 'sign-up-flow',
				optionalProps: {
					flow_variant: 'variant-slug',
				},
				ref: '',
			} );
		} );

		it( 'records the calypso_signup_start event a single time if dependencies are stable', () => {
			const { rerender } = render( {
				flow: {
					...signUpFlow,
				} satisfies Flow,
			} );

			rerender();
			expect( recordSignupStart ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'records the calypso_signup_start event multiple times when dependencies change', () => {
			const { rerender } = render( {
				flow: {
					...signUpFlow,
					useTracksEventProps: () => ( {
						eventsProperties: {
							[ STEPPER_TRACKS_EVENT_SIGNUP_START ]: { extra: 'props' },
						},
					} ),
				} satisfies Flow,
			} );

			rerender();
			expect( recordSignupStart ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'sets the signup-start timer only on initial mount (assuming static flowName and isSignupFlow)', () => {
			const { rerender } = render( {
				flow: {
					...signUpFlow,
				} satisfies Flow,
			} );

			rerender();
			expect( setSignupStartTime ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'records Google-Analytics and AD tracking only on initial mount (assuming static flowName and isSignupFlow)', () => {
			const { rerender } = render( {
				flow: {
					...signUpFlow,
				} satisfies Flow,
			} );

			rerender();
			expect( gaRecordEvent ).toHaveBeenCalledTimes( 1 );
			expect( adTrackSignupStart ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
