/**
 * @jest-environment jsdom
 */
import { TOOL_RESULT_EVENT, type ToolResultDetail } from '../agent-activity-events';
import { broadcastTaskUpdateToolResults } from '../tool-result-broadcast';
import type { TaskUpdate } from '@automattic/agenttic-client';

const TOOL_ID = 'wpcom__site_settings_update';

let toolCallCounter = 0;
const nextToolCallId = () => `call-${ ++toolCallCounter }`;

function listen() {
	const events: ToolResultDetail[] = [];
	const listener = ( event: Event ) => {
		events.push( ( event as CustomEvent< ToolResultDetail > ).detail );
	};
	window.addEventListener( TOOL_RESULT_EVENT, listener );

	return {
		events,
		cleanup: () => window.removeEventListener( TOOL_RESULT_EVENT, listener ),
	};
}

function updateWithParts( parts: unknown[], role = 'agent' ): TaskUpdate {
	return {
		id: 'task-1',
		text: '',
		status: { state: 'working', message: { role, parts } },
	} as unknown as TaskUpdate;
}

function resultPart( toolCallId = nextToolCallId() ) {
	return { type: 'data', data: { toolCallId, toolId: TOOL_ID, result: { success: true } } };
}

function toolMessagePart( toolCallId = nextToolCallId() ) {
	return {
		type: 'text',
		text: JSON.stringify( { tool_id: TOOL_ID, tool_call_id: toolCallId, data: {} } ),
	};
}

describe( 'broadcastTaskUpdateToolResults', () => {
	let listener: ReturnType< typeof listen >;

	beforeEach( () => {
		listener = listen();
	} );

	afterEach( () => listener.cleanup() );

	it( 'announces a tool-result data part', () => {
		const part = resultPart();

		broadcastTaskUpdateToolResults( updateWithParts( [ part ] ) );

		expect( listener.events ).toEqual( [ { toolCallId: part.data.toolCallId, toolId: TOOL_ID } ] );
	} );

	it( 'announces a tool message', () => {
		broadcastTaskUpdateToolResults( updateWithParts( [ toolMessagePart( 'call-message' ) ] ) );

		expect( listener.events ).toEqual( [ { toolCallId: 'call-message', toolId: TOOL_ID } ] );
	} );

	it( 'announces a tool call once, however many updates repeat it', () => {
		const part = resultPart();

		broadcastTaskUpdateToolResults( updateWithParts( [ part ] ) );
		broadcastTaskUpdateToolResults( updateWithParts( [ part ] ) );

		expect( listener.events ).toHaveLength( 1 );
	} );

	it( 'skips the tool-result echo of earlier turns', () => {
		broadcastTaskUpdateToolResults( updateWithParts( [ resultPart() ], 'user' ) );

		expect( listener.events ).toEqual( [] );
	} );

	it( 'stays quiet for tool calls without a result and for plain text', () => {
		broadcastTaskUpdateToolResults(
			updateWithParts( [
				{ type: 'data', data: { toolCallId: nextToolCallId(), toolId: TOOL_ID, arguments: {} } },
				{ type: 'text', text: 'Done!' },
			] )
		);

		expect( listener.events ).toEqual( [] );
	} );
} );
