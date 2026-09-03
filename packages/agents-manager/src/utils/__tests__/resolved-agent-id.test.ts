import { getResolvedAgentId, setResolvedAgentId } from '../resolved-agent-id';

describe( 'resolved-agent-id bridge', () => {
	afterEach( () => {
		setResolvedAgentId( undefined );
	} );

	it( 'returns undefined before any value is published', () => {
		expect( getResolvedAgentId() ).toBeUndefined();
	} );

	it( 'returns the published id after set', () => {
		setResolvedAgentId( 'reader-chat' );
		expect( getResolvedAgentId() ).toBe( 'reader-chat' );
	} );

	it( 'overwrites a previously published id', () => {
		setResolvedAgentId( 'big-sky' );
		setResolvedAgentId( 'orchestrator' );
		expect( getResolvedAgentId() ).toBe( 'orchestrator' );
	} );

	it( 'can be cleared back to undefined', () => {
		setResolvedAgentId( 'reader-chat' );
		setResolvedAgentId( undefined );
		expect( getResolvedAgentId() ).toBeUndefined();
	} );
} );
