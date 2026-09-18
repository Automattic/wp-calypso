const mockUse = jest.fn();

function mockRegisterDataPlugin( ...args: unknown[] ) {
	return mockUse( ...args );
}

function mockPersistencePlugin( registry: DataRegistry ) {
	return {
		registerStore(
			storeName: string,
			storeOptions: ReduxStoreConfig< unknown, unknown, unknown >
		) {
			const store = registry.registerStore( storeName, storeOptions );
			store.subscribe( jest.fn() );
			return store;
		},
	};
}

jest.mock( '@wordpress/data', () => ( {
	plugins: {
		persistence: mockPersistencePlugin,
	},
	use: mockRegisterDataPlugin,
} ) );

import type { DataPlugin, DataRegistry, ReduxStoreConfig, ReduxStore } from '@wordpress/data';

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

	it( 'bypasses persistence plugins installed by older bundles', async () => {
		const { registerPlugins } = await import( '../index' );
		registerPlugins();

		const persistencePlugin = mockUse.mock.calls[ 0 ][ 0 ] as DataPlugin;
		const store = {
			getState: jest.fn( () => ( { value: 'current' } ) ),
			subscribe: jest.fn(),
		} as unknown as ReduxStore;
		const innerRegisterStore = jest.fn( () => store );
		const registry = {
			registerStore: innerRegisterStore,
		} as unknown as DataRegistry;
		const storage = {
			getItem: jest.fn( () => null ),
			setItem: jest.fn(),
		};
		const registeredPlugin = persistencePlugin( registry, {
			storage,
			storageKey: 'TEST_PERSISTENCE',
		} );
		const storeOptions = {
			reducer: ( state = { value: 'current' } ) => state,
			persist: [ 'value' ],
		} as ReduxStoreConfig< unknown, unknown, unknown > & {
			persist: string[];
		};

		registeredPlugin.registerStore?.( 'test/store', storeOptions );

		expect( innerRegisterStore ).toHaveBeenCalledWith(
			'test/store',
			expect.not.objectContaining( {
				persist: expect.anything(),
			} )
		);
		expect( store.subscribe ).toHaveBeenCalledTimes( 1 );
	} );
} );
