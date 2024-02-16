import { recordTracksEvent } from '@automattic/calypso-analytics';
import { renderHook } from '@testing-library/react';
import { useTracking } from '..';
import { buildTask } from '../../test/lib/fixtures';
import type { SiteDetails } from '@automattic/data-stores';

jest.mock( '@automattic/calypso-analytics' );

describe( 'useTracking', () => {
	beforeEach( () => jest.clearAllMocks() );

	const buildDefaultProps = ( options = {} ) => ( {
		checklistSlug: 'site-setup-checklist',
		context: 'customer-home',
		site: { options: { site_intent: 'build' } } as SiteDetails,
		tasks: [
			buildTask( { id: 'task-1', completed: true } ),
			buildTask( { id: 'task-2', completed: false } ),
		],
		...options,
	} );

	it( 'tracks the view event on load', () => {
		renderHook( () => useTracking( buildDefaultProps() ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_launchpad_tasklist_viewed', {
			checklist_slug: 'site-setup-checklist',
			tasks: ',task-1,task-2,',
			is_completed: false,
			number_of_steps: 2,
			number_of_completed_steps: 1,
			context: 'customer-home',
			site_intent: 'build',
		} );
	} );

	it( 'use comma as prefix and suffix for the task names to simplify queries on the logs tool', () => {
		renderHook( () => useTracking( buildDefaultProps() ) );

		const tasks = jest.mocked( recordTracksEvent ).mock.calls[ 0 ][ 1 ].tasks;
		expect( tasks ).toBe( ',task-1,task-2,' );
	} );

	it( 'tracks the view event by task', () => {
		const tasks = [
			buildTask( { id: 'task-1', completed: true, order: 3 } ),
			buildTask( { id: 'task-2', completed: false, order: 4 } ),
		];

		renderHook( () => useTracking( buildDefaultProps( { tasks } ) ) );

		expect( recordTracksEvent ).toHaveBeenNthCalledWith( 2, 'calypso_launchpad_task_view', {
			checklist_slug: 'site-setup-checklist',
			is_completed: true,
			context: 'customer-home',
			site_intent: 'build',
			order: 3,
			task_id: 'task-1',
		} );
	} );

	it( 'prevent calls multiple times during rerender', () => {
		const params = buildDefaultProps();
		const { rerender } = renderHook( () => useTracking( params ) );

		rerender();

		// 3 calls: 1 for the view and 2 for the tasks
		expect( recordTracksEvent ).toHaveBeenCalledTimes( 3 );
	} );

	it( 'logs the load events only when the site info is available', () => {
		const { rerender } = renderHook( ( site = null ) =>
			useTracking( buildDefaultProps( { site } ) )
		);

		expect( recordTracksEvent ).toHaveBeenCalledTimes( 0 );

		rerender( { options: { site_intent: 'some-site-intent' } } as SiteDetails );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_launchpad_tasklist_viewed',
			expect.objectContaining( {
				site_intent: 'some-site-intent',
			} )
		);

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_launchpad_task_view',
			expect.objectContaining( {
				site_intent: 'some-site-intent',
			} )
		);
	} );

	it( 'tracks the click event', () => {
		const tasks = [
			buildTask( { id: 'task-1', completed: true, order: 3 } ),
			buildTask( { id: 'task-2', completed: false, order: 4 } ),
		];

		jest.clearAllMocks();
		const { result } = renderHook( () => useTracking( buildDefaultProps() ) );

		result.current.trackTaskClick( tasks[ 1 ] );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_launchpad_task_clicked', {
			checklist_slug: 'site-setup-checklist',
			task_id: 'task-2',
			checklist_completed: false,
			is_completed: false,
			order: 4,
			context: 'customer-home',
		} );
	} );
} );
