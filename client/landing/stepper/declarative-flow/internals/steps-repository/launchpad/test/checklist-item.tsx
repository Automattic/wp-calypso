/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import ChecklistItem from '../checklist-item';
import { Task } from '../types';

function getTask( taskData = {} ) {
	const task: Task = {
		id: 'foo_task',
		isCompleted: false,
		actionUrl: '#',
		taskType: 'blog',
		displayBadge: false,
		title: 'Foo Task',
	};

	return { ...task, ...taskData };
}

describe( 'ChecklistItem', () => {
	describe( 'when the task requires a badge', () => {
		it( 'displays a badge', () => {
			const badgeText = 'Badge Text';
			render( <ChecklistItem task={ getTask( { displayBadge: true, badgeText } ) } /> );
			expect( screen.getByText( badgeText ) ).toBeTruthy();
		} );
	} );

	describe( 'when the task is complete', () => {
		it( 'shows the task complete icon', () => {
			render( <ChecklistItem task={ getTask( { isCompleted: true } ) } /> );
			const taskCompleteIcon = screen.queryByLabelText( 'Task complete' );
			expect( taskCompleteIcon ).toBeTruthy();
		} );
		it( 'hides the task enabled icon', () => {
			render( <ChecklistItem task={ getTask( { isCompleted: true } ) } /> );
			const taskEnabledIcon = screen.queryByLabelText( 'Task enabled' );
			expect( taskEnabledIcon ).toBeFalsy();
		} );
		it( 'disables the task', () => {
			render( <ChecklistItem task={ getTask( { isCompleted: true } ) } /> );
			const taskButton = screen.queryByRole( 'link' );
			expect( taskButton ).toHaveAttribute( 'disabled' );
		} );

		describe( 'and the task is kept active', () => {
			it( 'hides the task enabled icon', () => {
				render( <ChecklistItem task={ getTask( { isCompleted: true, keepActive: true } ) } /> );
				const taskEnabledIcon = screen.queryByLabelText( 'Task enabled' );
				expect( taskEnabledIcon ).toBeFalsy();
			} );
			it( 'enables the task', () => {
				render( <ChecklistItem task={ getTask( { isCompleted: true, keepActive: true } ) } /> );
				const taskButton = screen.queryByRole( 'link' );
				expect( taskButton ).not.toHaveAttribute( 'disabled' );
			} );
		} );
	} );

	describe( 'when a task is incomplete', () => {
		it( 'hides the task complete icon', () => {
			render( <ChecklistItem task={ getTask( { isCompleted: false } ) } /> );
			const taskCompleteIcon = screen.queryByLabelText( 'Task complete' );
			expect( taskCompleteIcon ).toBeFalsy();
		} );

		describe( 'and the task depends on the completion of other tasks', () => {
			it( 'hides the task enabled icon', () => {
				const otherTaskCompleted = false;
				render(
					<ChecklistItem
						task={ getTask( { isCompleted: false, dependencies: [ otherTaskCompleted ] } ) }
					/>
				);
				const taskEnabledIcon = screen.queryByLabelText( 'Task enabled' );
				expect( taskEnabledIcon ).toBeFalsy();
			} );
			it( 'disables the task', () => {
				const otherTaskCompleted = false;
				render(
					<ChecklistItem
						task={ getTask( { isCompleted: false, dependencies: [ otherTaskCompleted ] } ) }
					/>
				);
				const taskButton = screen.queryByRole( 'link' );
				expect( taskButton ).toHaveAttribute( 'disabled' );
			} );
		} );

		describe( 'and the task does not depend on the completion of other tasks', () => {
			it( 'shows the task enabled icon', () => {
				render( <ChecklistItem task={ getTask( { isCompleted: false } ) } /> );
				const taskEnabledIcon = screen.queryByLabelText( 'Task enabled' );
				expect( taskEnabledIcon ).toBeTruthy();
			} );
			it( 'enables the task', () => {
				render( <ChecklistItem task={ getTask( { isCompleted: false } ) } /> );
				const taskButton = screen.queryByRole( 'link' );
				expect( taskButton ).not.toHaveAttribute( 'disabled' );
			} );
		} );
	} );
} );
