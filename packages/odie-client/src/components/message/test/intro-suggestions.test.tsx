/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { IntroSuggestions } from '../intro-suggestions';
import type { Message } from '../../../types';

/**
 * Mutable state backing the mocked dependencies. Each test mutates these and
 * re-renders to drive the component through the scenario under test. Note the
 * introduction message is rendered separately in production and never stored
 * in chat.messages — seeds here must not include it.
 */
let mockMessages: Message[];
let mockStatus: string;
let mockProvider: string;
const mockTrackEvent = jest.fn();
const mockSendMessage = jest.fn();

jest.mock( '../../../context', () => ( {
	useOdieAssistantContext: () => ( {
		chat: { messages: mockMessages, status: mockStatus, provider: mockProvider },
		trackEvent: mockTrackEvent,
	} ),
} ) );

jest.mock( '../../../hooks', () => ( {
	useSendChatMessage: () => ( { sendMessage: mockSendMessage } ),
} ) );

jest.mock( '../intro-suggestions.scss', () => ( {} ) );

// Minimal stand-in that mirrors the library's submit contract exactly:
// `action` may veto by returning false, and `onSubmit` only fires for
// suggestions that carry a `prompt`.
jest.mock(
	'@automattic/agenttic-ui',
	() => {
		const { createElement } = jest.requireActual< typeof import('react') >( 'react' );
		return {
			Suggestions: ( {
				suggestions,
				onSubmit,
				layout,
			}: {
				suggestions: Array< {
					id: string;
					label: string;
					prompt?: string;
					action?: () => boolean | Promise< boolean >;
				} >;
				onSubmit?: ( selected: unknown, all: unknown ) => void;
				layout: string;
			} ) =>
				createElement(
					'div',
					{ 'data-testid': 'suggestions', 'data-layout': layout },
					suggestions.map( ( suggestion ) =>
						createElement(
							'button',
							{
								key: suggestion.id,
								onClick: async () => {
									let shouldSubmit = true;
									if ( suggestion.action ) {
										shouldSubmit = await suggestion.action();
									}
									if ( shouldSubmit && onSubmit && suggestion.prompt ) {
										onSubmit( suggestion, suggestions );
									}
								},
							},
							suggestion.label
						)
					)
				),
		};
	},
	{ virtual: true }
);

const userMessage = ( content: string ): Message =>
	( { content, role: 'user', type: 'message' } ) as Message;

