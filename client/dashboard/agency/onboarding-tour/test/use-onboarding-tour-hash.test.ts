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
		expect( result.current.sectionId ).toBe( 'referrals' );
	} );

	test( 'opens an unknown section link on the first section', () => {
		setHash( '#onboarding-tour-reports' );
		const { result } = renderHook( () => useOnboardingTourHash() );

		expect( result.current.isOpen ).toBe( true );
		expect( result.current.sectionId ).toBe( 'overview' );
		expect( window.location.hash ).toBe( '#onboarding-tour-overview' );
	} );

	test( 'follows a section link while the tour is open', () => {
		setHash( '#onboarding-tour-team' );
		const { result } = renderHook( () => useOnboardingTourHash() );

		act( () => {
			setHash( '#onboarding-tour-sites' );
			window.dispatchEvent( new HashChangeEvent( 'hashchange' ) );
		} );
		expect( result.current.sectionId ).toBe( 'sites' );
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
