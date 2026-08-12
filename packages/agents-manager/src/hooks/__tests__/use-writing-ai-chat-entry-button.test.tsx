/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import useWritingAiChatEntryButton from '../use-writing-ai-chat-entry-button';

afterEach( () => {
	document.body.innerHTML = '';
} );

describe( 'useWritingAiChatEntryButton', () => {
	it.each( [
		{ className: '', id: 'wp-admin-bar-agents-manager-ai-chat' },
		{ className: 'masterbar__item-agents-manager-ai-chat', id: '' },
	] )( 'wires the external writing entry', ( { className, id } ) => {
		const entry = document.createElement( 'div' );
		entry.className = className;
		entry.id = id;
		const child = document.createElement( 'span' );
		entry.appendChild( child );
		document.body.appendChild( entry );
		const onClick = jest.fn();

		const { result } = renderHook( () => useWritingAiChatEntryButton( onClick ) );
		expect( result.current ).toBe( true );

		act( () => child.click() );
		expect( onClick ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'does not double-handle the React editor toolbar button', () => {
		const entry = document.createElement( 'button' );
		entry.className = 'agents-manager-ai-chat';
		document.body.appendChild( entry );
		const onClick = jest.fn();

		const { result } = renderHook( () => useWritingAiChatEntryButton( onClick ) );
		expect( result.current ).toBe( true );

		act( () => entry.click() );
		expect( onClick ).not.toHaveBeenCalled();
	} );
} );
