import { getAgentManager } from '@automattic/agenttic-client';
import { DOLLY_AGENT_ID } from '../../constants';
import { BIG_SKY_SHOW_COMPONENT_TOOL_ID } from '../show-component-tools';
import { getToolCallIdFromConversationHistory } from '../tool-call-history';

jest.mock( '@automattic/agenttic-client', () => ( { getAgentManager: jest.fn() } ), {
	virtual: true,
} );

const mockGetAgentManager = getAgentManager as jest.Mock;

function toolCallMessage( toolId: string, toolCallId: string ) {
	return {
		parts: [ { data: { toolId, toolCallId, arguments: {} } } ],
	};
}

function setHistory( history: unknown[], agentKey = 'wp-orchestrator' ) {
	mockGetAgentManager.mockReturnValue( {
		hasAgent: ( key: string ) => key === agentKey,
		getConversationHistory: () => history,
	} );
}

beforeEach( () => jest.clearAllMocks() );

describe( 'getToolCallIdFromConversationHistory', () => {
	it( 'returns null when no agent manager exists', () => {
		mockGetAgentManager.mockReturnValue( undefined );

		expect( getToolCallIdFromConversationHistory( BIG_SKY_SHOW_COMPONENT_TOOL_ID ) ).toBeNull();
	} );

	it( 'returns the most recent matching call by default', () => {
		setHistory( [
			toolCallMessage( BIG_SKY_SHOW_COMPONENT_TOOL_ID, 'toolu_1' ),
			toolCallMessage( BIG_SKY_SHOW_COMPONENT_TOOL_ID, 'toolu_2' ),
		] );

		expect( getToolCallIdFromConversationHistory( BIG_SKY_SHOW_COMPONENT_TOOL_ID ) ).toBe(
			'toolu_2'
		);
	} );

	it( 'checks the dolly agent too', () => {
		setHistory( [ toolCallMessage( BIG_SKY_SHOW_COMPONENT_TOOL_ID, 'toolu_1' ) ], DOLLY_AGENT_ID );

		expect( getToolCallIdFromConversationHistory( BIG_SKY_SHOW_COMPONENT_TOOL_ID ) ).toBe(
			'toolu_1'
		);
	} );

	it.each( [
		[
			'a different tool',
			{ toolId: 'big_sky__editor_navigate', toolCallId: 'toolu_1', arguments: {} },
		],
		[ 'no tool call id', { toolId: BIG_SKY_SHOW_COMPONENT_TOOL_ID, arguments: {} } ],
		[ 'no arguments', { toolId: BIG_SKY_SHOW_COMPONENT_TOOL_ID, toolCallId: 'toolu_1' } ],
	] )( 'ignores history parts with %s', ( _case, data ) => {
		setHistory( [ { parts: [ { data } ] } ] );

		expect( getToolCallIdFromConversationHistory( BIG_SKY_SHOW_COMPONENT_TOOL_ID ) ).toBeNull();
	} );
} );
