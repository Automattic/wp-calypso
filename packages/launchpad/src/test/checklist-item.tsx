import { render, screen } from '@testing-library/react';
import React from 'react';
import ChecklistItem from '../checklist-item';
import { buildTask } from './lib/fixtures';
import '@testing-library/jest-dom';

describe( 'ChecklistItem', () => {
	describe( 'when the task requires a badge', () => {
		it( 'displays a badge', () => {
			const badge_text = 'Badge Text';
			render( <ChecklistItem task={ buildTask( { badge_text } ) } /> );
			expect( screen.getByText( badge_text ) ).toBeTruthy();
		} );
	} );

	describe( 'when the task is completed', () => {
		it( 'shows the task completed icon', () => {
			render( <ChecklistItem task={ buildTask( { completed: true } ) } /> );
			const taskCompleteIcon = screen.queryByLabelText( 'Task complete' );
			expect( taskCompleteIcon ).toBeTruthy();
		} );
		it( 'hides the task enabled icon', () => {
			render( <ChecklistItem task={ buildTask( { completed: true } ) } /> );
			const taskEnabledIcon = screen.queryByLabelText( 'Task enabled' );
			expect( taskEnabledIcon ).toBeFalsy();
		} );
		it( 'disables the task', () => {
			render( <ChecklistItem task={ buildTask( { completed: true } ) } /> );
			const taskButton = screen.queryByRole( 'button' );
			expect( taskButton ).toHaveAttribute( 'disabled' );
		} );

		describe( 'and the task is kept enabled', () => {
			it( 'hides the task enabled icon', () => {
				render( <ChecklistItem task={ buildTask( { completed: true, disabled: false } ) } /> );
				const taskEnabledIcon = screen.queryByLabelText( 'Task enabled' );
				expect( taskEnabledIcon ).toBeFalsy();
			} );
			it( 'enables the task', () => {
				render( <ChecklistItem task={ buildTask( { completed: true, disabled: false } ) } /> );
				const taskButton = screen.queryByRole( 'button' );
				expect( taskButton ).not.toHaveAttribute( 'disabled' );
			} );
		} );
	} );

	describe( 'when a task is incomplete', () => {
		it( 'hides the task complete icon', () => {
			render( <ChecklistItem task={ buildTask( { completed: false } ) } /> );
			const taskCompleteIcon = screen.queryByLabelText( 'Task complete' );
			expect( taskCompleteIcon ).toBeFalsy();
		} );
	} );

	describe( 'and the task depends on the completion of other tasks', () => {
		it( 'hides the task enabled icon', () => {
			const otherTaskCompleted = false;
			render(
				<ChecklistItem task={ buildTask( { completed: false, disabled: ! otherTaskCompleted } ) } />
			);
			const taskEnabledIcon = screen.queryByLabelText( 'Task enabled' );
			expect( taskEnabledIcon ).toBeFalsy();
		} );
		it( 'disables the task', () => {
			const otherTaskCompleted = false;
			render(
				<ChecklistItem task={ buildTask( { completed: false, disabled: ! otherTaskCompleted } ) } />
			);
			const taskButton = screen.queryByRole( 'button' );
			expect( taskButton ).toHaveAttribute( 'disabled' );
		} );
	} );

	describe( 'and the task does not depend on the completion of other tasks', () => {
		it( 'shows the task enabled icon', () => {
			render( <ChecklistItem task={ buildTask( { completed: false, disabled: false } ) } /> );
			const taskEnabledIcon = screen.queryByLabelText( 'Task enabled' );
			expect( taskEnabledIcon ).toBeTruthy();
		} );
		it( 'enables the task', () => {
			render( <ChecklistItem task={ buildTask( { completed: false, disabled: false } ) } /> );
			const taskButton = screen.queryByRole( 'button' );
			expect( taskButton ).not.toHaveAttribute( 'disabled' );
		} );
	} );

	describe( 'when a task is a primary action', () => {
		it( 'displays a primary button', () => {
			render(
				<ChecklistItem task={ buildTask( { completed: false } ) } isPrimaryAction={ true } />
			);
			const taskButton = screen.queryByRole( 'button' );
			expect( taskButton?.className ).toContain( 'checklist-item__checklist-primary-button' );
		} );
	} );
} );
