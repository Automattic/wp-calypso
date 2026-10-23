/** @jest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import { useChatComposer } from '../use-chat-composer';

jest.mock( '../use-image-upload', () => ( { useImageUpload: () => ( { pendingImages: [] } ) } ) );
jest.mock( '../../utils/tracks', () => ( {
	recordAgentsManagerTracksEvent: () => {},
	recordBigSkyTracksEvent: () => {},
} ) );
jest.mock( '../../utils/canvas-binding', () => ( { startNewUserRequest: () => {} } ) );
jest.mock( '../../utils/turn-id', () => ( { startTurn: () => {} } ) );
jest.mock( '../../utils/external-context', () => ( {
	consumeNextMessageExternalContextEntries: () => {},
} ) );

it.each( [
	'submitComposerMessage',
	'submitHostMessage',
	'submitRetryMessage',
	'submitChatMessage',
] as const )(
	'refuses %s while approval is pending without clearing the draft',
	async ( method ) => {
		const sent: string[] = [];
		let blocked = true;
		const { result } = renderHook( () =>
			useChatComposer( {
				isReaderChat: false,
				isBlocked: () => blocked,
				beforeSubmit: () => true,
				onSubmit: async ( text ) => {
					sent.push( text );
				},
				abortCurrentRequest: () => {},
				flushPendingNavigation: async () => {},
				suggestionPromptsRef: { current: new Set( [ 'Draft' ] ) },
			} )
		);
		act( () => {
			result.current.setInputValue( 'Draft' );
		} );
		await act( async () => {
			await result.current[ method ]( 'Draft' );
		} );
		expect( sent ).toHaveLength( 0 );
		expect( result.current.inputValue ).toBe( 'Draft' );
		blocked = false;
		await act( async () => {
			await result.current[ method ]( 'Draft' );
		} );
		expect( sent ).toEqual( [ 'Draft' ] );
	}
);
