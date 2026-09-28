/**
 * @jest-environment jsdom
 */

import { pauseSurvicateTargeting, resumeSurvicateTargeting } from '../targeting';

describe( 'pauseSurvicateTargeting', () => {
	afterEach( () => {
		window._sva = undefined;
	} );

	test( 'should set the disableTargeting flag on the SDK', () => {
		window._sva = {};

		pauseSurvicateTargeting();

		expect( window._sva.disableTargeting ).toBe( true );
	} );

	test( 'should be a no-op when the SDK is not loaded', () => {
		window._sva = undefined;

		expect( () => pauseSurvicateTargeting() ).not.toThrow();
	} );
} );

describe( 'resumeSurvicateTargeting', () => {
	afterEach( () => {
		window._sva = undefined;
	} );

	test( 'should clear the flag and re-run targeting when paused', () => {
		const retarget = jest.fn();
		window._sva = { disableTargeting: true, retarget };

		resumeSurvicateTargeting();

		expect( window._sva.disableTargeting ).toBe( false );
		expect( retarget ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'should not re-run targeting when not paused', () => {
		const retarget = jest.fn();
		window._sva = { retarget };

		resumeSurvicateTargeting();

		expect( retarget ).not.toHaveBeenCalled();
	} );

	test( 'should tolerate an SDK without retarget', () => {
		window._sva = { disableTargeting: true };

		expect( () => resumeSurvicateTargeting() ).not.toThrow();
		expect( window._sva.disableTargeting ).toBe( false );
	} );
} );
