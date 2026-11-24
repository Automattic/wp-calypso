import {
	getOrdinaryTools,
	getOverridesToMatch,
	groupIntentKey,
	requiresOptIn,
} from '../group-intents';

describe( 'client/me/mcp/group-intents', () => {
	describe( 'groupIntentKey', () => {
		it( 'builds a read/write-scoped compound key', () => {
			expect( groupIntentKey( 'write', 'site' ) ).toBe( 'write:site' );
			expect( groupIntentKey( 'read', 'account' ) ).toBe( 'read:account' );
		} );
	} );

	describe( 'getOverridesToMatch', () => {
		it( 'returns an override only for tools whose enabled state disagrees with the target', () => {
			const tools = [
				[ 'wpcom-mcp/already-on', { enabled: true } ],
				[ 'wpcom-mcp/needs-on', { enabled: false } ],
				[ 'wpcom-mcp/also-needs-on', { enabled: false } ],
			];

			expect( getOverridesToMatch( tools, true ) ).toEqual( {
				'wpcom-mcp/needs-on': true,
				'wpcom-mcp/also-needs-on': true,
			} );
		} );

		it( 'returns undefined when every tool already matches the target state', () => {
			const tools = [
				[ 'wpcom-mcp/a', { enabled: true } ],
				[ 'wpcom-mcp/b', { enabled: true } ],
			];

			expect( getOverridesToMatch( tools, true ) ).toBeUndefined();
		} );

		it( 'returns undefined for an empty tool list', () => {
			expect( getOverridesToMatch( [], true ) ).toBeUndefined();
		} );
	} );

	describe( 'getOrdinaryTools', () => {
		it( 'drops every opt-in tool, whether it is on or off', () => {
			const ordinary = [ 'wpcom/posts-list', { enabled: false, requires_opt_in: false } ];

			expect(
				getOrdinaryTools( [
					[ 'wpcom/sensitive-read', { enabled: false, requires_opt_in: true } ],
					ordinary,
					[ 'wpcom/sensitive-write', { enabled: true, requires_opt_in: 1 } ],
				] )
			).toEqual( [ ordinary ] );
		} );
	} );

	describe( 'requiresOptIn', () => {
		it( 'fails closed on truthy values and open only on missing or falsy ones', () => {
			expect( requiresOptIn( { requires_opt_in: true } ) ).toBe( true );
			expect( requiresOptIn( { requires_opt_in: 1 } ) ).toBe( true );
			expect( requiresOptIn( { requires_opt_in: '1' } ) ).toBe( true );
			expect( requiresOptIn( { requires_opt_in: false } ) ).toBe( false );
			expect( requiresOptIn( {} ) ).toBe( false );
			expect( requiresOptIn( undefined ) ).toBe( false );
		} );
	} );
} );
