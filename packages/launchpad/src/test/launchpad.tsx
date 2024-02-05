import { recordTracksEvent } from '@automattic/calypso-analytics';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import LaunchpadInternal, { LaunchpadInternalProps } from '../launchpad-internal';
import '@testing-library/jest-dom';
import type { Task } from '../types';

jest.mock( '@automattic/calypso-analytics' );

jest.mock( '@automattic/data-stores', () => {
	const { buildTask } = require( './lib/fixtures' );
	return {
		useLaunchpad: jest.fn( () => {
			return {
				isFetchedAfterMount: true,
				data: {
					checklist: [
						buildTask( { id: 'task1', title: 'Task 1', completed: false, disabled: false } ),
						buildTask( { id: 'task2', title: 'Task 2' } ),
						buildTask( { id: 'task3', title: 'Task 3' } ),
					],
				},
			};
		} ),
	};
} );

describe( 'LaunchpadInternal', () => {
	const defaultProps = {
		siteSlug: 'any site',
		checklistSlug: 'some-site',
		launchpadContext: 'some-context',
	};
	const renderComponent = ( props: Partial< LaunchpadInternalProps > = {} ) => {
		return render( <LaunchpadInternal { ...defaultProps } { ...props } /> );
	};

	it( 'renders the tasks', () => {
		renderComponent();
		const checklistItems = screen.queryAllByRole( 'listitem' );
		expect( checklistItems.length ).toBe( 3 );
	} );

	it( 'records the checklist item click when autoTracking is enabled', async () => {
		renderComponent( { enableAutoTracking: true } );

		jest.clearAllMocks();
		await userEvent.click( screen.getByRole( 'button', { name: /Task 1/ } ) );

		await waitFor( () => {
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_launchpad_task_clicked',
				expect.any( Object )
			);
		} );
	} );

	it( 'renders only the tasks returned taskFilter', () => {
		const filter = ( tasks: Task[] ) => {
			// return only the first task
			return [ tasks[ 0 ] ];
		};

		renderComponent( { taskFilter: filter } );
		const checklistItems = screen.queryAllByRole( 'listitem' );
		expect( checklistItems.length ).toBe( 1 );

		const taskId = checklistItems[ 0 ].querySelector( 'button' )?.getAttribute( 'data-task' );
		expect( taskId ).toBe( 'task1' );
	} );
} );
