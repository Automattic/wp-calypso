/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { useOnboardingTourHash } from '../use-onboarding-tour-hash';

function setHash( hash: string ) {
	window.history.replaceState( null, '', `/overview${ hash }` );
}

describe( 'useOnboardingTourHash', () => {
	afterEach( () => {
		setHash( '' );
	} );

	test( 'drops the sign-up link instead of opening the tour', () => {
		setHash( '#onboarding-tour' );
		const { result } = renderHook( () => useOnboardingTourHash() );

		expect( result.current.isOpen ).toBe( false );
		expect( window.location.hash ).toBe( '' );
	} );

	test( 'opens a section link on that section', () => {
		setHash( '#onboarding-tour-referrals' );
		const { result } = renderHook( () => useOnboardingTourHash() );

		expect( result.current.isOpen ).toBe( true );
		expect( result.current.initialSectionId ).toBe( 'referrals' );
	} );

	test( 'opens on request and clears the hash on close', () => {
		const { result } = renderHook( () => useOnboardingTourHash() );

		act( () => result.current.open() );
		expect( result.current.isOpen ).toBe( true );
		expect( window.location.hash ).toBe( '#onboarding-tour-overview' );

		act( () => result.current.close() );
		expect( result.current.isOpen ).toBe( false );
		expect( window.location.hash ).toBe( '' );
	} );
} );
