/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { Icon } from '@wordpress/components';
import { cog } from '@wordpress/icons';
import * as React from 'react';
import ActionItem from '../index';

describe( 'ActionItem', () => {
	test( 'should render the action item element by default', () => {
		const action = {
			label: 'Action',
			callback: () => {},
		};

		render( <ActionItem title="Action title" action={ action } /> );

		expect( screen.getByText( 'Action title' ) ).toBeVisible();

		expect(
			screen.getByRole( 'button', {
				name: 'Action',
			} )
		).toBeVisible();
	} );

	test( 'should render the description if given', () => {
		const action = {
			label: 'Action',
			callback: () => {},
		};

		render(
			<ActionItem title="Action title" description="Action description" action={ action } />
		);

		expect( screen.getByText( 'Action description' ) ).toBeVisible();
	} );

	test( 'should render the decoration if given', () => {
		const action = {
			label: 'Action',
			callback: () => {},
		};

		const { container } = render(
			<ActionItem title="Action title" decoration={ <Icon icon={ cog } /> } action={ action } />
		);

		const decoration = container.querySelector( '.action-item-decoration' );
		expect( decoration ).toBeVisible();
	} );

	test( 'should render the destructive button if action.isBusy is true', () => {
		const action = {
			label: 'Busy Action',
			isBusy: true,
			callback: () => {},
		};

		render( <ActionItem title="Action title" action={ action } /> );

		expect( screen.getByRole( 'button', { name: 'Busy Action' } ) ).toHaveClass( 'is-busy' );
	} );

	test( 'should render the destructive button if action.disabled is true', () => {
		const action = {
			label: 'Disabled Action',
			disabled: true,
			callback: () => {},
		};

		render( <ActionItem title="Action title" action={ action } /> );

		expect( screen.getByRole( 'button', { name: 'Disabled Action' } ) ).toHaveAttribute(
			'aria-disabled'
		);
	} );

	test( 'should render the destructive button if action.isDestructive is true', () => {
		const action = {
			label: 'Destructive Action',
			isDestructive: true,
			callback: () => {},
		};

		render( <ActionItem title="Action title" action={ action } /> );

		expect( screen.getByRole( 'button', { name: 'Destructive Action' } ) ).toHaveClass(
			'is-destructive'
		);
	} );

	test( 'should trigger the callback if the button is clicked', async () => {
		const action = {
			label: 'Action',
			callback: jest.fn(),
		};

		render( <ActionItem title="Action title" action={ action } /> );

		const button = screen.getByRole( 'button', { name: 'Action' } );
		const user = userEvent.setup();
		await user.click( button );
		expect( action.callback ).toHaveBeenCalled();
	} );

	test( 'should display the modal if the action.RenderModal is given and the button is clicked', async () => {
		const action = {
			label: 'Action',
			RenderModal: () => <div>The Render Modal content</div>,
		};

		render( <ActionItem title="Action title" action={ action } /> );
		const button = screen.getByRole( 'button', { name: 'Action' } );
		const user = userEvent.setup();
		await user.click( button );
		expect( screen.getByText( 'The Render Modal content' ) ).toBeVisible();
	} );
} );
