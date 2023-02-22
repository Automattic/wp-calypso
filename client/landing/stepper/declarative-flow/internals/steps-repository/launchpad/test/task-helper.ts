/**
 * @jest-environment jsdom
 */
import { filterDomainUpsellTask, getArrayOfFilteredTasks, getEnhancedTasks } from '../task-helper';
import { tasks, launchpadFlowTasks } from '../tasks';
import { buildTask, buildSiteDetails } from './lib/fixtures';

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
				expect(
					getArrayOfFilteredTasks( tasks, 'newsletter' )?.sort( ( a, b ) =>
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

	describe( 'filterDomainUpsellTask', () => {
		describe( 'when site plan is free', () => {
			it( 'return original enchanceTasks', () => {
				const task = buildTask( {
					id: 'domain_upsell',
					completed: false,
					disabled: true,
					taskType: 'blog',
					title: 'domain upsell task',
				} );
				const tasks = [ task ];
				const site = buildSiteDetails( { plan: { is_free: true } } );
				// domain_upsell is still in the array
				expect(
					filterDomainUpsellTask( tasks, site )?.findIndex(
						( task ) => ( task.id = 'domain_upsell' )
					)
				).toBe( 0 );
			} );
		} );
		describe( 'when site plan is not free', () => {
			it( 'filters out the domain_upsell task', () => {
				const task = buildTask( {
					id: 'domain_upsell',
					completed: false,
					disabled: true,
					taskType: 'blog',
					title: 'domain upsell task',
				} );
				const tasks = [ task ];
				const site = buildSiteDetails( { plan: { is_free: false } } );
				// domain_upsell is NOT in the array
				expect(
					filterDomainUpsellTask( tasks, site )?.findIndex(
						( task ) => ( task.id = 'domain_upsell' )
					)
				).toBe( -1 );
			} );
		} );
	} );
} );
