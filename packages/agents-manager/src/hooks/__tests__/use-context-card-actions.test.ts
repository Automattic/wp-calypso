/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import {
	removeExternalContextCard,
	removeExternalContextEntry,
} from '../../utils/external-context';
import { useContextCardActions } from '../use-context-card-actions';
import type { ExternalContextCard } from '../../utils/external-context';

vi.mock( '../../utils/external-context', () => ( {
	removeExternalContextCard: vi.fn(),
	removeExternalContextEntry: vi.fn(),
} ) );

const card: ExternalContextCard = {
	id: 'card-1',
	contextEntryIds: [ 'entry-1', 'entry-2' ],
	body: null,
};

function renderContextCardActions() {
	const options = {
		beforeSubmit: vi.fn( () => true ),
		submitChatMessage: vi.fn( async () => {} ),
		setChatInput: vi.fn(),
	};
	const { result } = renderHook( () => useContextCardActions( options ) );

	return { ...options, ...result.current };
}

describe( 'useContextCardActions', () => {
	beforeEach( () => {
		vi.clearAllMocks();
	} );

	it( 'puts a prefill action’s prompt in the composer, keeping its context, without sending it', () => {
		const { handleContextCardAction, setChatInput, submitChatMessage } = renderContextCardActions();

		handleContextCardAction( card, { label: 'Ask', type: 'prefill', prompt: 'Explain this' } );

		expect( setChatInput ).toHaveBeenCalledWith( 'Explain this' );
		expect( submitChatMessage ).not.toHaveBeenCalled();
		expect( removeExternalContextCard ).toHaveBeenCalledWith( 'card-1' );
		expect( removeExternalContextEntry ).not.toHaveBeenCalled();
	} );

	it( 'drops the card and every context entry it carries when dismissed', () => {
		const { dismissContextCard } = renderContextCardActions();

		dismissContextCard( card );

		expect( removeExternalContextCard ).toHaveBeenCalledWith( 'card-1' );
		expect( vi.mocked( removeExternalContextEntry ).mock.calls ).toEqual( [
			[ 'entry-1' ],
			[ 'entry-2' ],
		] );
	} );
} );
