/**
 * @jest-environment jsdom
 */
import { getArrayOfFilteredTasks, isTaskDisabled } from '../task-helper';
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

describe( 'Task Helpers', () => {
	// describe( 'getEnhancedTasks', () => {
	// 	describe( 'when a task is complete', () => {
	// 		it( 'the task is disabled', () => {
	// 			expect( isTaskDisabled( task ) ).toBe( true );
	// 		} );
	// 	} );
	// } );
	describe( 'getArrayOfFilteredTasks', () => {
		const tasks = [
			getTask( { id: 'foo_task' } ),
			getTask( { id: 'bar_task' } ),
			getTask( { id: 'baz_task' } ),
		];

		const flow = 'newsletter';

		// describe( '', () => {
		// 	it( 'the task is disabled', () => {
		// 		expect( getArrayOfFilteredTasks( tasks, flow ) ).toBe( true );
		// 	} );
		// } );
	} );
	describe( 'isTaskDisabled', () => {
		describe( 'when a task is complete', () => {
			it( 'the task is disabled', () => {
				const task = getTask( { isCompleted: true } );
				expect( isTaskDisabled( task ) ).toBe( true );
			} );
		} );
		describe( 'when a given task has other, dependent tasks that should be completed first', () => {
			describe( 'and the other tasks are incomplete', () => {
				it( 'the given task is disabled', () => {
					const dependencies = [ true, false ];
					const task = getTask( { dependencies, isCompleted: false } );
					expect( isTaskDisabled( task ) ).toBe( true );
				} );
			} );
			describe( 'and the other tasks are complete', () => {
				it( 'the given task is enabled', () => {
					const dependencies = [ true, true ];
					const task = getTask( { dependencies, isCompleted: false } );
					expect( isTaskDisabled( task ) ).toBe( false );
				} );
			} );
		} );
	} );
} );
