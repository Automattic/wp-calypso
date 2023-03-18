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
				expect(
					// eslint-disable-next-line @typescript-eslint/no-empty-function
					getEnhancedTasks( fakeTasks, 'fake.wordpress.com', null, () => {}, false )
				).toEqual( fakeTasks );
			} );
		} );
		describe( 'when it is link_in_bio_launched task', () => {
			it( 'then it receives launchtask property = true', () => {
				const fakeTasks = [ buildTask( { id: 'link_in_bio_launched' } ) ];
				const enhancedTasks = getEnhancedTasks(
					fakeTasks,
					'fake.wordpress.com',
					null,
					// eslint-disable-next-line @typescript-eslint/no-empty-function
					() => {},
					false
				);
				expect( enhancedTasks[ 0 ].isLaunchTask ).toEqual( true );
			} );
		} );
		describe( 'when it is plan_selected task', () => {
			it( 'marks plan_selected as incomplete if styles used but not part of plan', () => {
				const fakeTasks = [ buildTask( { id: 'plan_selected', completed: true } ) ];
				const enhancedTasks = getEnhancedTasks(
					fakeTasks,
					'fake.wordpress.com',
					null,
					// eslint-disable-next-line @typescript-eslint/no-empty-function
					() => {},
					true
				);
				expect( enhancedTasks[ 0 ].completed ).toEqual( false );
				expect( enhancedTasks[ 0 ].warning ).toEqual( true );
			} );
			it( 'leaves plan_selected if styles warning is unnecessary', () => {
				const fakeTasks = [ buildTask( { id: 'plan_selected', completed: true } ) ];
				const enhancedTasks = getEnhancedTasks(
					fakeTasks,
					'fake.wordpress.com',
					null,
					// eslint-disable-next-line @typescript-eslint/no-empty-function
					() => {},
					false
				);
				expect( enhancedTasks[ 0 ].completed ).toEqual( true );
			} );
		} );
	} );

	describe( 'getArrayOfFilteredTasks', () => {
		describe( 'when the user has not verified their email address', () => {
			const isEmailVerified = false;

			describe( 'and no flow is provided', () => {
				it( 'then no tasks are found', () => {
					expect( getArrayOfFilteredTasks( tasks, null, isEmailVerified ) ).toBe( null );
				} );
			} );

			describe( 'and a non-existing flow is provided', () => {
				it( 'then no tasks are found', () => {
					expect( getArrayOfFilteredTasks( tasks, 'custom-flow', isEmailVerified ) ).toBe(
						undefined
					);
				} );
			} );

			describe( 'and an existing flow is provided', () => {
				it( 'then it returns found tasks', () => {
					expect(
						getArrayOfFilteredTasks( tasks, 'newsletter', isEmailVerified )?.sort( ( a, b ) =>
							a.id < b.id ? -1 : 1
						)
					).toEqual(
						tasks
							.sort( ( a, b ) => ( a.id < b.id ? -1 : 1 ) )
							.filter( ( task ) => launchpadFlowTasks[ 'newsletter' ].includes( task.id ) )
					);
				} );
			} );
		} );

		describe( 'when the user has verified their email address', () => {
			const isEmailVerified = true;

			describe( 'and an existing flow is provided', () => {
				it( 'then it returns tasks without an email verified task', () => {
					expect(
						getArrayOfFilteredTasks( tasks, 'newsletter', isEmailVerified )?.sort( ( a, b ) =>
							a.id < b.id ? -1 : 1
						)
					).toEqual(
						tasks
							.sort( ( a, b ) => ( a.id < b.id ? -1 : 1 ) )
							.filter( ( task ) => {
								if ( task.id === 'verify_email' ) {
									return false;
								}

								return launchpadFlowTasks[ 'newsletter' ].includes( task.id );
							} )
					);
				} );
			} );
		} );
	} );

	describe( 'domain upsell task', () => {
		describe( 'when flow is newsletter', () => {
			it( 'does not include upsell task', () => {
				expect(
					launchpadFlowTasks[ 'newsletter' ].filter( ( task ) => task === 'domain_upsell' ).length
				).toBe( 0 );
			} );
		} );
		describe( 'when flow is link-in-bio', () => {
			it( 'does not include upsell task', () => {
				expect(
					launchpadFlowTasks[ 'link-in-bio' ].filter( ( task ) => task === 'domain_upsell' ).length
				).toBe( 0 );
			} );
		} );
		describe( 'when flow is write', () => {
			it( 'does include upsell task', () => {
				expect(
					launchpadFlowTasks[ 'write' ].filter( ( task ) => task === 'domain_upsell' ).length
				).toBe( 1 );
			} );
		} );
		describe( 'when flow is build', () => {
			it( 'does include upsell task', () => {
				expect(
					launchpadFlowTasks[ 'build' ].filter( ( task ) => task === 'domain_upsell' ).length
				).toBe( 1 );
			} );
		} );
		describe( 'when flow is free', () => {
			it( 'does include upsell task', () => {
				expect(
					launchpadFlowTasks[ 'free' ].filter( ( task ) => task === 'domain_upsell' ).length
				).toBe( 1 );
			} );
		} );
	} );
} );
