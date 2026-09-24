/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import {
	AGENT_TURN_ENDED_EVENT,
	AGENT_TURN_STARTED_EVENT,
} from '../../utils/agent-activity-events';
import { useBroadcastTurnActivity } from '../use-broadcast-turn-activity';

const mockIsTurnInFlight = jest.fn();

jest.mock(
	'@automattic/agenttic-client',
	() => ( { getAgentManager: () => ( { isTurnInFlight: mockIsTurnInFlight } ) } ),
	{ virtual: true }
);

const AGENT_ID = 'wpcom-orchestrator';

beforeEach( () => {
	mockIsTurnInFlight.mockReturnValue( false );

	// The hook remembers what it last announced at module scope, deliberately,
	// so that the chat unmounting does not reset it. Reloading the module would
	// hand it a second copy of React, so it is driven back to quiet instead —
	// before any listener is attached, so the tests never see this.
	renderHook( () => useBroadcastTurnActivity( AGENT_ID, false ) ).unmount();
} );

function render( isProcessing = false ) {
	const started = jest.fn();
	const ended = jest.fn();
	window.addEventListener( AGENT_TURN_STARTED_EVENT, started );
	window.addEventListener( AGENT_TURN_ENDED_EVENT, ended );

	const view = renderHook(
		( props: { isProcessing: boolean } ) =>
			useBroadcastTurnActivity( AGENT_ID, props.isProcessing ),
		{ initialProps: { isProcessing } }
	);

	return {
		started,
		ended,
		setProcessing: ( next: boolean ) => view.rerender( { isProcessing: next } ),
		unmount: () => view.unmount(),
		cleanup: () => {
			window.removeEventListener( AGENT_TURN_STARTED_EVENT, started );
			window.removeEventListener( AGENT_TURN_ENDED_EVENT, ended );
		},
	};
}

describe( 'useBroadcastTurnActivity', () => {
	it( 'broadcasts nothing while idle', () => {
		const { started, ended, cleanup } = render();

		expect( started ).not.toHaveBeenCalled();
		expect( ended ).not.toHaveBeenCalled();
		cleanup();
	} );

	it( 'broadcasts a start when a turn begins', () => {
		const { started, ended, setProcessing, cleanup } = render();

		setProcessing( true );

		expect( started ).toHaveBeenCalledTimes( 1 );
		expect( ended ).not.toHaveBeenCalled();
		cleanup();
	} );

	it( 'broadcasts an end when the turn finishes', () => {
		const { started, ended, setProcessing, cleanup } = render();

		setProcessing( true );
		setProcessing( false );

		expect( started ).toHaveBeenCalledTimes( 1 );
		expect( ended ).toHaveBeenCalledTimes( 1 );
		cleanup();
	} );

	it( 'does not repeat a broadcast for an unchanged state', () => {
		const { started, ended, setProcessing, cleanup } = render();

		setProcessing( true );
		setProcessing( true );
		setProcessing( false );
		setProcessing( false );

		expect( started ).toHaveBeenCalledTimes( 1 );
		expect( ended ).toHaveBeenCalledTimes( 1 );
		cleanup();
	} );

	it( 'treats mounting onto a turn the manager is still running as a start', () => {
		// The remount case: `useAgentChat` starts a fresh instance at
		// `isProcessing: false` and never re-attaches to the running stream, so
		// the manager is the only thing that knows a turn is in flight.
		mockIsTurnInFlight.mockReturnValue( true );

		const { started, cleanup } = render( false );

		expect( started ).toHaveBeenCalledTimes( 1 );
		cleanup();
	} );

	it( 'does not report a turn as ended when the manager is still running it', () => {
		// The chat is one route among several: opening conversation history
		// mid-turn unmounts it while the agent carries on writing.
		mockIsTurnInFlight.mockReturnValue( true );

		const { ended, unmount, cleanup } = render( true );

		unmount();

		expect( ended ).not.toHaveBeenCalled();
		cleanup();
	} );

	it( 'reports the end on unmount once the manager says the turn is over', () => {
		const { ended, unmount, cleanup } = render( true );

		unmount();

		expect( ended ).toHaveBeenCalledTimes( 1 );
		cleanup();
	} );

	it( 'announces the end on the next mount when the turn finished while unmounted', () => {
		// Nothing is listening between the two, so the end is owed until the
		// chat comes back. A listener is told the agent is still working until
		// then, which is the safe way round.
		mockIsTurnInFlight.mockReturnValue( true );

		const first = render( true );
		first.unmount();
		expect( first.ended ).not.toHaveBeenCalled();
		first.cleanup();

		mockIsTurnInFlight.mockReturnValue( false );

		const second = render( false );

		expect( second.ended ).toHaveBeenCalledTimes( 1 );
		expect( second.started ).not.toHaveBeenCalled();
		second.cleanup();
	} );
} );
