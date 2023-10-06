import { render, screen } from '@testing-library/react';
import React from 'react';
import Launchpad from '../launchpad';
import '@testing-library/jest-dom';
import type { Task } from '../types';

jest.mock( '@automattic/data-stores', () => {
	const { buildTask } = require( './lib/fixtures' );
	return {
		useLaunchpad: jest.fn( () => {
			return {
				isFetchedAfterMount: true,
				data: {
					checklist: [
						buildTask( { id: 'task1' } ),
						buildTask( { id: 'task2' } ),
						buildTask( { id: 'task3' } ),
					],
				},
			};
		} ),
	};
} );

describe( 'Launchpad', () => {
	describe( 'when no taskFilter is provided', () => {
		it( 'then all tasks from useLaunchpad are rendered', () => {
			render( <Launchpad context="launchpad" siteSlug="any site" /> );
			const checklistItems = screen.queryAllByRole( 'listitem' );
			expect( checklistItems.length ).toBe( 3 );
		} );
	} );

	describe( 'when taskFilter is provided', () => {
		it( 'then render only tasks returned from the callback', () => {
			const filter = ( tasks: Task[] ) => {
				// return only the first task
				return [ tasks[ 0 ] ];
			};

			render( <Launchpad context="launchpad" siteSlug="any site" taskFilter={ filter } /> );
			const checklistItems = screen.queryAllByRole( 'listitem' );
			expect( checklistItems.length ).toBe( 1 );

			const taskId = checklistItems[ 0 ].querySelector( 'button' )?.getAttribute( 'data-task' );
			expect( taskId ).toBe( 'task1' );
		} );
	} );
} );
