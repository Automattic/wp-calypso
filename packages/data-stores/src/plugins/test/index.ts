import { vi } from 'vitest';
const mockUse = vi.fn();

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
			store.subscribe( vi.fn() );
			return store;
		},
	};
}

vi.mock( '@wordpress/data', () => ( {
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
		vi.resetModules();
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

		vi.resetModules();
		const secondBundle = await import( '../index' );
		secondBundle.registerPlugins();

		expect( mockUse ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'bypasses persistence plugins installed by older bundles', async () => {
		const { registerPlugins } = await import( '../index' );
		registerPlugins();

		const persistencePlugin = mockUse.mock.calls[ 0 ][ 0 ] as DataPlugin;
		const store = {
			getState: vi.fn( () => ( { value: 'current' } ) ),
			subscribe: vi.fn(),
		} as unknown as ReduxStore;
		const innerRegisterStore = vi.fn( () => store );
		const registry = {
			registerStore: innerRegisterStore,
		} as unknown as DataRegistry;
		const storage = {
			getItem: vi.fn( () => null ),
			setItem: vi.fn(),
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
