import deepFreeze from 'deep-freeze';
import { vi } from 'vitest';
import {
	PUBLICIZE_CONNECTION_CREATE,
	PUBLICIZE_CONNECTION_DELETE,
	PUBLICIZE_CONNECTION_RECEIVE,
	PUBLICIZE_CONNECTION_UPDATE,
} from 'calypso/state/action-types';
import { serialize, deserialize } from 'calypso/state/utils';
import { connections } from '../reducer';

describe( 'reducer', () => {
	describe( '#connections()', () => {
		describe( 'PUBLICIZE_CONNECTION_CREATE', () => {
			test( 'should add new connection', () => {
				const existingConnection = { ID: 1, site_ID: 2916284 };
				const newConnection = { ID: 2, site_ID: 2916284 };
				const state = connections(
					deepFreeze( {
						1: existingConnection,
					} ),
					{
						type: PUBLICIZE_CONNECTION_CREATE,
						connection: newConnection,
					}
				);

				expect( state ).toEqual( {
					1: existingConnection,
					2: newConnection,
				} );
			} );

			test( 'should update existing connections', () => {
				const newConnection = { ID: 1, site_ID: 2916284 };
				const state = connections(
					deepFreeze( {
						1: { ID: 1, site_ID: 77203074 },
					} ),
					{
						type: PUBLICIZE_CONNECTION_CREATE,
						connection: newConnection,
					}
				);

				expect( state ).toEqual( {
					1: newConnection,
				} );
			} );
		} );

		describe( 'PUBLICIZE_CONNECTION_DELETE', () => {
			test( 'should remove deleted connections', () => {
				const state = connections(
					deepFreeze( {
						1: { ID: 1, site_ID: 2916284 },
						2: { ID: 2, site_ID: 2916284 },
					} ),
					{
						type: PUBLICIZE_CONNECTION_DELETE,
						connection: {
							ID: 2,
							site_ID: 2916284,
						},
					}
				);

				expect( state ).toEqual( {
					1: { ID: 1, site_ID: 2916284 },
				} );
			} );
		} );

		describe( 'PUBLICIZE_CONNECTION_RECEIVE', () => {
			test( 'should add new connection', () => {
				const existingConnection = { ID: 1, site_ID: 2916284 };
				const newConnection = { ID: 2, site_ID: 2916284 };
				const state = connections(
					deepFreeze( {
						1: existingConnection,
					} ),
					{
						type: PUBLICIZE_CONNECTION_RECEIVE,
						connection: newConnection,
					}
				);

				expect( state ).toEqual( {
					1: existingConnection,
					2: newConnection,
				} );
			} );

			test( 'should update existing connections', () => {
				const newConnection = { ID: 1, site_ID: 2916284 };
				const state = connections(
					deepFreeze( {
						1: { ID: 1, site_ID: 77203074 },
					} ),
					{
						type: PUBLICIZE_CONNECTION_RECEIVE,
						connection: newConnection,
					}
				);

				expect( state ).toEqual( {
					1: newConnection,
				} );
			} );
		} );

		describe( 'PUBLICIZE_CONNECTION_UPDATE', () => {
			test( 'should add new connection', () => {
				const existingConnection = { ID: 1, site_ID: 2916284 };
				const newConnection = { ID: 2, site_ID: 2916284 };
				const state = connections(
					deepFreeze( {
						1: existingConnection,
					} ),
					{
						type: PUBLICIZE_CONNECTION_UPDATE,
						connection: newConnection,
					}
				);

				expect( state ).toEqual( {
					1: existingConnection,
					2: newConnection,
				} );
			} );

			test( 'should update existing connections', () => {
				const newConnection = { ID: 1, site_ID: 2916284 };
				const state = connections(
					deepFreeze( {
						1: { ID: 1, site_ID: 77203074 },
					} ),
					{
						type: PUBLICIZE_CONNECTION_UPDATE,
						connection: newConnection,
					}
				);

				expect( state ).toEqual( {
					1: newConnection,
				} );
			} );
		} );

		describe( 'persistence', () => {
			vi.spyOn( console, 'warn' ).mockImplementation(() => {});

			test( 'should persist data', () => {
				const state = deepFreeze( {
					1: { ID: 1, site_ID: 2916284 },
					2: { ID: 2, site_ID: 2916284 },
				} );
				const persistedState = serialize( connections, state );
				expect( persistedState ).toEqual( state );
			} );

			test( 'should load valid data', () => {
				const persistedState = deepFreeze( {
					1: { ID: 1, site_ID: 2916284 },
					2: { ID: 2, site_ID: 2916284 },
				} );
				const state = deserialize( connections, persistedState );
				expect( state ).toEqual( persistedState );
			} );

			test( 'should ignore loading data with invalid keys', () => {
				const persistedState = deepFreeze( {
					foo: { ID: 1, site_ID: 2916284 },
					bar: { ID: 2, site_ID: 2916284 },
				} );
				const state = deserialize( connections, persistedState );
				expect( state ).toEqual( {} );
			} );

			test( 'should ignore loading data with invalid values', () => {
				const persistedState = deepFreeze( {
					1: { ID: 1, site_ID: 'foo' },
					2: { ID: 2, site_ID: 2916284 },
				} );
				const state = deserialize( connections, persistedState );
				expect( state ).toEqual( {} );
			} );
		} );
	} );
} );
