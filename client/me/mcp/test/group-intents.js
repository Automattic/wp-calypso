import { getOverridesToMatch, groupIntentKey } from '../group-intents';

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
} );
