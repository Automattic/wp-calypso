import { getTaskUpdateOutcome, isSuccessfulTaskUpdate, isTerminalTaskUpdate } from '../task-update';
import type { TaskUpdate } from '@automattic/agenttic-client';

jest.mock( '@automattic/agenttic-client', () => ( { extractToolCallsFromMessage: jest.fn() } ), {
	virtual: true,
} );

function taskUpdate( state: string, final?: boolean ) {
	return { id: 'task-1', final, status: { state } } as unknown as TaskUpdate;
}

describe( 'task update outcomes', () => {
	it.each( [
		{
			state: 'working',
			final: undefined,
			isTerminal: false,
			isSuccessful: false,
			outcome: 'completed',
		},
		{ state: 'working', final: true, isTerminal: true, isSuccessful: true, outcome: 'completed' },
		{
			state: 'completed',
			final: undefined,
			isTerminal: true,
			isSuccessful: true,
			outcome: 'completed',
		},
		{ state: 'canceled', final: true, isTerminal: true, isSuccessful: false, outcome: 'canceled' },
		{ state: 'failed', final: undefined, isTerminal: true, isSuccessful: false, outcome: 'failed' },
	] )(
		'classifies a $state update (final: $final)',
		( { state, final, isTerminal, isSuccessful, outcome } ) => {
			const update = taskUpdate( state, final );

			expect( isTerminalTaskUpdate( update ) ).toBe( isTerminal );
			expect( isSuccessfulTaskUpdate( update ) ).toBe( isSuccessful );
			expect( getTaskUpdateOutcome( update ) ).toBe( outcome );
		}
	);
} );
