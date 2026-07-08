/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../test-utils';
import McpOverview from '../overview-content';
import type { McpSettings } from '@automattic/api-core';

const enabledSettings = { enabled: true, available_abilities: [] } as unknown as McpSettings;
const disabledSettings = { enabled: false, available_abilities: [] } as unknown as McpSettings;

describe( '<McpOverview> starter prompts section', () => {
	test( 'shows expandable starter prompts when MCP access is enabled', async () => {
		render( <McpOverview settings={ enabledSettings } onSave={ jest.fn() } /> );

		expect( screen.getByText( 'Starter prompts' ) ).toBeVisible();
		expect( screen.getByText( 'Program health snapshot' ) ).toBeVisible();

		await userEvent.click( screen.getByText( 'Program health snapshot' ) );
		expect(
			screen.getByText( /Give me a high-level health check of my Automattic for Agencies account/ )
		).toBeVisible();
	} );

	test( 'disables the starter prompts until MCP access is enabled', async () => {
		render( <McpOverview settings={ disabledSettings } onSave={ jest.fn() } /> );

		expect( screen.getByText( 'Starter prompts' ) ).toBeVisible();
		expect( screen.getByText( 'Program health snapshot' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Program health snapshot' } ) ).toBeDisabled();

		await userEvent.click( screen.getByText( 'Program health snapshot' ) );
		expect(
			screen.queryByText(
				/Give me a high-level health check of my Automattic for Agencies account/
			)
		).not.toBeInTheDocument();
	} );
} );
