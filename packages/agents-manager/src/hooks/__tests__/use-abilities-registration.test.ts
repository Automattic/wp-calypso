/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { registerAmAbilities } from '../../abilities';
import useAbilitiesRegistration from '../use-abilities-registration';

jest.mock( '../../abilities', () => ( { registerAmAbilities: jest.fn() } ) );

describe( 'useAbilitiesRegistration', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		window.history.replaceState( {}, '', '/' );
	} );

	it( 'registers AM abilities on mount', () => {
		renderHook( () => useAbilitiesRegistration() );

		expect( registerAmAbilities ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'skips registration with `?am_abilities=0`', () => {
		window.history.replaceState( {}, '', '/?am_abilities=0' );

		renderHook( () => useAbilitiesRegistration() );

		expect( registerAmAbilities ).not.toHaveBeenCalled();
	} );

	it.each( [ '1', 'off', '' ] )( 'still registers with `?am_abilities=%s`', ( value ) => {
		window.history.replaceState( {}, '', `/?am_abilities=${ value }` );

		renderHook( () => useAbilitiesRegistration() );

		expect( registerAmAbilities ).toHaveBeenCalledTimes( 1 );
	} );
} );
