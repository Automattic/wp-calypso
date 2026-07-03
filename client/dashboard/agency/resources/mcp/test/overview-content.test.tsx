/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { render } from '../../../../test-utils';
import McpOverview from '../overview-content';
import type { McpSettings } from '@automattic/api-core';

const enabledSettings = { enabled: true, available_abilities: [] } as unknown as McpSettings;
const disabledSettings = { enabled: false, available_abilities: [] } as unknown as McpSettings;

describe( '<McpOverview> starter prompts section', () => {
	test( 'expands the starter prompts inline when MCP access is enabled', () => {
		render( <McpOverview settings={ enabledSettings } onSave={ jest.fn() } /> );

		expect( screen.getByText( 'Starter prompts' ) ).toBeVisible();
		expect( screen.getByText( 'Program health snapshot' ) ).toBeVisible();
	} );

	test( 'collapses and disables the starter prompts section until MCP access is enabled', () => {
		render( <McpOverview settings={ disabledSettings } onSave={ jest.fn() } /> );

		expect( screen.getByText( 'Starter prompts' ) ).toBeVisible();
		expect( screen.queryByText( 'Program health snapshot' ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Toggle starter prompts' } ) ).toBeDisabled();
	} );
} );
