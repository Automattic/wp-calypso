/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { registerAmAbilities } from '../../abilities';
import useAbilitiesRegistration from '../use-abilities-registration';

jest.mock( '../../abilities', () => ( { registerAmAbilities: jest.fn() } ) );

// What loads and registers is decided inside `registerAmAbilities()`, and
// covered by the abilities facade tests.
describe( 'useAbilitiesRegistration', () => {
	it( 'registers AM abilities on mount', () => {
		renderHook( () => useAbilitiesRegistration() );

		expect( registerAmAbilities ).toHaveBeenCalledTimes( 1 );
	} );
} );
