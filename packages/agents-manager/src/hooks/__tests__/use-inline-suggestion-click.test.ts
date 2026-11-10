/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useInlineSuggestionClick } from '../use-inline-suggestion-click';

function renderInlineSuggestionClick() {
	const setChatInput = jest.fn();
	const { result, unmount } = renderHook( () => useInlineSuggestionClick( setChatInput ) );

	return { setChatInput, dispatchSuggestionClick: result.current, unmount };
}

describe( 'useInlineSuggestionClick', () => {
	it( 'fills the composer with a clicked suggestion, ready for more text', () => {
		const { setChatInput, dispatchSuggestionClick } = renderInlineSuggestionClick();

		dispatchSuggestionClick( { id: 'tone', label: 'Change tone', prompt: 'Make it formal' } );

		expect( setChatInput ).toHaveBeenCalledWith( 'Make it formal ' );
	} );

	it( 'leaves the composer alone for a suggestion Agenttic already sent', () => {
		const { setChatInput, dispatchSuggestionClick } = renderInlineSuggestionClick();

		dispatchSuggestionClick( { id: 'tone', label: 'Change tone', autoSubmit: true } );

		expect( setChatInput ).not.toHaveBeenCalled();
	} );

	it( 'stops listening once unmounted', () => {
		const { setChatInput, unmount } = renderInlineSuggestionClick();

		unmount();
		window.dispatchEvent(
			new CustomEvent( 'big-sky-inline-suggestion-click', { detail: { value: 'Hello' } } )
		);

		expect( setChatInput ).not.toHaveBeenCalled();
	} );
} );
