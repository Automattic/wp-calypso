/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { useOnboardingTour } from '..';

function setHash( hash: string ) {
	window.history.replaceState( null, '', `/overview${ hash }` );
}

describe( 'useOnboardingTour', () => {
	afterEach( () => {
		setHash( '' );
	} );

	test( 'opens from the sign-up link', () => {
		setHash( '#onboarding-tour' );
		const { result } = renderHook( () => useOnboardingTour() );

		expect( result.current.isOpen ).toBe( true );
		expect( result.current.initialSectionId ).toBeUndefined();
	} );

	test( 'lands on the page instead when the page greets new agencies itself', () => {
		setHash( '#onboarding-tour' );
		const { result } = renderHook( () => useOnboardingTour( { opensFromSignUpLink: false } ) );

		expect( result.current.isOpen ).toBe( false );
		expect( window.location.hash ).toBe( '' );
	} );

	test( 'still opens a section link from the classic dashboard', () => {
		setHash( '#onboarding-tour-referrals' );
		const { result } = renderHook( () => useOnboardingTour( { opensFromSignUpLink: false } ) );

		expect( result.current.isOpen ).toBe( true );
		expect( result.current.initialSectionId ).toBe( 'referrals' );
	} );

	test( 'opens on request and clears the hash on close', () => {
		const { result } = renderHook( () => useOnboardingTour( { opensFromSignUpLink: false } ) );

		act( () => result.current.open() );
		expect( result.current.isOpen ).toBe( true );
		expect( window.location.hash ).toBe( '#onboarding-tour' );

		act( () => result.current.onClose() );
		expect( result.current.isOpen ).toBe( false );
		expect( window.location.hash ).toBe( '' );
	} );
} );
