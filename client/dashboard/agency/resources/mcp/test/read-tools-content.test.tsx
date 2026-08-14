/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../test-utils';
import McpReadTools from '../read-tools-content';
import type { McpAvailableAbility, McpSettings } from '@automattic/api-core';

function ability(
	name: string,
	category: string,
	enabled: boolean,
	title: string
): McpAvailableAbility {
	return { name, title, description: `${ title } description`, category, enabled };
}

const SETTINGS: McpSettings = {
	enabled: true,
	available_categories: [
		{ slug: 'agencies-sites', label: 'Sites' },
		{ slug: 'agencies-billing', label: 'Billing & Invoices' },
	],
	available_abilities: [
		ability( 'agencies-mcp/get-site-details', 'agencies-sites', true, 'Site Details' ),
		ability( 'agencies-mcp/fetch-managed-sites', 'agencies-sites', false, 'List Managed Sites' ),
		ability( 'agencies-mcp/list-invoices', 'agencies-billing', true, 'List Invoices' ),
	],
};

describe( '<McpReadTools>', () => {
	test( 'groups tools by category and hides them until the group is expanded', async () => {
		render( <McpReadTools settings={ SETTINGS } onSave={ jest.fn() } /> );

		expect( screen.getByRole( 'heading', { name: 'Sites' } ) ).toBeVisible();
		expect( screen.getByRole( 'heading', { name: 'Billing & Invoices' } ) ).toBeVisible();
		expect( screen.queryByRole( 'checkbox', { name: 'Site Details' } ) ).not.toBeInTheDocument();

		await userEvent.click( screen.getByRole( 'button', { name: 'Show Sites tools' } ) );

		expect( screen.getByRole( 'checkbox', { name: 'Site Details' } ) ).toBeVisible();
		expect( screen.getByRole( 'checkbox', { name: 'List Managed Sites' } ) ).toBeVisible();
		// The Billing group is still collapsed.
		expect( screen.queryByRole( 'checkbox', { name: 'List Invoices' } ) ).not.toBeInTheDocument();
	} );

	test( 'describes each group from the local description map', () => {
		render( <McpReadTools settings={ SETTINGS } onSave={ jest.fn() } /> );

		expect(
			screen.getByText( 'Browse the sites your agency manages and their full records.' )
		).toBeVisible();
		expect(
			screen.getByText( 'Charges, invoices, and upcoming subscription renewals.' )
		).toBeVisible();
	} );

	test( 'renders a group with no known description as label-only', () => {
		render(
			<McpReadTools
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
		render( <McpReadTools settings={ SETTINGS } onSave={ jest.fn() } /> );

		await userEvent.click( screen.getByRole( 'button', { name: 'Show Sites tools' } ) );
		await userEvent.click( screen.getByRole( 'button', { name: 'Hide Sites tools' } ) );

		expect( screen.queryByRole( 'checkbox', { name: 'Site Details' } ) ).not.toBeInTheDocument();
	} );

	test( 'toggling a single tool saves just that ability', async () => {
		const onSave = jest.fn();
		render( <McpReadTools settings={ SETTINGS } onSave={ onSave } /> );

		await userEvent.click( screen.getByRole( 'button', { name: 'Show Sites tools' } ) );
		await userEvent.click( screen.getByRole( 'checkbox', { name: 'List Managed Sites' } ) );

		expect( onSave ).toHaveBeenCalledWith( {
			abilities: { 'agencies-mcp/fetch-managed-sites': true },
		} );
	} );

	test( 'the group toggle saves every ability in that group', async () => {
		const onSave = jest.fn();
		render( <McpReadTools settings={ SETTINGS } onSave={ onSave } /> );

		await userEvent.click( screen.getByRole( 'checkbox', { name: 'Enable all Sites tools' } ) );

		expect( onSave ).toHaveBeenCalledWith( {
			abilities: {
				'agencies-mcp/get-site-details': true,
				'agencies-mcp/fetch-managed-sites': true,
			},
		} );
	} );

	test( 'the page toggle saves every ability', async () => {
		const onSave = jest.fn();
		render( <McpReadTools settings={ SETTINGS } onSave={ onSave } /> );

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
		const { rerender } = render( <McpReadTools settings={ SETTINGS } onSave={ jest.fn() } /> );
		expect( screen.getByRole( 'checkbox', { name: 'Enable all' } ) ).not.toBeChecked();

		rerender(
			<McpReadTools
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
		render( <McpReadTools settings={ SETTINGS } isSaving onSave={ jest.fn() } /> );

		expect( screen.getByRole( 'checkbox', { name: 'Enable all' } ) ).toBeDisabled();
		expect( screen.getByRole( 'checkbox', { name: 'Enable all Sites tools' } ) ).toBeDisabled();
	} );

	test( 'shows an empty state when no tools are available', () => {
		render(
			<McpReadTools settings={ { ...SETTINGS, available_abilities: [] } } onSave={ jest.fn() } />
		);

		expect( screen.getByText( 'No tools available.' ) ).toBeVisible();
	} );
} );
