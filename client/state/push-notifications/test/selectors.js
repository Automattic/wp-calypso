import { getStatus } from '../selectors';

describe( 'selectors', () => {
	describe( '#getStatus()', () => {
		test( 'should return unknown if API is not ready', () => {
			const mockState = {
				pushNotifications: {
					system: {
						apiReady: false,
					},
				},
			};
			expect( getStatus( mockState ) ).toEqual( 'unknown' );
		} );

		test( 'should return denied if blocked & API is ready', () => {
			const mockState = {
				pushNotifications: {
					system: {
						apiReady: true,
						blocked: true,
					},
				},
			};
			expect( getStatus( mockState ) ).toEqual( 'denied' );
		} );

		test( 'should return subscribed if enabled and wpcomSubscription.ID is truthy', () => {
			const mockState = {
				pushNotifications: {
					settings: {
						enabled: true,
					},
					system: {
						apiReady: true,
						blocked: false,
						wpcomSubscription: {
							ID: 42,
						},
					},
				},
			};
			expect( getStatus( mockState ) ).toEqual( 'subscribed' );
		} );

		test( 'should return enabling if enabled and wpcomSubscription is null', () => {
			const mockState = {
				pushNotifications: {
					settings: {
						enabled: true,
					},
					system: {
						apiReady: true,
						blocked: false,
					},
				},
			};
			expect( getStatus( mockState ) ).toEqual( 'enabling' );
		} );

		test( 'should return enabling if enabled and wpcomSubscription is false', () => {
			const mockState = {
				pushNotifications: {
					settings: {
						enabled: true,
					},
					system: {
						apiReady: true,
						blocked: false,
						wpcomSubscription: false,
					},
				},
			};
			expect( getStatus( mockState ) ).toEqual( 'enabling' );
		} );

		test( 'should return disabling if not enabled and wpcomSubscription is present', () => {
			const mockState = {
				pushNotifications: {
					settings: {
						enabled: false,
					},
					system: {
						apiReady: true,
						blocked: false,
						wpcomSubscription: {
							ID: 42,
						},
					},
				},
			};
			expect( getStatus( mockState ) ).toEqual( 'disabling' );
		} );

		test( 'should return unsubscribed if not enabled and wpcomSubscription is null', () => {
			const mockState = {
				pushNotifications: {
					settings: {
						enabled: false,
					},
					system: {
						apiReady: true,
						blocked: false,
					},
				},
			};
			expect( getStatus( mockState ) ).toEqual( 'unsubscribed' );
		} );

		test( 'should return unsubscribed if not enabled and wpcomSubscription is false', () => {
			const mockState = {
				pushNotifications: {
					settings: {
						enabled: false,
					},
					system: {
						apiReady: true,
						blocked: false,
						wpcomSubscription: false,
					},
				},
			};
			expect( getStatus( mockState ) ).toEqual( 'unsubscribed' );
		} );
	} );
} );
