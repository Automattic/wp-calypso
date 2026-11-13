/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { registerAmAbilities } from '../../abilities';
import useAbilitiesRegistration from '../use-abilities-registration';

vi.mock( '../../abilities', () => ( { registerAmAbilities: vi.fn() } ) );

// What loads and registers is decided inside `registerAmAbilities()`, and
// covered by the abilities facade tests.
describe( 'useAbilitiesRegistration', () => {
	it( 'registers AM abilities on mount', () => {
		renderHook( () => useAbilitiesRegistration() );

		expect( registerAmAbilities ).toHaveBeenCalledTimes( 1 );
	} );
} );
