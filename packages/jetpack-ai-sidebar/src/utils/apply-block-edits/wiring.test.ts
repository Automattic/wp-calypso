/**
 * Tests that the provider surfaces the bundled `big-sky/apply-block-edits`
 * fallback through `toolProvider`, but only when the Big Sky provider has not
 * already registered it (add-if-absent), and routes `executeAbility` for the
 * name to the local handler.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

jest.mock( '../../extensions', () => ( {
	registerBlockEditorFilters: jest.fn(),
} ) );

import { toolProvider } from '../../index';
import { APPLY_BLOCK_EDITS_NORMALIZED_ID } from './ability';

function normalize( name: string ): string {
	return name.replace( /\//g, '__' ).replace( /-/g, '_' );
}

function setHostAbilities( list: any[] ): void {
	( window as any ).wp = {
		abilities: {
			getAbilities: async () => list,
			executeAbility: jest.fn(),
		},
	};
}

afterEach( () => {
	delete ( window as any ).wp;
	jest.restoreAllMocks();
} );

describe( 'apply-block-edits fallback wiring', () => {
	it( 'adds the fallback ability when Big Sky has not registered it', async () => {
		setHostAbilities( [] );

		const abilities = await toolProvider.getAbilities();
		const matches = abilities.filter(
			( a: any ) => normalize( a.name ?? '' ) === APPLY_BLOCK_EDITS_NORMALIZED_ID
		);

		expect( matches ).toHaveLength( 1 );
		expect( typeof matches[ 0 ].callback ).toBe( 'function' );
	} );

	it( 'does not add a duplicate when Big Sky already registered it', async () => {
		const bigSkyAbility = { name: 'big-sky/apply-block-edits', callback: () => 'big-sky' };
		setHostAbilities( [ bigSkyAbility ] );

		const abilities = await toolProvider.getAbilities();
		const matches = abilities.filter(
			( a: any ) => normalize( a.name ?? '' ) === APPLY_BLOCK_EDITS_NORMALIZED_ID
		);

		expect( matches ).toHaveLength( 1 );
		// Big Sky's registered ability is left in place, not replaced by the fallback.
		expect( matches[ 0 ] ).toBe( bigSkyAbility );
	} );

	it( 'routes executeAbility for the normalized name to the local handler', async () => {
		setHostAbilities( [] );

		const res = await toolProvider.executeAbility( APPLY_BLOCK_EDITS_NORMALIZED_ID, {
			updates: [],
		} );

		expect( res.result ).toBeDefined();
		expect( res.returnToAgent ).toBe( true );
	} );
} );
