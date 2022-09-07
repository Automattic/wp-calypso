/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
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
			const { container } = render( <Checklist tasks={ [] } /> );
			const checklistItems = container.querySelectorAll( '.launchpad__checklist li' );
			expect( checklistItems.length ).toBe( 0 );
		} );
	} );

	describe( 'when a number of tasks are provided', () => {
		it( 'then the same number of tasks are rendered', () => {
			const { container } = render(
				<Checklist tasks={ [ getTask( { id: 'task1' } ), getTask( { id: 'task2' } ) ] } />
			);
			const checklistItems = container.querySelectorAll( '.launchpad__checklist li' );
			expect( checklistItems.length ).toBe( 2 );
		} );
	} );
} );
