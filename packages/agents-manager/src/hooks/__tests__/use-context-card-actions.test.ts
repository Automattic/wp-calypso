/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import {
	removeExternalContextCard,
	removeExternalContextEntry,
} from '../../utils/external-context';
import { useContextCardActions } from '../use-context-card-actions';
import type { ExternalContextCard } from '../../utils/external-context';

jest.mock( '../../utils/external-context', () => ( {
	removeExternalContextCard: jest.fn(),
	removeExternalContextEntry: jest.fn(),
} ) );

const card: ExternalContextCard = {
	id: 'card-1',
	contextEntryIds: [ 'entry-1', 'entry-2' ],
	body: null,
};

function renderContextCardActions() {
	const options = {
		beforeSubmit: jest.fn( () => true ),
		submitChatMessage: jest.fn( async () => {} ),
		setChatInput: jest.fn(),
	};
	const { result } = renderHook( () => useContextCardActions( options ) );

	return { ...options, ...result.current };
}

describe( 'useContextCardActions', () => {
	beforeEach( () => {
		jest.clearAllMocks();
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
		expect( jest.mocked( removeExternalContextEntry ).mock.calls ).toEqual( [
			[ 'entry-1' ],
			[ 'entry-2' ],
		] );
	} );
} );
