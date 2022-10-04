/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import Checklist from '../checklist';
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

describe( 'Checklist', () => {
	describe( 'when provided no tasks', () => {
		it( 'then no tasks are rendered', () => {
			render( <Checklist tasks={ [] } /> );
			const checklistItems = screen.queryByRole( 'listitem' );
			expect( checklistItems ).not.toBeInTheDocument();
		} );
	} );

	describe( 'when a number of tasks are provided', () => {
		it( 'then the same number of tasks are rendered', () => {
			render( <Checklist tasks={ [ getTask( { id: 'task1' } ), getTask( { id: 'task2' } ) ] } /> );
			const checklistItems = screen.getAllByRole( 'listitem' );
			expect( checklistItems.length ).toBe( 2 );
		} );
	} );
} );
