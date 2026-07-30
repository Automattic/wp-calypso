const mockUse = jest.fn();

function mockRegisterDataPlugin( ...args: unknown[] ) {
	return mockUse( ...args );
}

jest.mock( '@wordpress/data', () => ( {
	plugins: {
		persistence: 'persistence',
	},
	use: mockRegisterDataPlugin,
} ) );

const pluginRegistry = mockRegisterDataPlugin as typeof mockRegisterDataPlugin & {
	__automatticDataStoresPersistencePluginRegistered?: boolean;
};

describe( 'data store plugin registration', () => {
	beforeEach( () => {
		delete pluginRegistry.__automatticDataStoresPersistencePluginRegistered;
		mockUse.mockClear();
		jest.resetModules();
	} );

	afterEach( () => {
		delete pluginRegistry.__automatticDataStoresPersistencePluginRegistered;
	} );

	it( 'registers persistence only once from one bundle', async () => {
		const { registerPlugins } = await import( '../index' );

		registerPlugins();
		registerPlugins();

		expect( mockUse ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'registers persistence only once across independently bundled copies', async () => {
		const firstBundle = await import( '../index' );
		firstBundle.registerPlugins();

		jest.resetModules();
		const secondBundle = await import( '../index' );
		secondBundle.registerPlugins();

		expect( mockUse ).toHaveBeenCalledTimes( 1 );
	} );
} );
