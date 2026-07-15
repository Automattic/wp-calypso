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
	test( 'shows a collapsed FAQ item per prompt with the prompt text hidden', () => {
		render( <McpStarterPrompts /> );

		expect( screen.getByText( 'Starter prompts' ) ).toBeVisible();
		expect( screen.getByText( 'Program health snapshot' ) ).toBeVisible();
		expect( screen.getByText( 'Portfolio health summary' ) ).toBeVisible();
		expect( screen.getByText( 'Recurring weekly report' ) ).toBeVisible();

		// The prompt text stays out of the way until the item is expanded.
		expect( screen.queryByText( STARTER_PROMPTS[ 0 ].prompt ) ).not.toBeInTheDocument();
	} );

	test( 'expands an item to reveal its prompt', async () => {
		render( <McpStarterPrompts /> );

		await userEvent.click( screen.getByText( 'Program health snapshot' ) );

		expect( screen.getByText( STARTER_PROMPTS[ 0 ].prompt ) ).toBeVisible();
	} );

	test( 'copies the raw prompt text and records a tracks event', async () => {
		const recordTracksEvent = jest.fn();
		render( <McpStarterPrompts recordTracksEvent={ recordTracksEvent } /> );

		const firstPrompt = STARTER_PROMPTS[ 0 ];
		await userEvent.click( screen.getByText( firstPrompt.title ) );
		await userEvent.click( screen.getByRole( 'button', { name: /copy prompt/i } ) );

		expect( clipboardWriteText ).toHaveBeenCalledWith( firstPrompt.prompt );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_a4a_ai_mcp_starter_prompt_copied', {
			prompt_id: firstPrompt.id,
		} );
	} );

	test( 'items cannot be expanded when disabled', async () => {
		render( <McpStarterPrompts disabled /> );

		await userEvent.click( screen.getByText( 'Program health snapshot' ) );

		expect( screen.queryByText( STARTER_PROMPTS[ 0 ].prompt ) ).not.toBeInTheDocument();
	} );
} );
