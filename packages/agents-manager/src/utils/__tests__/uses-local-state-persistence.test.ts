/**
 * @jest-environment jsdom
 */
import { usesLocalStatePersistence } from '../uses-local-state-persistence';

type AgentsManagerDataShape = { persistStateLocally?: boolean };

function setAgentsManagerData( data: AgentsManagerDataShape | undefined ): void {
	const holder = window as unknown as { agentsManagerData?: AgentsManagerDataShape };
	if ( data === undefined ) {
		delete holder.agentsManagerData;
		return;
	}
	holder.agentsManagerData = data;
}

describe( 'usesLocalStatePersistence', () => {
	afterEach( () => {
		setAgentsManagerData( undefined );
	} );

	it( 'returns `true` for the reader-chat agent, regardless of agentsManagerData', () => {
		setAgentsManagerData( undefined );
		expect( usesLocalStatePersistence( 'reader-chat' ) ).toBe( true );
	} );

	it( 'returns `true` for the p2-reader-chat agent', () => {
		expect( usesLocalStatePersistence( 'p2-reader-chat' ) ).toBe( true );
	} );

	it( 'returns `true` for a non-reader host that opts in via persistStateLocally', () => {
		setAgentsManagerData( { persistStateLocally: true } );
		expect( usesLocalStatePersistence( 'woo-shopper-assistant' ) ).toBe( true );
	} );

	// The equivalence the deploy-safety audit rests on: swapping
	// `isReaderChatAgent` -> `usesLocalStatePersistence` at the persistence call
	// sites must change nothing for server-backed hosts (Big Sky / wp-admin /
	// orchestrator). They never opt in, so they must stay `false`.
	it( 'returns `false` for a server-backed host with persistStateLocally explicitly off', () => {
		setAgentsManagerData( { persistStateLocally: false } );
		expect( usesLocalStatePersistence( 'wp-orchestrator' ) ).toBe( false );
	} );

	it( 'returns `false` for a server-backed host when agentsManagerData is absent', () => {
		setAgentsManagerData( undefined );
		expect( usesLocalStatePersistence( 'wp-orchestrator' ) ).toBe( false );
	} );

	it( 'returns `false` for an empty or undefined agentId with no opt-in', () => {
		setAgentsManagerData( undefined );
		expect( usesLocalStatePersistence( '' ) ).toBe( false );
		expect( usesLocalStatePersistence( undefined ) ).toBe( false );
	} );
} );
