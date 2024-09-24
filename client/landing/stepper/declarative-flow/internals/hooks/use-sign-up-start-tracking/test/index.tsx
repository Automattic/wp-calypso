/**
 * @jest-environment jsdom
 */

import { recordTracksEvent } from '@automattic/calypso-analytics';
import { resolveDeviceTypeByViewPort } from '@automattic/viewport';
import { addQueryArgs } from '@wordpress/url';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import { useSignUpStartTracking } from '../';
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

const render = ( { flow, queryParams = {} } ) => {
	return renderHookWithProvider(
		() =>
			useSignUpStartTracking( {
				flow,
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
		render( { flow: regularFlow } );

		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );

	it( 'does not track event when the flow is not a isSignupFlow and the signup flag is set', () => {
		render( { flow: regularFlow, queryParams: { start: 1 } } );

		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );

	describe( 'sign-up-flow', () => {
		it( 'tracks the event current', () => {
			render( {
				flow: signUpFlow,
				queryParams: { ref: 'another-flow-or-cta' },
			} );

			expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_signup_start', {
				flow: 'sign-up-flow',
				ref: 'another-flow-or-cta',
				device: resolveDeviceTypeByViewPort(),
			} );
		} );

		it( 'tracks the event with extra props from useSighupStartEventProps', () => {
			render( {
				flow: {
					...signUpFlow,
					useSignupStartEventProps: () => ( { extra: 'props' } ),
				} satisfies Flow,
				queryParams: { ref: 'another-flow-or-cta' },
			} );

			expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_signup_start', {
				flow: 'sign-up-flow',
				ref: 'another-flow-or-cta',
				extra: 'props',
				device: resolveDeviceTypeByViewPort(),
			} );
		} );

		it( 'tracks the calypso_signup_start event includes the flowVariant if the flow has one', () => {
			render( {
				flow: {
					...signUpFlow,
					variantSlug: 'variant-slug',
				} satisfies Flow,
			} );

			expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_signup_start', {
				flow: 'sign-up-flow',
				flow_variant: 'variant-slug',
				ref: '',
				device: resolveDeviceTypeByViewPort(),
			} );
		} );
	} );
} );
