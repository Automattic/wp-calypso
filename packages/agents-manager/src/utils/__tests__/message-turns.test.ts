import { getAgentTurnPositions } from '../message-turns';
import type { UIMessage } from '@automattic/agenttic-client';

const message = (
	id: string,
	role: 'user' | 'agent',
	content: UIMessage[ 'content' ] = [ { type: 'text', text: id } ]
): UIMessage => ( { id, role, content, timestamp: 1, archived: false, showIcon: false } );

const picker = ( id: string, summary?: string ): UIMessage =>
	message( id, 'agent', [
		...( summary ? [ { type: 'text' as const, text: summary } ] : [] ),
		{ type: 'component', component: () => null },
	] );

describe( 'getAgentTurnPositions', () => {
	it( 'marks the last message and carrier of each turn, and which turn is latest', () => {
		const positions = getAgentTurnPositions( [
			message( 'user-1', 'user' ),
			message( 'agent-1', 'agent' ),
			message( 'agent-2', 'agent' ),
			message( 'user-2', 'user' ),
			message( 'agent-3', 'agent' ),
			message( 'agent-4', 'agent' ),
		] );

		expect( positions.get( 'agent-1' ) ).toEqual( {
			isLatestTurn: false,
			isLastInTurn: false,
			carriesTurnActions: false,
		} );
		expect( positions.get( 'agent-2' ) ).toEqual( {
			isLatestTurn: false,
			isLastInTurn: true,
			carriesTurnActions: true,
		} );
		expect( positions.get( 'agent-3' ) ).toEqual( {
			isLatestTurn: true,
			isLastInTurn: false,
			carriesTurnActions: false,
		} );
		expect( positions.get( 'agent-4' ) ).toEqual( {
			isLatestTurn: true,
			isLastInTurn: true,
			carriesTurnActions: true,
		} );
		expect( positions.has( 'user-1' ) ).toBe( false );
		expect( positions.has( 'user-2' ) ).toBe( false );
	} );

	it( 'does not split a turn on hidden context messages', () => {
		const positions = getAgentTurnPositions( [
			message( 'user-1', 'user' ),
			message( 'agent-1', 'agent' ),
			message( 'continuation', 'user', [ { type: 'context', text: 'navigated' } ] ),
			message( 'agent-2', 'agent' ),
		] );

		expect( positions.get( 'agent-1' ) ).toMatchObject( {
			isLatestTurn: true,
			isLastInTurn: false,
		} );
		expect( positions.get( 'agent-2' ) ).toMatchObject( {
			isLatestTurn: true,
			isLastInTurn: true,
		} );
	} );

	it( 'ignores agent messages with nothing to render', () => {
		const positions = getAgentTurnPositions( [
			message( 'user-1', 'user' ),
			message( 'agent-1', 'agent' ),
			message( 'agent-2', 'agent', [ { type: 'data', data: { flags: {} } } ] ),
		] );

		expect( positions.get( 'agent-1' ) ).toMatchObject( {
			isLastInTurn: true,
			carriesTurnActions: true,
		} );
		expect( positions.has( 'agent-2' ) ).toBe( false );
	} );

	it( 'keeps the carrier on the last text reply when a picker ends the turn', () => {
		const positions = getAgentTurnPositions( [
			message( 'user-1', 'user' ),
			message( 'reply', 'agent' ),
			picker( 'picker', 'Pick a palette' ),
		] );

		expect( positions.get( 'reply' ) ).toMatchObject( {
			isLastInTurn: false,
			carriesTurnActions: true,
		} );
		expect( positions.get( 'picker' ) ).toMatchObject( {
			isLastInTurn: true,
			carriesTurnActions: false,
		} );
	} );

	it( 'lets the caller veto a reply as carrier', () => {
		const positions = getAgentTurnPositions(
			[ message( 'user-1', 'user' ), message( 'reply', 'agent' ), message( 'notice', 'agent' ) ],
			{ canCarryTurnActions: ( candidate ) => candidate.id !== 'notice' }
		);

		expect( positions.get( 'reply' ) ).toMatchObject( { carriesTurnActions: true } );
		expect( positions.get( 'notice' ) ).toMatchObject( {
			isLastInTurn: true,
			carriesTurnActions: false,
		} );
	} );

	it( 'keeps the carrier on the reply that already holds a vote when the turn grows', () => {
		const positions = getAgentTurnPositions(
			[ message( 'user-1', 'user' ), message( 'rated', 'agent' ), message( 'follow-up', 'agent' ) ],
			{ hasTurnActions: ( candidate ) => candidate.id === 'rated' }
		);

		expect( positions.get( 'rated' ) ).toMatchObject( {
			isLastInTurn: false,
			carriesTurnActions: true,
		} );
		expect( positions.get( 'follow-up' ) ).toMatchObject( {
			isLastInTurn: true,
			carriesTurnActions: false,
		} );
	} );

	it( 'treats a reply the agent has not answered yet as closing the previous turn', () => {
		const positions = getAgentTurnPositions( [
			message( 'user-1', 'user' ),
			message( 'agent-1', 'agent' ),
			message( 'user-2', 'user' ),
		] );

		expect( positions.get( 'agent-1' ) ).toMatchObject( {
			isLatestTurn: false,
			carriesTurnActions: true,
		} );
	} );

	it( 'leaves a turn without a carrier when it only has components', () => {
		const positions = getAgentTurnPositions( [ message( 'user-1', 'user' ), picker( 'picker' ) ] );

		expect( positions.get( 'picker' ) ).toMatchObject( {
			isLastInTurn: true,
			carriesTurnActions: false,
		} );
	} );

	it( 'treats agent messages before any user reply as the latest turn', () => {
		const positions = getAgentTurnPositions( [ message( 'greeting', 'agent' ) ] );

		expect( positions.get( 'greeting' ) ).toEqual( {
			isLatestTurn: true,
			isLastInTurn: true,
			carriesTurnActions: true,
		} );
	} );

	it( 'returns an empty map without agent messages', () => {
		expect( getAgentTurnPositions( [ message( 'user-1', 'user' ) ] ).size ).toBe( 0 );
		expect( getAgentTurnPositions( [] ).size ).toBe( 0 );
	} );
} );
