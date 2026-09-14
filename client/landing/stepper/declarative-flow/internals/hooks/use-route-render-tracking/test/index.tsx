/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useRouteRenderTracking } from '../';

jest.mock( 'calypso/lib/analytics/tracks', () => ( { recordTracksEvent: jest.fn() } ) );

describe( 'useRouteRenderTracking', () => {
	beforeEach( () => {
		( recordTracksEvent as jest.Mock ).mockClear();
	} );

	test( 'records a route render keyed the same way as the stepper page view', () => {
		renderHook( () =>
			useRouteRenderTracking( { flow: 'onboarding', step: 'plans', enabled: true } )
		);

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_route_render', {
			app: 'stepper',
			path: '/setup/onboarding/plans',
			flow: 'onboarding',
			step: 'plans',
		} );
	} );

	test( 'records again only when the flow or step changes', () => {
		const { rerender } = renderHook(
			( props: { flow: string; step: string } ) =>
				useRouteRenderTracking( { ...props, enabled: true } ),
			{ initialProps: { flow: 'onboarding', step: 'plans' } }
		);

		rerender( { flow: 'onboarding', step: 'plans' } );
		expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );

		rerender( { flow: 'onboarding', step: 'domains' } );
		expect( recordTracksEvent ).toHaveBeenCalledTimes( 2 );
	} );

	test( 'does not record when the step is not a valid step of the flow', () => {
		renderHook( () =>
			useRouteRenderTracking( { flow: 'onboarding', step: 'nope', enabled: false } )
		);

		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );
} );
