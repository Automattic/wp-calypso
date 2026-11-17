import {
	getOverridesToMatch,
	getSiteBulkOverrides,
	groupIntentKey,
	isBulkEnabled,
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
		const mixedTools = [
			[ 'wpcom/posts-list', { enabled: false, requires_opt_in: false } ],
			[ 'wpcom/sensitive-read', { enabled: false, requires_opt_in: true } ],
		];

		it( 'leaves opt-in tools disabled when enabling a bulk scope', () => {
			expect( getOverridesToMatch( mixedTools, true ) ).toEqual( { 'wpcom/posts-list': true } );
			expect( getOverridesToMatch( [ mixedTools[ 1 ] ], true ) ).toBeUndefined();
		} );

		it( 'disables opt-in tools along with ordinary tools', () => {
			const enabledTools = mixedTools.map( ( [ id, tool ] ) => [ id, { ...tool, enabled: true } ] );
			expect( getOverridesToMatch( enabledTools, false ) ).toEqual( {
				'wpcom/posts-list': false,
				'wpcom/sensitive-read': false,
			} );
		} );

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

	describe( 'isBulkEnabled', () => {
		it( 'allows disabling a bulk scope while opt-in tools remain off', () => {
			expect(
				isBulkEnabled( [
					[ 'wpcom/posts-list', { enabled: true } ],
					[ 'wpcom/sensitive-read', { enabled: false, requires_opt_in: true } ],
				] )
			).toBe( true );
		} );

		it( 'stays off when an ordinary tool is disabled or no tools are enabled', () => {
			expect(
				isBulkEnabled( [
					[ 'wpcom/posts-list', { enabled: false } ],
					[ 'wpcom/sensitive-read', { enabled: true, requires_opt_in: true } ],
				] )
			).toBe( false );
			expect(
				isBulkEnabled( [ [ 'wpcom/sensitive-read', { enabled: false, requires_opt_in: true } ] ] )
			).toBe( false );
			expect( isBulkEnabled( [] ) ).toBe( false );
		} );

		it( 'treats any truthy opt-in value as opt-in', () => {
			expect(
				isBulkEnabled( [
					[ 'wpcom/posts-list', { enabled: true } ],
					[ 'wpcom/sensitive-read', { enabled: false, requires_opt_in: 1 } ],
				] )
			).toBe( true );
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

	describe( 'getSiteBulkOverrides', () => {
		const tools = [
			[ 'wpcom/posts-list', { enabled: true } ],
			[ 'wpcom/posts-create', { enabled: false } ],
			[ 'wpcom/sensitive-read', { enabled: false, requires_opt_in: true } ],
		];

		it( 'writes every ordinary tool but never enables an opt-in tool', () => {
			expect( getSiteBulkOverrides( tools, true ) ).toEqual( {
				'wpcom/posts-list': true,
				'wpcom/posts-create': true,
			} );
		} );

		it( 'disables opt-in tools along with ordinary tools', () => {
			expect( getSiteBulkOverrides( tools, false ) ).toEqual( {
				'wpcom/posts-list': false,
				'wpcom/posts-create': false,
				'wpcom/sensitive-read': false,
			} );
		} );
	} );
} );
