/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../test-utils';
import McpOverview from '../overview-content';
import type { McpAvailableAbility, McpSettings } from '@automattic/api-core';

function ability( name: string, enabled: boolean ): McpAvailableAbility {
	return { name, title: name, description: '', category: 'sites', enabled };
}

function settings( enabled: boolean, abilities: McpAvailableAbility[] = [] ): McpSettings {
	return {
		enabled,
		available_categories: [ { slug: 'sites', label: 'Sites' } ],
		available_abilities: abilities,
	};
}

describe( '<McpOverview>', () => {
	test( 'toggling MCP access saves the new value', async () => {
		const onSave = jest.fn();
		render( <McpOverview settings={ settings( false ) } onSave={ onSave } /> );

		await userEvent.click( screen.getByRole( 'checkbox', { name: 'Enable MCP access' } ) );

		expect( onSave ).toHaveBeenCalledWith( { enabled: true } );
	} );

	test( 'shows how many read tools are enabled', () => {
		render(
			<McpOverview
				settings={ settings( true, [
					ability( 'get-site-health', true ),
					ability( 'list-invoices', true ),
					ability( 'get-billing-summary', false ),
				] ) }
				onSave={ jest.fn() }
			/>
		);

		expect( screen.getByText( '2 of 3 enabled' ) ).toBeVisible();
	} );

	test( 'shows "All enabled" when every read tool is on', () => {
		render(
			<McpOverview
				settings={ settings( true, [ ability( 'get-site-health', true ) ] ) }
				onSave={ jest.fn() }
			/>
		);

		expect( screen.getByText( 'All enabled' ) ).toBeVisible();
	} );

	test( 'shows "None enabled" when every read tool is off', () => {
		render(
			<McpOverview
				settings={ settings( true, [ ability( 'get-site-health', false ) ] ) }
				onSave={ jest.fn() }
			/>
		);

		expect( screen.getByText( 'None enabled' ) ).toBeVisible();
	} );

	test( 'links Read and Connect to their screens once MCP access is enabled', () => {
		render(
			<McpOverview
				settings={ settings( true, [ ability( 'get-site-health', true ) ] ) }
				onSave={ jest.fn() }
			/>
		);

		expect( screen.getByRole( 'link', { name: /^Read\b/ } ) ).toHaveAttribute(
			'href',
			'/resources/ai-mcp/tools'
		);
		expect(
			screen.getByRole( 'link', { name: /^Connect external AI assistant/ } )
		).toHaveAttribute( 'href', '/resources/ai-mcp/connect' );
	} );

	test( 'disables Read and Connect until MCP access is enabled', () => {
		render(
			<McpOverview
				settings={ settings( false, [ ability( 'get-site-health', true ) ] ) }
				onSave={ jest.fn() }
			/>
		);

		expect( screen.getByRole( 'button', { name: /^Read\b/ } ) ).toHaveAttribute(
			'aria-disabled',
			'true'
		);
		expect(
			screen.getByRole( 'button', { name: /^Connect external AI assistant/ } )
		).toHaveAttribute( 'aria-disabled', 'true' );
	} );

	test( 'shows Write as coming soon', () => {
		render(
			<McpOverview
				settings={ settings( true, [ ability( 'get-site-health', true ) ] ) }
				onSave={ jest.fn() }
			/>
		);

		expect( screen.getByText( 'Coming soon' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: /^Write\b/ } ) ).toHaveAttribute(
			'aria-disabled',
			'true'
		);
	} );

	test( 'shows Starter prompts as disabled for now', () => {
		render(
			<McpOverview
				settings={ settings( true, [ ability( 'get-site-health', true ) ] ) }
				onSave={ jest.fn() }
			/>
		);

		expect( screen.getByRole( 'button', { name: /^Starter prompts/ } ) ).toHaveAttribute(
			'aria-disabled',
			'true'
		);
	} );

	test( 'navigates via onNavigate instead of the href when provided', async () => {
		const onNavigate = jest.fn();
		render(
			<McpOverview
				settings={ settings( true, [ ability( 'get-site-health', true ) ] ) }
				onSave={ jest.fn() }
				onNavigate={ onNavigate }
			/>
		);

		await userEvent.click( screen.getByRole( 'link', { name: /^Read\b/ } ) );

		expect( onNavigate ).toHaveBeenCalledWith( '/resources/ai-mcp/tools' );
	} );
} );
