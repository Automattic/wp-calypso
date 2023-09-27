import NetworkConnectionApp from 'calypso/lib/network-connection';

describe( 'index', () => {
	beforeEach( () => {
		jest.mock( '@automattic/calypso-config', () => {
			const originalModule = jest.requireActual( '@automattic/calypso-config' );

			return {
				__esModule: true,
				...originalModule,
				isEnabled: () => true,
			};
		} );
	} );

	test( 'has to be enabled when config flag is enabled', () => {
		expect( NetworkConnectionApp.isEnabled() ).toBe( true );
	} );

	test( 'has initial state connected', () => {
		expect( NetworkConnectionApp.isConnected() ).toBe( true );
	} );

	describe( 'Events', () => {
		let changeSpy;

		beforeEach( () => {
			changeSpy = jest.fn();
			NetworkConnectionApp.on( 'change', changeSpy );
		} );

		afterEach( () => {
			NetworkConnectionApp.off( 'change', changeSpy );
		} );

		test( 'has to persist connected state when connected event sent', () => {
			NetworkConnectionApp.emitConnected();

			expect( NetworkConnectionApp.isConnected() ).toBe( true );
			expect( changeSpy ).not.toHaveBeenCalled();
		} );

		test( 'has to change state to disconnected when disconnected event sent', () => {
			NetworkConnectionApp.emitDisconnected();

			expect( NetworkConnectionApp.isConnected() ).toBe( false );
			expect( changeSpy ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'has to change state to connected only once when connected event sent twice', () => {
			NetworkConnectionApp.emitConnected();
			NetworkConnectionApp.emitConnected();

			expect( NetworkConnectionApp.isConnected() ).toBe( true );
			expect( changeSpy ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'has to change state to disconnected and then back to connected when disconnected and then connected events sent', () => {
			NetworkConnectionApp.emitDisconnected();
			NetworkConnectionApp.emitConnected();

			expect( NetworkConnectionApp.isConnected() ).toBe( true );
			expect( changeSpy ).toHaveBeenCalledTimes( 2 );
		} );
	} );
} );
