/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../test-utils';
import McpTools from '../tools-content';
import type { McpAvailableAbility, McpSettings } from '@automattic/api-core';

function ability(
	name: string,
	category: string,
	enabled: boolean,
	title: string,
	isReadonly = true
): McpAvailableAbility {
	return {
		name,
		title,
		description: `${ title } description`,
		category,
		enabled,
		readonly: isReadonly,
	};
}

const SETTINGS: McpSettings = {
	enabled: true,
	available_categories: [
		{ slug: 'agencies-sites', label: 'Sites' },
		{ slug: 'agencies-billing', label: 'Billing & Invoices' },
		{ slug: 'agencies-feedback', label: 'Feedback' },
	],
	available_abilities: [
		ability( 'agencies-mcp/get-site-details', 'agencies-sites', true, 'Site Details' ),
		ability( 'agencies-mcp/fetch-managed-sites', 'agencies-sites', false, 'List Managed Sites' ),
		ability( 'agencies-mcp/list-invoices', 'agencies-billing', true, 'List Invoices' ),
		ability( 'agencies-mcp/submit-feedback', 'agencies-feedback', true, 'Submit Feedback', false ),
	],
};

describe( '<McpTools toolType="read">', () => {
	test( 'groups tools by category and hides them until the group is expanded', async () => {
		render( <McpTools toolType="read" settings={ SETTINGS } onSave={ jest.fn() } /> );

		expect( screen.getByRole( 'heading', { name: 'Sites' } ) ).toBeVisible();
		expect( screen.getByRole( 'heading', { name: 'Billing & Invoices' } ) ).toBeVisible();
		expect( screen.queryByRole( 'checkbox', { name: 'Site Details' } ) ).not.toBeInTheDocument();

		await userEvent.click( screen.getByRole( 'button', { name: 'Show Sites tools' } ) );

		expect( screen.getByRole( 'checkbox', { name: 'Site Details' } ) ).toBeVisible();
		expect( screen.getByRole( 'checkbox', { name: 'List Managed Sites' } ) ).toBeVisible();
		// The Billing group is still collapsed.
		expect( screen.queryByRole( 'checkbox', { name: 'List Invoices' } ) ).not.toBeInTheDocument();
	} );

	test( 'leaves out the write tools', () => {
		render( <McpTools toolType="read" settings={ SETTINGS } onSave={ jest.fn() } /> );

		expect( screen.queryByRole( 'heading', { name: 'Feedback' } ) ).not.toBeInTheDocument();
	} );

	test( 'keeps abilities with no readonly flag under Read', () => {
		render(
			<McpTools
				toolType="read"
				settings={ {
					...SETTINGS,
					available_categories: [ { slug: 'agencies-sites', label: 'Sites' } ],
					available_abilities: [
						{
							name: 'agencies-mcp/get-site-details',
							title: 'Site Details',
							description: '',
							category: 'agencies-sites',
							enabled: true,
						},
					],
				} }
				onSave={ jest.fn() }
			/>
		);

		expect( screen.getByRole( 'heading', { name: 'Sites' } ) ).toBeVisible();
	} );

	test( 'describes each group from the local description map', () => {
		render( <McpTools toolType="read" settings={ SETTINGS } onSave={ jest.fn() } /> );

		expect(
			screen.getByText( 'Browse the sites your agency manages and their full records.' )
		).toBeVisible();
		expect(
			screen.getByText( 'Charges, invoices, and upcoming subscription renewals.' )
		).toBeVisible();
	} );

	test( 'renders a group with no known description as label-only', () => {
		render(
			<McpTools
				toolType="read"
				settings={ {
					...SETTINGS,
					available_categories: [ { slug: 'brand-new', label: 'Brand new' } ],
					available_abilities: [ ability( 'do-a-thing', 'brand-new', true, 'Do a thing' ) ],
				} }
				onSave={ jest.fn() }
			/>
		);

		expect( screen.getByRole( 'heading', { name: 'Brand new' } ) ).toBeVisible();
	} );

	test( 'collapses an expanded group again', async () => {
		render( <McpTools toolType="read" settings={ SETTINGS } onSave={ jest.fn() } /> );

		await userEvent.click( screen.getByRole( 'button', { name: 'Show Sites tools' } ) );
		await userEvent.click( screen.getByRole( 'button', { name: 'Hide Sites tools' } ) );

		expect( screen.queryByRole( 'checkbox', { name: 'Site Details' } ) ).not.toBeInTheDocument();
	} );

	test( 'toggling a single tool saves just that ability', async () => {
		const onSave = jest.fn();
		render( <McpTools toolType="read" settings={ SETTINGS } onSave={ onSave } /> );

		await userEvent.click( screen.getByRole( 'button', { name: 'Show Sites tools' } ) );
		await userEvent.click( screen.getByRole( 'checkbox', { name: 'List Managed Sites' } ) );

		expect( onSave ).toHaveBeenCalledWith( {
			abilities: { 'agencies-mcp/fetch-managed-sites': true },
		} );
	} );

	test( 'the group toggle saves every ability in that group', async () => {
		const onSave = jest.fn();
		render( <McpTools toolType="read" settings={ SETTINGS } onSave={ onSave } /> );

		await userEvent.click( screen.getByRole( 'checkbox', { name: 'Enable all Sites tools' } ) );

		expect( onSave ).toHaveBeenCalledWith( {
			abilities: {
				'agencies-mcp/get-site-details': true,
				'agencies-mcp/fetch-managed-sites': true,
			},
		} );
	} );

	test( 'the page toggle saves every read ability but no write ones', async () => {
		const onSave = jest.fn();
		render( <McpTools toolType="read" settings={ SETTINGS } onSave={ onSave } /> );

		await userEvent.click( screen.getByRole( 'checkbox', { name: 'Enable all' } ) );

		expect( onSave ).toHaveBeenCalledWith( {
			abilities: {
				'agencies-mcp/get-site-details': true,
				'agencies-mcp/fetch-managed-sites': true,
				'agencies-mcp/list-invoices': true,
			},
		} );
	} );

	test( 'the page toggle is on only when every ability is enabled', () => {
		const { rerender } = render(
			<McpTools toolType="read" settings={ SETTINGS } onSave={ jest.fn() } />
		);
		expect( screen.getByRole( 'checkbox', { name: 'Enable all' } ) ).not.toBeChecked();

		rerender(
			<McpTools
				toolType="read"
				settings={ {
					...SETTINGS,
					available_abilities: SETTINGS.available_abilities.map( ( a ) => ( {
						...a,
						enabled: true,
					} ) ),
				} }
				onSave={ jest.fn() }
			/>
		);
		expect( screen.getByRole( 'checkbox', { name: 'Enable all' } ) ).toBeChecked();
	} );

	test( 'disables the toggles while saving', () => {
		render( <McpTools toolType="read" settings={ SETTINGS } isSaving onSave={ jest.fn() } /> );

		expect( screen.getByRole( 'checkbox', { name: 'Enable all' } ) ).toBeDisabled();
		expect( screen.getByRole( 'checkbox', { name: 'Enable all Sites tools' } ) ).toBeDisabled();
	} );

	test( 'shows an empty state when no tools are available', () => {
		render(
			<McpTools
				toolType="read"
				settings={ { ...SETTINGS, available_abilities: [] } }
				onSave={ jest.fn() }
			/>
		);

		expect( screen.getByText( 'No read tools are available for your account.' ) ).toBeVisible();
	} );

	test( 'tags its tracks events as read', async () => {
		const recordTracksEvent = jest.fn();
		render(
			<McpTools
				toolType="read"
				settings={ SETTINGS }
				onSave={ jest.fn() }
				recordTracksEvent={ recordTracksEvent }
			/>
		);

		await userEvent.click( screen.getByRole( 'checkbox', { name: 'Enable all Sites tools' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_ai_mcp_category_toggled',
			expect.objectContaining( { tool_type: 'read' } )
		);
	} );
} );

describe( '<McpTools toolType="write">', () => {
	test( 'shows only the abilities the API flags as not read-only', async () => {
		render( <McpTools toolType="write" settings={ SETTINGS } onSave={ jest.fn() } /> );

		expect( screen.getByRole( 'heading', { name: 'Feedback' } ) ).toBeVisible();
		expect( screen.queryByRole( 'heading', { name: 'Sites' } ) ).not.toBeInTheDocument();
		expect(
			screen.queryByRole( 'heading', { name: 'Billing & Invoices' } )
		).not.toBeInTheDocument();

		await userEvent.click( screen.getByRole( 'button', { name: 'Show Feedback tools' } ) );

		expect( screen.getByRole( 'checkbox', { name: 'Submit Feedback' } ) ).toBeVisible();
	} );

	test( 'the page toggle saves only the write abilities', async () => {
		const onSave = jest.fn();
		render( <McpTools toolType="write" settings={ SETTINGS } onSave={ onSave } /> );

		await userEvent.click( screen.getByRole( 'checkbox', { name: 'Enable all' } ) );

		expect( onSave ).toHaveBeenCalledWith( {
			abilities: { 'agencies-mcp/submit-feedback': false },
		} );
	} );

	test( 'shows an empty state when the account has no write tools', () => {
		render(
			<McpTools
				toolType="write"
				settings={ {
					...SETTINGS,
					available_abilities: SETTINGS.available_abilities.filter( ( a ) => a.readonly !== false ),
				} }
				onSave={ jest.fn() }
			/>
		);

		expect( screen.getByText( 'No write tools are available for your account.' ) ).toBeVisible();
	} );

	test( 'tags its tracks events as write', async () => {
		const recordTracksEvent = jest.fn();
		render(
			<McpTools
				toolType="write"
				settings={ SETTINGS }
				onSave={ jest.fn() }
				recordTracksEvent={ recordTracksEvent }
			/>
		);

		await userEvent.click( screen.getByRole( 'checkbox', { name: 'Enable all Feedback tools' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_ai_mcp_category_toggled',
			expect.objectContaining( { tool_type: 'write' } )
		);
	} );
} );
