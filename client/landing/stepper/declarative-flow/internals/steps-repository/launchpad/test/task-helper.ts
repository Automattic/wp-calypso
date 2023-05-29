/**
 * @jest-environment jsdom
 */
import { getEnhancedTasks } from '../task-helper';
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
				expect(
					// eslint-disable-next-line @typescript-eslint/no-empty-function
					getEnhancedTasks( fakeTasks, 'fake.wordpress.com', null, () => {}, false )
				).toEqual( fakeTasks );
			} );
		} );
		describe( 'when creating the email verification task', () => {
			describe( 'and the user email has been verified', () => {
				it( 'marks the task as complete', () => {
					const fakeTasks = [ buildTask( { id: 'verify_email', completed: false } ) ];
					const isEmailVerified = true;
					const enhancedTasks = getEnhancedTasks(
						fakeTasks,
						'fake.wordpress.com',
						null,
						// eslint-disable-next-line @typescript-eslint/no-empty-function
						() => {},
						false,
						// eslint-disable-next-line @typescript-eslint/no-empty-function
						() => {},
						'newsletter',
						isEmailVerified
					);
					expect( enhancedTasks[ 0 ].completed ).toEqual( true );
				} );
			} );
		} );
		describe( 'when checking if the first post is published', () => {
			describe( 'and the flow is start-writing', () => {
				it( 'disable the click link so the user will not get distracted going back to the post', () => {
					const fakeTasks = [ buildTask( { id: 'first_post_published', completed: false } ) ];
					const enhancedTasks = getEnhancedTasks(
						fakeTasks,
						'fake.wordpress.com',
						null,
						// eslint-disable-next-line @typescript-eslint/no-empty-function
						() => {},
						false,
						// eslint-disable-next-line @typescript-eslint/no-empty-function
						() => {},
						'start-writing'
					);
					expect( enhancedTasks[ 0 ].disabled ).toEqual( true );
				} );
			} );
		} );
	} );
} );
