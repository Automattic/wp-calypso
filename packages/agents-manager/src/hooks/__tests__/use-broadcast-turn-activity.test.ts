/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import {
	AGENT_TURN_ENDED_EVENT,
	AGENT_TURN_STARTED_EVENT,
} from '../../utils/agent-activity-events';
import { useBroadcastTurnActivity } from '../use-broadcast-turn-activity';

function renderWithProcessing( initial: boolean ) {
	const started = jest.fn();
	const ended = jest.fn();
	window.addEventListener( AGENT_TURN_STARTED_EVENT, started );
	window.addEventListener( AGENT_TURN_ENDED_EVENT, ended );

	const view = renderHook( ( { isProcessing } ) => useBroadcastTurnActivity( isProcessing ), {
		initialProps: { isProcessing: initial },
	} );

	return {
		started,
		ended,
		setProcessing: ( isProcessing: boolean ) => view.rerender( { isProcessing } ),
		cleanup: () => {
			window.removeEventListener( AGENT_TURN_STARTED_EVENT, started );
			window.removeEventListener( AGENT_TURN_ENDED_EVENT, ended );
		},
	};
}

describe( 'useBroadcastTurnActivity', () => {
	it( 'broadcasts nothing while idle', () => {
		const { started, ended, cleanup } = renderWithProcessing( false );

		expect( started ).not.toHaveBeenCalled();
		expect( ended ).not.toHaveBeenCalled();
		cleanup();
	} );

	it( 'broadcasts a start when a turn begins', () => {
		const { started, ended, setProcessing, cleanup } = renderWithProcessing( false );

		setProcessing( true );

		expect( started ).toHaveBeenCalledTimes( 1 );
		expect( ended ).not.toHaveBeenCalled();
		cleanup();
	} );

	it( 'broadcasts an end when the turn finishes', () => {
		const { started, ended, setProcessing, cleanup } = renderWithProcessing( false );

		setProcessing( true );
		setProcessing( false );

		expect( started ).toHaveBeenCalledTimes( 1 );
		expect( ended ).toHaveBeenCalledTimes( 1 );
		cleanup();
	} );

	it( 'treats mounting mid-turn as a start', () => {
		// A listener that attaches after the turn began still needs to know one
		// is in flight, or it will read the turn's writes as nobody's.
		const { started, cleanup } = renderWithProcessing( true );

		expect( started ).toHaveBeenCalledTimes( 1 );
		cleanup();
	} );

	it( 'does not repeat a broadcast for an unchanged state', () => {
		const { started, ended, setProcessing, cleanup } = renderWithProcessing( false );

		setProcessing( true );
		setProcessing( true );
		setProcessing( false );
		setProcessing( false );

		expect( started ).toHaveBeenCalledTimes( 1 );
		expect( ended ).toHaveBeenCalledTimes( 1 );
		cleanup();
	} );

	it( 'reports a turn still open on unmount as ended', () => {
		// The chat unmounting mid-turn (dock closed, page navigated) takes the
		// turn with it; a listener left waiting for the end would wait forever.
		const { ended, cleanup } = renderWithProcessing( true );
		const view = renderHook( () => useBroadcastTurnActivity( true ) );

		view.unmount();

		expect( ended ).toHaveBeenCalledTimes( 1 );
		cleanup();
	} );
} );
