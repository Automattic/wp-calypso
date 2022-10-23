/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import ChecklistItem from '../checklist-item';
import { buildTask } from './lib/fixtures';

describe( 'ChecklistItem', () => {
	describe( 'when the task requires a badge', () => {
		it( 'displays a badge', () => {
			const badgeText = 'Badge Text';
			render( <ChecklistItem task={ buildTask( { displayBadge: true, badgeText } ) } /> );
			expect( screen.getByText( badgeText ) ).toBeTruthy();
		} );
	} );

	describe( 'when the task is complete', () => {
		it( 'shows the task complete icon', () => {
			render( <ChecklistItem task={ buildTask( { isCompleted: true } ) } /> );
			const taskCompleteIcon = screen.queryByLabelText( 'Task complete' );
			expect( taskCompleteIcon ).toBeTruthy();
		} );
		it( 'hides the task enabled icon', () => {
			render( <ChecklistItem task={ buildTask( { isCompleted: true } ) } /> );
			const taskEnabledIcon = screen.queryByLabelText( 'Task enabled' );
			expect( taskEnabledIcon ).toBeFalsy();
		} );
		it( 'disables the task', () => {
			render( <ChecklistItem task={ buildTask( { isCompleted: true } ) } /> );
			const taskButton = screen.queryByRole( 'button' );
			expect( taskButton ).toHaveAttribute( 'disabled' );
		} );

		describe( 'and the task is kept active', () => {
			it( 'hides the task enabled icon', () => {
				render( <ChecklistItem task={ buildTask( { isCompleted: true, keepActive: true } ) } /> );
				const taskEnabledIcon = screen.queryByLabelText( 'Task enabled' );
				expect( taskEnabledIcon ).toBeFalsy();
			} );
			it( 'enables the task', () => {
				render( <ChecklistItem task={ buildTask( { isCompleted: true, keepActive: true } ) } /> );
				const taskButton = screen.queryByRole( 'button' );
				expect( taskButton ).not.toHaveAttribute( 'disabled' );
			} );
		} );
	} );

	describe( 'when a task is incomplete', () => {
		it( 'hides the task complete icon', () => {
			render( <ChecklistItem task={ buildTask( { isCompleted: false } ) } /> );
			const taskCompleteIcon = screen.queryByLabelText( 'Task complete' );
			expect( taskCompleteIcon ).toBeFalsy();
		} );

		describe( 'and the task depends on the completion of other tasks', () => {
			it( 'hides the task enabled icon', () => {
				const otherTaskCompleted = false;
				render(
					<ChecklistItem
						task={ buildTask( { isCompleted: false, dependencies: [ otherTaskCompleted ] } ) }
					/>
				);
				const taskEnabledIcon = screen.queryByLabelText( 'Task enabled' );
				expect( taskEnabledIcon ).toBeFalsy();
			} );
			it( 'disables the task', () => {
				const otherTaskCompleted = false;
				render(
					<ChecklistItem
						task={ buildTask( { isCompleted: false, dependencies: [ otherTaskCompleted ] } ) }
					/>
				);
				const taskButton = screen.queryByRole( 'button' );
				expect( taskButton ).toHaveAttribute( 'disabled' );
			} );
		} );

		describe( 'and the task does not depend on the completion of other tasks', () => {
			it( 'shows the task enabled icon', () => {
				render( <ChecklistItem task={ buildTask( { isCompleted: false } ) } /> );
				const taskEnabledIcon = screen.queryByLabelText( 'Task enabled' );
				expect( taskEnabledIcon ).toBeTruthy();
			} );
			it( 'enables the task', () => {
				render( <ChecklistItem task={ buildTask( { isCompleted: false } ) } /> );
				const taskButton = screen.queryByRole( 'button' );
				expect( taskButton ).not.toHaveAttribute( 'disabled' );
			} );
		} );
	} );

	describe( 'when a task is a primary action', () => {
		it( 'displays a primary button', () => {
			render(
				<ChecklistItem task={ buildTask( { isCompleted: false } ) } isPrimaryAction={ true } />
			);
			const taskButton = screen.queryByRole( 'button' );
			expect( taskButton?.className ).toContain( 'launchpad__checklist-primary-button' );
		} );
	} );
} );
