/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen, within } from '@testing-library/react';
import { getEditorEmptyViewSuggestions } from '../../utils/editor-suggestions';
import EditorEmptyViewSuggestions from '../editor-empty-view-suggestions';
import type { Suggestion } from '@automattic/agenttic-ui';
import type { ReactNode } from 'react';

const MESSAGE_ID = 'site-ready';
const SITE_READY_MESSAGE = { id: MESSAGE_ID, role: 'agent', content: [] };
const mockHandleSuggestionSubmit = jest.fn();
let mockMessages: unknown[] = [];
let mockListContext: { variant?: string; reportSuggestionsRendered?: unknown } = {};

jest.mock(
	'@automattic/agenttic-ui',
	() => {
		const React = jest.requireActual< typeof import( 'react' ) >( 'react' );
		const Context = React.createContext( {
			variant: 'floating',
			// A getter, as the factory runs before `mockMessages` is set.
			get messages() {
				return mockMessages;
			},
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
	beforeEach( () => {
		mockMessages = [ SITE_READY_MESSAGE ];
	} );

	it( 'lists every editor empty-view suggestion vertically, even in the floating chat', () => {
		render( <EditorEmptyViewSuggestions messageId={ MESSAGE_ID } /> );

		const list = screen.getByRole( 'list', { name: 'vertical suggestions' } );

		expect(
			within( list )
				.getAllByRole( 'button' )
				.map( ( button ) => button.textContent )
		).toEqual( getEditorEmptyViewSuggestions().map( ( suggestion ) => suggestion.label ) );
		expect( mockListContext.variant ).toBe( 'embedded' );
	} );

	it( 'keeps the list out of the rendered suggestions tracking', () => {
		render( <EditorEmptyViewSuggestions messageId={ MESSAGE_ID } /> );

		expect( mockListContext.reportSuggestionsRendered ).toBeUndefined();
	} );

	it( 'sends a clicked suggestion through Agenttic', () => {
		const suggestions = getEditorEmptyViewSuggestions();
		render( <EditorEmptyViewSuggestions messageId={ MESSAGE_ID } /> );

		fireEvent.click( screen.getByRole( 'button', { name: suggestions[ 0 ].label } ) );

		expect( mockHandleSuggestionSubmit ).toHaveBeenCalledWith( suggestions[ 0 ], suggestions );
	} );

	it( 'goes away once the user replies', () => {
		mockMessages = [
			SITE_READY_MESSAGE,
			{ id: 'reply', role: 'user', content: [ { type: 'text', text: 'Add a page' } ] },
		];

		render( <EditorEmptyViewSuggestions messageId={ MESSAGE_ID } /> );

		expect( screen.queryByRole( 'list' ) ).not.toBeInTheDocument();
	} );

	it( 'stays when only a hidden context message follows', () => {
		mockMessages = [
			SITE_READY_MESSAGE,
			{ id: 'continuation', role: 'user', content: [ { type: 'context', text: 'Navigated' } ] },
		];

		render( <EditorEmptyViewSuggestions messageId={ MESSAGE_ID } /> );

		expect( screen.getByRole( 'list' ) ).toBeInTheDocument();
	} );
} );
