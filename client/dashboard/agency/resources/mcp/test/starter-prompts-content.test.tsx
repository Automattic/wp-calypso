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
	test( 'is expanded by default and shows all three prompts when enabled', () => {
		render( <McpStarterPrompts /> );

		expect( screen.getByText( 'Starter prompts' ) ).toBeVisible();
		expect( screen.getByText( 'Program health snapshot' ) ).toBeVisible();
		expect( screen.getByText( 'Portfolio health summary' ) ).toBeVisible();
		expect( screen.getByText( 'Recurring weekly report' ) ).toBeVisible();
	} );

	test( 'can be collapsed by the user', async () => {
		render( <McpStarterPrompts /> );

		await userEvent.click(
			screen.getAllByRole( 'button', { name: 'Toggle starter prompts' } )[ 0 ]
		);

		expect( screen.queryByText( 'Program health snapshot' ) ).not.toBeInTheDocument();
	} );

	test( 'copies the raw prompt text and records a tracks event', async () => {
		const recordTracksEvent = jest.fn();
		render( <McpStarterPrompts recordTracksEvent={ recordTracksEvent } /> );

		const firstPrompt = STARTER_PROMPTS[ 0 ];
		await userEvent.click( screen.getAllByRole( 'button', { name: /copy prompt/i } )[ 0 ] );

		expect( clipboardWriteText ).toHaveBeenCalledWith( firstPrompt.prompt );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_a4a_ai_mcp_starter_prompt_copied', {
			prompt_id: firstPrompt.id,
		} );
	} );

	test( 'is collapsed and cannot be expanded when disabled', async () => {
		render( <McpStarterPrompts disabled /> );

		expect( screen.queryByText( 'Program health snapshot' ) ).not.toBeInTheDocument();

		await userEvent.click( screen.getByText( 'Starter prompts' ) );

		expect( screen.queryByText( 'Program health snapshot' ) ).not.toBeInTheDocument();
	} );
} );
