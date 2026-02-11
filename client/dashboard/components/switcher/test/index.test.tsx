/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import Switcher from '../index';

type Item = { id: number; name: string };

const mockItems: Item[] = [
	{ id: 1, name: 'Site One' },
	{ id: 2, name: 'Site Two' },
	{ id: 3, name: 'Site Three' },
];

const searchableFields = [
	{
		id: 'name',
		getValue: ( { item }: { item: Item } ) => item.name,
	},
];

const defaultProps = {
	items: mockItems,
	value: mockItems[ 0 ],
	searchableFields,
	getItemUrl: ( item: Item ) => `/site/${ item.id }`,
	renderItemMedia: () => <span data-testid="item-media">Icon</span>,
	renderItemTitle: ( { item }: { item: Item } ) => <span>{ item.name }</span>,
};

describe( 'Switcher', () => {
	describe( 'Click-outside overlay', () => {
		test( 'renders overlay when dropdown is open', async () => {
			const user = userEvent.setup();
			render( <Switcher { ...defaultProps } /> );

			// Overlay should not exist initially
			expect( screen.queryByTestId( 'switcher-overlay' ) ).not.toBeInTheDocument();

			// Open the dropdown
			const toggleButton = screen.getByRole( 'button' );
			await user.click( toggleButton );

			// Overlay should now be present
			await waitFor( () => {
				expect( screen.getByTestId( 'switcher-overlay' ) ).toBeInTheDocument();
			} );
		} );

		test( 'clicking overlay closes the dropdown', async () => {
			const onToggle = jest.fn();
			const user = userEvent.setup();
			render( <Switcher { ...defaultProps } defaultOpen onToggle={ onToggle } /> );

			// Find and click the overlay
			const overlay = await screen.findByTestId( 'switcher-overlay' );
			await user.click( overlay );

			// onToggle should be called with false to close
			expect( onToggle ).toHaveBeenCalledWith( false );
		} );

		test( 'clicking overlay does not propagate to elements beneath', async () => {
			const onOuterClick = jest.fn();
			const user = userEvent.setup();

			render(
				// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
				<div onClick={ onOuterClick } data-testid="outer-container">
					<Switcher { ...defaultProps } defaultOpen />
				</div>
			);

			// Click the overlay
			const overlay = await screen.findByTestId( 'switcher-overlay' );
			await user.click( overlay );

			// The outer container's click handler should not have been called
			expect( onOuterClick ).not.toHaveBeenCalled();
		} );

		test( 'overlay is removed when dropdown closes', async () => {
			const user = userEvent.setup();
			render( <Switcher { ...defaultProps } /> );

			// Open the dropdown
			const toggleButton = screen.getByRole( 'button' );
			await user.click( toggleButton );

			// Overlay should be present
			await waitFor( () => {
				expect( screen.getByTestId( 'switcher-overlay' ) ).toBeInTheDocument();
			} );

			// Close by clicking toggle again
			await user.click( toggleButton );

			// Overlay should be removed
			await waitFor( () => {
				expect( screen.queryByTestId( 'switcher-overlay' ) ).not.toBeInTheDocument();
			} );
		} );
	} );
} );
