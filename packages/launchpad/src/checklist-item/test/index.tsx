import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { ComponentProps } from 'react';
import ChecklistItem from '..';
import { buildTask } from '../../test/lib/fixtures';
import '@testing-library/jest-dom';

describe( 'ChecklistItem', () => {
	const defaultProps = {
		task: buildTask( {
			completed: false,
			disabled: false,
			actionDispatch: jest.fn(),
		} ),
	};

	const renderComponent = ( props: Partial< ComponentProps< typeof ChecklistItem > > ) =>
		render( <ChecklistItem { ...defaultProps } { ...props } /> );

	it( 'displays a badge', () => {
		const badge_text = 'Badge Text';
		renderComponent( { task: buildTask( { badge_text } ) } );

		expect( screen.getByText( badge_text ) ).toBeVisible();
	} );

	it( 'hides the task complete icon when the task is not completed', () => {
		renderComponent( { task: buildTask( { completed: false } ) } );
		const taskCompleteIcon = screen.queryByLabelText( 'Task complete' );

		expect( taskCompleteIcon ).not.toBeInTheDocument();
	} );

	it( 'renders a button when it has the onClick event', () => {
		const onClick = jest.fn();
		renderComponent( { onClick } );

		const taskButton = screen.getByRole( 'button' );

		expect( taskButton ).toBeInTheDocument();
	} );

	it( 'calls onClick when the task is clicked', async () => {
		const onClick = jest.fn();
		renderComponent( { onClick } );

		const taskButton = screen.getByRole( 'button' );
		await userEvent.click( taskButton );

		expect( onClick ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'uses the task action dispatch when the task is clicked and no custom onClick prop is used', async () => {
		const actionDispatch = jest.fn();
		renderComponent( {
			task: buildTask( { actionDispatch, completed: false, disabled: false } ),
		} );

		const taskButton = screen.getByRole( 'button' );
		await userEvent.click( taskButton );

		expect( actionDispatch ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'calls the onclick when calypso path is available', async () => {
		const onClick = jest.fn();
		renderComponent( {
			onClick,
			isPrimaryAction: true,
			task: buildTask( {
				useCalypsoPath: true,
				disabled: false,
				calypso_path: 'https://wordpress.com',
			} ),
		} );

		const taskButton = screen.getByRole( 'link' );
		await userEvent.click( taskButton );

		expect( onClick ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'calls the task action dispatch when calypso path is available', async () => {
		const actionDispatch = jest.fn();
		renderComponent( {
			isPrimaryAction: true,
			task: buildTask( {
				useCalypsoPath: true,
				disabled: false,
				calypso_path: 'https://wordpress.com',
				actionDispatch,
			} ),
		} );

		const taskButton = screen.getByRole( 'link' );
		await userEvent.click( taskButton );

		expect( actionDispatch ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'renders a span when it does not have the click or a link', () => {
		const title = 'Task';
		const { container } = renderComponent( { task: buildTask( { title } ) } );

		const taskButton = container.querySelector( '.components-button' )!;

		expect( taskButton.tagName ).toEqual( 'DIV' );
	} );

	describe( 'when the task is disabled', () => {
		it( 'disables the button', () => {
			renderComponent( { task: buildTask( { disabled: true } ), onClick: () => {} } );
			const taskButton = screen.queryByRole( 'button' );

			expect( taskButton ).toBeDisabled();
		} );

		it( 'hides the task enabled icon', () => {
			renderComponent( { task: buildTask( { disabled: true } ) } );
			const taskEnabledIcon = screen.queryByLabelText( 'Task enabled' );

			expect( taskEnabledIcon ).not.toBeInTheDocument();
		} );
	} );

	describe( 'when the task is completed', () => {
		it( 'shows the task completed icon', () => {
			renderComponent( { task: buildTask( { completed: true } ) } );
			const taskCompleteIcon = screen.queryByLabelText( 'Task complete' );

			expect( taskCompleteIcon ).toBeVisible();
		} );

		it( 'hides the task enabled icon', () => {
			renderComponent( { task: buildTask( { completed: true } ) } );
			const taskEnabledIcon = screen.queryByLabelText( 'Task enabled' );
			expect( taskEnabledIcon ).not.toBeInTheDocument();
		} );

		it( 'disables the task', () => {
			renderComponent( { task: buildTask( { completed: true } ), onClick: () => {} } );
			const taskButton = screen.queryByRole( 'button' );

			expect( taskButton ).toBeDisabled();
		} );

		describe( 'and the task is kept enabled', () => {
			it( 'hides the task enabled icon', () => {
				renderComponent( { task: buildTask( { completed: true, disabled: false } ) } );
				const taskEnabledIcon = screen.queryByLabelText( 'Task enabled' );

				expect( taskEnabledIcon ).not.toBeInTheDocument();
			} );

			it( 'enables the task', () => {
				renderComponent( {
					task: buildTask( { completed: true, disabled: false } ),
					onClick: () => {},
				} );
				const taskButton = screen.queryByRole( 'button' );

				expect( taskButton ).toBeEnabled();
			} );
		} );
	} );

	describe( 'when a task is a primary action', () => {
		it( 'displays a primary button', () => {
			renderComponent( { isPrimaryAction: true } );
			const taskButton = screen.queryByRole( 'button' );

			expect( taskButton?.className ).toContain( 'checklist-item__checklist-primary-button' );
		} );
	} );

	describe( 'when it has expandable content', () => {
		describe( 'and when it is open', () => {
			it( 'displays the content', () => {
				renderComponent( { expandable: { isOpen: true, content: <div>Expanded</div> } } );

				expect( screen.getByText( 'Expanded' ) ).toBeVisible();
			} );

			it( 'has the expanded class', () => {
				const { container } = renderComponent( {
					expandable: { isOpen: true, content: <div>Expanded</div> },
				} );

				expect(
					container.querySelector( '.checklist-item__task' )?.classList.contains( 'expanded' )
				).toBeTruthy();
			} );
		} );

		describe( 'and when it is not open', () => {
			it( 'does not display the content', () => {
				renderComponent( { expandable: { isOpen: false, content: <div>Expanded</div> } } );

				expect( screen.queryByText( 'Expanded' ) ).not.toBeInTheDocument();
			} );

			it( 'does not have the expanded class', () => {
				const { container } = renderComponent( {
					expandable: { isOpen: false, content: <div>Expanded</div> },
				} );

				expect(
					container.querySelector( '.checklist-item__task' )?.classList.contains( 'expanded' )
				).toBeFalsy();
			} );
		} );
	} );
} );
