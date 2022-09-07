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

	// describe( 'when the task depends on the completion of other tasks', () => {
	// 	describe( 'and the other tasks are not completed', () => {
	// 		it( 'disables the task', () => {
	// 			const { getByText } = render(
	// 				<ChecklistItem task={ getTask( { displayBadge: true } ) } />
	// 			);
	// 		} );
	// 	} );
	// 	describe( 'and the other tasks are completed', () => {
	// 		it( 'enables the task', () => {
	// 			const { getByText } = render(
	// 				<ChecklistItem task={ getTask( { displayBadge: true } ) } />
	// 			);
	// 		} );
	// 	} );
	// } );
	// describe( 'when the task is complete', () => {
	// 	it( 'disables the task', () => {
	// 		render( <ChecklistItem task={ getTask( { isCompleted: true } ) } /> );
	// 		screen.debug();
	// 		const checkmark = screen.queryByRole( 'svg' );
	// 		console.log( { checkmark } );
	// 		// expect( actual ).toBeFalsy();
	// 	} );
	// } );
} );