describe( 'IntroSuggestions', () => {
	beforeEach( () => {
		mockMessages = [];
		mockStatus = 'loaded';
		mockProvider = 'odie';
		mockTrackEvent.mockClear();
		mockSendMessage.mockReset();
		mockSendMessage.mockResolvedValue( undefined );
		window.localStorage.removeItem( 'agentsManagerAskAi' );
	} );

	it( 'shows the top five topics vertically on a fresh chat', () => {
		render( <IntroSuggestions /> );

		expect( screen.getByTestId( 'suggestions' ) ).toHaveAttribute( 'data-layout', 'vertical' );
		[ 'Domains', 'Email', 'Themes & design', 'Traffic & SEO', 'Backups' ].forEach( ( label ) =>
			expect( screen.getByText( label ) ).toBeInTheDocument()
		);
		expect( screen.queryByText( 'Plans & billing' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Users' ) ).not.toBeInTheDocument();
	} );

	it( 'drills into a topic and tracks the click', async () => {
		render( <IntroSuggestions /> );

		fireEvent.click( screen.getByText( 'Domains' ) );

		expect( await screen.findByText( 'How do I connect a custom domain?' ) ).toBeInTheDocument();
		expect( screen.getByText( 'When does SSL activate on my domain?' ) ).toBeInTheDocument();
		expect( screen.getByText( '‹ All topics' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Email' ) ).not.toBeInTheDocument();
		expect( mockTrackEvent ).toHaveBeenCalledWith( 'chat_intro_topic_click', {
			topic: 'domains',
		} );
	} );

	it( 'returns to the topic list from the back item without sending anything', async () => {
		render( <IntroSuggestions /> );

		fireEvent.click( screen.getByText( 'Domains' ) );
		fireEvent.click( await screen.findByText( '‹ All topics' ) );

		expect( await screen.findByText( 'Email' ) ).toBeInTheDocument();
		expect( mockSendMessage ).not.toHaveBeenCalled();
		expect( mockTrackEvent ).toHaveBeenCalledWith( 'chat_intro_topic_back_click', {
			topic: 'domains',
		} );
	} );

	it( 'sends a question as a prompt and keeps the remaining topic questions up', async () => {
		render( <IntroSuggestions /> );

		fireEvent.click( screen.getByText( 'Domains' ) );
		fireEvent.click( await screen.findByText( 'How do I connect a custom domain?' ) );

		await waitFor( () =>
			expect( mockSendMessage ).toHaveBeenCalledWith(
				expect.objectContaining( {
					content: 'How do I connect a custom domain?',
					role: 'user',
				} )
			)
		);
		expect( mockTrackEvent ).toHaveBeenCalledWith( 'chat_intro_suggestion_click', {
			suggestion: 'custom-domain',
			topic: 'domains',
		} );
		// Asked question drops out; the rest of the topic stays, now horizontal.
		expect( screen.queryByText( 'How do I connect a custom domain?' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'When does SSL activate on my domain?' ) ).toBeInTheDocument();
		expect( screen.getByTestId( 'suggestions' ) ).toHaveAttribute( 'data-layout', 'horizontal' );
	} );

	it( 'switches to the horizontal row with every remaining topic after the first stored message', () => {
		mockMessages = [ userMessage( 'hello' ) ];
		render( <IntroSuggestions /> );

		expect( screen.getByTestId( 'suggestions' ) ).toHaveAttribute( 'data-layout', 'horizontal' );
		expect( screen.getByText( 'Plans & billing' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Users' ) ).toBeInTheDocument();
	} );

	it( 'treats questions already in the conversation history as asked', async () => {
		mockMessages = [ userMessage( 'How do I connect a custom domain?' ) ];
		render( <IntroSuggestions /> );

		fireEvent.click( screen.getByText( 'Domains' ) );

		expect( await screen.findByText( 'When does SSL activate on my domain?' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'How do I connect a custom domain?' ) ).not.toBeInTheDocument();
	} );

	it( 'hides a topic whose questions are all asked', () => {
		mockMessages = [
			userMessage( 'How do I connect a custom domain?' ),
			userMessage( 'How do I manage DNS records for my domain?' ),
			userMessage( 'When does SSL activate on my domain?' ),
		];
		render( <IntroSuggestions /> );

		expect( screen.queryByText( 'Domains' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Email' ) ).toBeInTheDocument();
	} );

	it( 'does not send while the bot is busy', async () => {
		mockStatus = 'sending';
		render( <IntroSuggestions /> );

		fireEvent.click( screen.getByText( 'Domains' ) );
		fireEvent.click( await screen.findByText( 'How do I connect a custom domain?' ) );

		await waitFor( () => expect( mockTrackEvent ).toHaveBeenCalled() );
		expect( mockSendMessage ).not.toHaveBeenCalled();
	} );

	it( 'restores the question chip when the send is aborted', async () => {
		mockSendMessage.mockRejectedValue( { type: 'abort' } );
		render( <IntroSuggestions /> );

		fireEvent.click( screen.getByText( 'Domains' ) );
		fireEvent.click( await screen.findByText( 'How do I connect a custom domain?' ) );

		expect( await screen.findByText( 'How do I connect a custom domain?' ) ).toBeInTheDocument();
	} );

	it( 'renders nothing during a live human (Zendesk) conversation', () => {
		mockProvider = 'zendesk';
		mockMessages = [ userMessage( 'hello' ) ];
		render( <IntroSuggestions /> );

		expect( screen.queryByTestId( 'suggestions' ) ).not.toBeInTheDocument();
	} );

	it( 'renders nothing while conversation history is loading', () => {
		mockStatus = 'loading';
		render( <IntroSuggestions /> );

		expect( screen.queryByTestId( 'suggestions' ) ).not.toBeInTheDocument();
	} );

	it( 'renders nothing when the prototype knob is off', () => {
		window.localStorage.setItem( 'agentsManagerAskAi', '0' );
		render( <IntroSuggestions /> );

		expect( screen.queryByTestId( 'suggestions' ) ).not.toBeInTheDocument();
	} );
} );
