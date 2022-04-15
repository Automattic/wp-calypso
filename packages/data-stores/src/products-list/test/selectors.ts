/*
 * These tests shouldn't require the jsdom environment,
 * but we're waiting for this PR to merge:
 * https://github.com/WordPress/gutenberg/pull/20486
 *
 * @jest-environment jsdom
 */
import { select, subscribe } from '@wordpress/data';
import wpcomRequest from 'wpcom-proxy-request';
import { register } from '..';

jest.mock( 'wpcom-proxy-request', () => ( {
	__esModule: true,
	default: jest.fn(),
	requestAllBlogsAccess: jest.fn( () => Promise.resolve() ),
} ) );

let store: ReturnType< typeof register >;

beforeAll( () => {
	store = register();
} );

beforeEach( () => {
	( wpcomRequest as jest.Mock ).mockReset();
} );

describe( 'selectors', () => {
	it( 'resolves the state via an API call', async () => {
		const apiResponse = {};

		( wpcomRequest as jest.Mock ).mockResolvedValue( apiResponse );

		const listenForStateUpdate = () => {
			return new Promise( ( resolve ) => {
				const unsubscribe = subscribe( () => {
					unsubscribe();
					resolve();
				} );
			} );
		};

		// First call returns undefined
		expect( select( store ).getProductsList() ).toEqual( undefined );

		// In the first state update, the resolver starts resolving
		await listenForStateUpdate();

		// In the second update, the resolver is finished resolving and we can read the result in state
		await listenForStateUpdate();

		expect( select( store ).getProductsList() ).toEqual( apiResponse );
	} );
} );
