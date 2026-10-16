/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen, within } from '@testing-library/react';
import { getEditorEmptyViewSuggestions } from '../../utils/editor-suggestions';
import EditorEmptyViewSuggestions from '../editor-empty-view-suggestions';
import type { Suggestion } from '@automattic/agenttic-ui';
import type { ReactNode } from 'react';

const mockHandleSuggestionSubmit = jest.fn();
let mockListContext: { variant?: string; reportSuggestionsRendered?: unknown } = {};

jest.mock(
	'@automattic/agenttic-ui',
	() => {
		const React = jest.requireActual< typeof import( 'react' ) >( 'react' );
		const Context = React.createContext( {
			variant: 'floating',
			handleSuggestionSubmit: ( ...args: unknown[] ) => mockHandleSuggestionSubmit( ...args ),
			reportSuggestionsRendered: () => {},
		} );

		return {
			useAgentUIContext: () => React.useContext( Context ),
			AgentUIProvider: ( { value, children }: { value: object; children: ReactNode } ) => (
				<Context.Provider value={ value as never }>{ children }</Context.Provider>
			),
			Suggestions: ( {
				layout,
				suggestions,
				onSubmit,
			}: {
				layout: string;
				suggestions: Suggestion[];
				onSubmit: ( selected: Suggestion, available: Suggestion[] ) => void;
			} ) => {
				mockListContext = React.useContext( Context );

				return (
					<div role="list" aria-label={ `${ layout } suggestions` }>
						{ suggestions.map( ( suggestion ) => (
							<button key={ suggestion.id } onClick={ () => onSubmit( suggestion, suggestions ) }>
								{ suggestion.label }
							</button>
						) ) }
					</div>
				);
			},
		};
	},
	{ virtual: true }
);

describe( 'EditorEmptyViewSuggestions', () => {
	it( 'lists every editor empty-view suggestion vertically, even in the floating chat', () => {
		render( <EditorEmptyViewSuggestions /> );

		const list = screen.getByRole( 'list', { name: 'vertical suggestions' } );

		expect(
			within( list )
				.getAllByRole( 'button' )
				.map( ( button ) => button.textContent )
		).toEqual( getEditorEmptyViewSuggestions().map( ( suggestion ) => suggestion.label ) );
		expect( mockListContext.variant ).toBe( 'embedded' );
	} );

	it( 'keeps the list out of the rendered suggestions tracking', () => {
		render( <EditorEmptyViewSuggestions /> );

		expect( mockListContext.reportSuggestionsRendered ).toBeUndefined();
	} );

	it( 'sends a clicked suggestion through Agenttic', () => {
		const suggestions = getEditorEmptyViewSuggestions();
		render( <EditorEmptyViewSuggestions /> );

		fireEvent.click( screen.getByRole( 'button', { name: suggestions[ 0 ].label } ) );

		expect( mockHandleSuggestionSubmit ).toHaveBeenCalledWith( suggestions[ 0 ], suggestions );
	} );
} );
