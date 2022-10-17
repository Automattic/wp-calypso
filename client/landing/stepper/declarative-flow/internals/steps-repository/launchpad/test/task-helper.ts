/**
 * @jest-environment jsdom
 */
import { getArrayOfFilteredTasks, getEnhancedTasks } from '../task-helper';
import { tasks, launchpadFlowTasks } from '../tasks';
import { buildTask } from './lib/fixtures';

describe( 'Task Helpers', () => {
	describe( 'getEnhancedTasks', () => {
		describe( 'when a task should not be enhanced', () => {
			it( 'then it is not enhanced', () => {
				const fakeTasks = [
					buildTask( { id: 'fake-task-1' } ),
					buildTask( { id: 'fake-task-2' } ),
					buildTask( { id: 'fake-task-3' } ),
				];
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				expect( getEnhancedTasks( fakeTasks, 'fake.wordpress.com', null, () => {} ) ).toEqual(
					fakeTasks
				);
			} );
		} );
		describe( 'when it is link_in_bio_launched task', () => {
			it( 'then it receives launchtask property = true', () => {
				const fakeTasks = [ buildTask( { id: 'link_in_bio_launched' } ) ];
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				const enhancedTasks = getEnhancedTasks( fakeTasks, 'fake.wordpress.com', null, () => {} );
				expect( enhancedTasks[ 0 ].isLaunchTask ).toEqual( true );
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
} );
