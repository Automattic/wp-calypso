jest.mock( '@wordpress/abilities', () => ( {
	getAbility: jest.fn(),
	registerAbility: jest.fn(),
	registerAbilityCategory: jest.fn(),
	unregisterAbility: jest.fn(),
} ) );
jest.mock( '@wordpress/data', () => ( { select: () => undefined } ) );
jest.mock( '@wordpress/core-data', () => ( { store: 'core' } ) );
jest.mock( '@automattic/agenttic-client', () => ( { getAgentManager: jest.fn() } ), {
	virtual: true,
} );

// `registerAmAbilities` runs once per module instance, so each test loads a
// fresh module (and the matching mock instances) to start clean.
async function load() {
	jest.resetModules();
	const abilities = jest.requireMock( '@wordpress/abilities' );
	const { registerAmAbilities } = await import( '..' );
	return { registerAmAbilities, ...abilities } as {
		registerAmAbilities: () => Promise< void >;
		getAbility: jest.Mock;
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

		expect( registerAbility ).toHaveBeenCalledTimes( 2 );
		expect( registerAbility ).toHaveBeenCalledWith(
			expect.objectContaining( { name: 'big-sky/restore-checkpoint' } )
		);
		expect( registerAbility ).toHaveBeenCalledWith(
			expect.objectContaining( { name: 'big-sky/show-component' } )
		);
		expect( registerAbilityCategory.mock.invocationCallOrder[ 0 ] ).toBeLessThan(
			registerAbility.mock.invocationCallOrder[ 0 ]
		);
		expect( unregisterAbility ).not.toHaveBeenCalled();
	} );

	it( 'replaces a provider copy when the name is already registered', async () => {
		const { registerAmAbilities, getAbility, registerAbility, unregisterAbility } = await load();
		registerAbility.mockRejectedValueOnce(
			new Error( 'Ability "big-sky/restore-checkpoint" is already registered' )
		);
		getAbility.mockReturnValue( { name: 'big-sky/restore-checkpoint' } );

		await registerAmAbilities();

		expect( unregisterAbility ).toHaveBeenCalledWith( 'big-sky/restore-checkpoint' );
		expect( registerAbility ).toHaveBeenCalledTimes( 3 );
	} );

	it( 'does not unregister when the failure is not a collision', async () => {
		const warn = jest.spyOn( console, 'warn' ).mockImplementation( () => {} );
		const { registerAmAbilities, getAbility, registerAbility, unregisterAbility } = await load();
		registerAbility.mockRejectedValueOnce( new Error( 'Invalid ability definition' ) );
		getAbility.mockReturnValue( undefined );

		await registerAmAbilities();

		expect( unregisterAbility ).not.toHaveBeenCalled();
		expect( registerAbility ).toHaveBeenCalledTimes( 2 );
		expect( warn ).toHaveBeenCalled();
		warn.mockRestore();
	} );
} );
