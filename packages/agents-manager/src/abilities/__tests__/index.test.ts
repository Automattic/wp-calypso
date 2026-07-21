import { registerAbility, registerAbilityCategory } from '@wordpress/abilities';
import { registerAmAbilities } from '..';

jest.mock( '@wordpress/abilities', () => ( {
	registerAbility: jest.fn(),
	registerAbilityCategory: jest.fn(),
} ) );
jest.mock( '@wordpress/core-data', () => ( { store: 'core' } ) );
jest.mock( '@wordpress/data', () => ( { select: () => undefined, dispatch: () => undefined } ) );

describe( 'registerAmAbilities', () => {
	it( 'registers the category, then the abilities, exactly once', async () => {
		await registerAmAbilities();
		await registerAmAbilities();

		expect( registerAbilityCategory ).toHaveBeenCalledTimes( 1 );
		expect( registerAbilityCategory ).toHaveBeenCalledWith( 'big-sky', expect.any( Object ) );

		expect( registerAbility ).toHaveBeenCalledTimes( 1 );
		expect( registerAbility ).toHaveBeenCalledWith(
			expect.objectContaining( { name: 'big-sky/show-component' } )
		);
		expect( ( registerAbilityCategory as jest.Mock ).mock.invocationCallOrder[ 0 ] ).toBeLessThan(
			( registerAbility as jest.Mock ).mock.invocationCallOrder[ 0 ]
		);
	} );
} );
