/**
 * @jest-environment jsdom
 */
import { filterDomainUpsellTask, getArrayOfFilteredTasks, getEnhancedTasks } from '../task-helper';
import { tasks, launchpadFlowTasks } from '../tasks';
import {
	LINK_IN_BIO_FLOW,
	FREE_FLOW,
	WRITE_FLOW,
	BUILD_FLOW,
	NEWSLETTER_FLOW,
} from './../../../../../../../../packages/onboarding/src/utils/flows';
import { buildTask, buildSiteDetails, defaultSiteDetails } from './lib/fixtures';

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
		describe( 'when site plan is free and affected flow (free, build, write)', () => {
			it( 'return original enhanceTasks', () => {
				const task = buildTask( {
					id: 'domain_upsell',
					completed: false,
					disabled: true,
					taskType: 'blog',
					title: 'domain upsell task',
				} );
				const tasks = [ task ];
				const site = defaultSiteDetails;
				const freeFlow = FREE_FLOW;
				const writeFlow = WRITE_FLOW;
				const buildFlow = BUILD_FLOW;
				expect( filterDomainUpsellTask( freeFlow, tasks, site ) ).toBe( tasks );
				expect( filterDomainUpsellTask( writeFlow, tasks, site ) ).toBe( tasks );
				expect( filterDomainUpsellTask( buildFlow, tasks, site ) ).toBe( tasks );
			} );
		} );

		describe( 'when unaffected flow', () => {
			it( 'return original enhanceTasks', () => {
				const task = buildTask( {
					id: 'domain_upsell',
					completed: false,
					disabled: true,
					taskType: 'blog',
					title: 'domain upsell task',
				} );
				const tasks = [ task ];
				const site = defaultSiteDetails;
				const newsletterFlow = NEWSLETTER_FLOW;
				expect( filterDomainUpsellTask( newsletterFlow, tasks, site ) ).toBe( tasks );
			} );
		} );

		describe( 'when site plan is not free and affected flow (free, build, write)', () => {
			it( 'return enhanceTask array with domain_upsell task removed', () => {
				const task = buildTask( {
					id: 'domain_upsell',
					completed: false,
					disabled: true,
					taskType: 'blog',
					title: 'domain upsell task',
				} );
				const tasks = [ task ];
				const site = buildSiteDetails( { plan: { is_free: false } } );

				const freeFlow = FREE_FLOW;
				const writeFlow = WRITE_FLOW;
				const buildFlow = BUILD_FLOW;
				expect( filterDomainUpsellTask( freeFlow, tasks, site ) ).toHaveLength( 0 );
				expect( filterDomainUpsellTask( writeFlow, tasks, site ) ).toHaveLength( 0 );
				expect( filterDomainUpsellTask( buildFlow, tasks, site ) ).toHaveLength( 0 );
			} );
		} );

		describe( 'when site plan is not free and not affected flow', () => {
			it( 'return enhanceTask array with domain_upsell task removed', () => {
				const tasks = buildTask( {
					id: 'domain_upsell',
					completed: false,
					disabled: true,
					taskType: 'blog',
					title: 'domain upsell task',
				} );
				const site = buildSiteDetails( {} );
				const newsletterFlow = NEWSLETTER_FLOW;
				const linkInBioFlow = LINK_IN_BIO_FLOW;
				expect( filterDomainUpsellTask( newsletterFlow, tasks, site ) ).toBe( tasks );
				expect( filterDomainUpsellTask( linkInBioFlow, tasks, site ) ).toBe( tasks );
			} );
		} );
	} );
} );
