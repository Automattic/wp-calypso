/**
 * @jest-environment jsdom
 */
import { getArrayOfFilteredTasks, getEnhancedTasks, isTaskDisabled } from '../task-helper';
import { tasks, launchpadFlowTasks } from '../tasks';
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
	describe( 'getEnhancedTasks', () => {
		describe( 'when a task should not be enhanced', () => {
			it( 'then it is not enhanced', () => {
				const fakeTasks = [
					getTask( { id: 'fake-task-1' } ),
					getTask( { id: 'fake-task-2' } ),
					getTask( { id: 'fake-task-3' } ),
				];
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				expect( getEnhancedTasks( fakeTasks, 'fake.wordpress.com', null, () => {} ) ).toEqual(
					fakeTasks
				);
			} );
		} );
	} );

	describe( 'getArrayOfFilteredTasks', () => {
		describe( 'when no flow is provided', () => {
			it( 'then no tasks are found', () => {
				expect( getArrayOfFilteredTasks( tasks, null ) ).toBe( null );
			} );
		} );

		describe( 'when a non-existing flow is provided', () => {
			it( 'then no tasks are found', () => {
				expect( getArrayOfFilteredTasks( tasks, 'custom-flow' ) ).toBe( undefined );
			} );
		} );

		describe( 'when an existing flow is provided', () => {
			it( 'then it returns found tasks', () => {
				expect( getArrayOfFilteredTasks( tasks, 'newsletter' ) ).toEqual(
					tasks.filter( ( task ) => launchpadFlowTasks[ 'newsletter' ].includes( task.id ) )
				);
			} );
		} );
	} );
	describe( 'isTaskDisabled', () => {
		describe( 'when a task is complete', () => {
			it( 'then the task is disabled', () => {
				const task = getTask( { isCompleted: true } );
				expect( isTaskDisabled( task ) ).toBe( true );
			} );
		} );
		describe( 'when a given task has other, dependent tasks that should be completed first', () => {
			describe( 'and the other tasks are incomplete', () => {
				it( 'then the given task is disabled', () => {
					const dependencies = [ true, false ];
					const task = getTask( { dependencies, isCompleted: false } );
					expect( isTaskDisabled( task ) ).toBe( true );
				} );
			} );
			describe( 'and the other tasks are complete', () => {
				it( 'then the given task is enabled', () => {
					const dependencies = [ true, true ];
					const task = getTask( { dependencies, isCompleted: false } );
					expect( isTaskDisabled( task ) ).toBe( false );
				} );
			} );
		} );
	} );
} );
