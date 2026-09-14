/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../test-utils';
import McpStarterPrompts, { STARTER_PROMPTS } from '../starter-prompts-content';

let clipboardWriteText: jest.Mock;

function mockClipboard() {
	Object.defineProperty( window.navigator, 'clipboard', {
		value: { writeText: clipboardWriteText },
		configurable: true,
	} );
}

beforeEach( () => {
	clipboardWriteText = jest.fn().mockResolvedValue( undefined );
	mockClipboard();
} );

describe( '<McpStarterPrompts>', () => {
	test( 'shows a collapsed card per prompt with the prompt text hidden', () => {
		render( <McpStarterPrompts /> );

		for ( const prompt of STARTER_PROMPTS ) {
			expect( screen.getByText( prompt.title ) ).toBeVisible();
			expect( screen.getByText( prompt.description ) ).toBeVisible();
		}

		// The prompt text stays out of the way until the card is expanded.
		expect( screen.queryByText( STARTER_PROMPTS[ 0 ].prompt ) ).not.toBeInTheDocument();
	} );

	test( 'expands a card to reveal its prompt', async () => {
		render( <McpStarterPrompts /> );

		await userEvent.click( screen.getByText( STARTER_PROMPTS[ 0 ].title ) );

		expect( screen.getByText( STARTER_PROMPTS[ 0 ].prompt ) ).toBeVisible();
	} );

	test( 'expands each card independently', async () => {
		render( <McpStarterPrompts /> );

		await userEvent.click( screen.getByText( STARTER_PROMPTS[ 1 ].title ) );

		expect( screen.getByText( STARTER_PROMPTS[ 1 ].prompt ) ).toBeVisible();
		expect( screen.queryByText( STARTER_PROMPTS[ 0 ].prompt ) ).not.toBeInTheDocument();
	} );

	test( 'copies the raw prompt text and records a tracks event', async () => {
		const recordTracksEvent = jest.fn();
		render( <McpStarterPrompts recordTracksEvent={ recordTracksEvent } /> );

		const firstPrompt = STARTER_PROMPTS[ 0 ];
		await userEvent.click( screen.getByText( firstPrompt.title ) );
		await userEvent.click( screen.getByRole( 'button', { name: 'Copy prompt' } ) );

		expect( clipboardWriteText ).toHaveBeenCalledWith( firstPrompt.prompt );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_a4a_ai_mcp_starter_prompt_copied', {
			prompt_id: firstPrompt.id,
		} );
	} );

	test( 'confirms the copy on the button itself', async () => {
		render( <McpStarterPrompts /> );

		await userEvent.click( screen.getByText( STARTER_PROMPTS[ 0 ].title ) );
		await userEvent.click( screen.getByRole( 'button', { name: 'Copy prompt' } ) );

		expect( await screen.findByRole( 'button', { name: 'Copied' } ) ).toBeVisible();
	} );
} );
