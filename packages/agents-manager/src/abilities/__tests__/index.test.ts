jest.mock( '@wordpress/abilities', () => ( {
	registerAbility: jest.fn(),
	registerAbilityCategory: jest.fn(),
	unregisterAbility: jest.fn(),
} ) );
jest.mock( '@wordpress/data', () => ( { select: () => undefined } ) );

// `registerAmAbilities` runs once per module instance, so each test loads a
// fresh module (and the matching mock instances) to start clean.
async function load() {
	jest.resetModules();
	const abilities = jest.requireMock( '@wordpress/abilities' );
	const { registerAmAbilities } = await import( '..' );
	return { registerAmAbilities, ...abilities } as {
		registerAmAbilities: () => Promise< void >;
		registerAbility: jest.Mock;
		registerAbilityCategory: jest.Mock;
		unregisterAbility: jest.Mock;
	};
}

beforeEach( () => jest.clearAllMocks() );

describe( 'registerAmAbilities', () => {
	it( 'registers the category, then the abilities, exactly once', async () => {
		const { registerAmAbilities, registerAbility, registerAbilityCategory, unregisterAbility } =
			await load();

		await registerAmAbilities();
		await registerAmAbilities();

		expect( registerAbilityCategory ).toHaveBeenCalledTimes( 1 );
		expect( registerAbilityCategory ).toHaveBeenCalledWith( 'big-sky', expect.any( Object ) );

		expect( registerAbility ).toHaveBeenCalledTimes( 1 );
		expect( registerAbility ).toHaveBeenCalledWith(
			expect.objectContaining( { name: 'big-sky/show-component' } )
		);
		expect( registerAbilityCategory.mock.invocationCallOrder[ 0 ] ).toBeLessThan(
			registerAbility.mock.invocationCallOrder[ 0 ]
		);
		expect( unregisterAbility ).not.toHaveBeenCalled();
	} );

	it( 'replaces a provider copy when the name is already registered', async () => {
		const { registerAmAbilities, registerAbility, unregisterAbility } = await load();
		registerAbility.mockRejectedValueOnce(
			new Error( 'Ability "big-sky/show-component" is already registered' )
		);

		await registerAmAbilities();

		expect( unregisterAbility ).toHaveBeenCalledWith( 'big-sky/show-component' );
		expect( registerAbility ).toHaveBeenCalledTimes( 2 );
	} );
} );
