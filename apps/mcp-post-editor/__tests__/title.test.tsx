/**
 * @vitest-environment jsdom
 */
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TitleField } from '../editor';

// The block library loads only through the bundler.
vi.mock( '../editor/blocks', () => ( {} ) );

describe( 'the title', () => {
	afterEach( () => {
		document.body.innerHTML = '';
		vi.restoreAllMocks();
	} );

	// With a block selected, the writing flow keeps the focus and gets the input event, not the
	// title: the pick still reports the new title, with the suggestions done.
	it( 'reports a picked title when no input event reaches it', async () => {
		( globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean } ).IS_REACT_ACT_ENVIRONMENT = true;
		document.execCommand = vi.fn( () => true );
		const onChange = vi.fn();
		const onSuggestionsDone = vi.fn();
		const container = document.body.appendChild( document.createElement( 'div' ) );
		act( () =>
			createRoot( container ).render(
				<TitleField
					value="Old"
					readOnly={ false }
					isChanged={ false }
					onChange={ onChange }
					suggestions={ { id: 't1', titles: [ 'New' ] } }
					onSuggestionsDone={ onSuggestionsDone }
				/>
			)
		);

		act( () => container.querySelector< HTMLButtonElement >( '.mcp-post-editor__chip' )?.click() );
		// The title takes the pick once the block's unselection has rendered.
		await act( () => new Promise( ( resolve ) => requestAnimationFrame( resolve ) ) );

		expect( document.execCommand ).toHaveBeenCalledWith( 'insertText', false, 'New' );
		expect( container.querySelector( '.editor-post-title' )?.textContent ).toBe( 'New' );
		expect( onChange ).toHaveBeenCalledWith( 'New' );
		expect( onSuggestionsDone ).toHaveBeenCalledWith( 't1' );
		expect( document.activeElement ).toBe( container.querySelector( '.editor-post-title' ) );
	} );
} );
