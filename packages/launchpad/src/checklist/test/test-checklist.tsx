import { render, screen } from '@testing-library/react';
import React from 'react';
import Checklist from '..';
import ChecklistItem from '../../checklist-item';

describe( 'Checklist', () => {
	const createTask = ( id: string, completed = false ) => ( {
		id,
		title: `Task ${ id }`,
		completed,
		onClick: jest.fn(),
		disabled: false,
	} );

	it( 'highlights the first incomplete task when highlightNextAction is true', () => {
		const tasks = [
			createTask( '1', true ), // completed
			createTask( '2', false ), // should be highlighted
			createTask( '3', false ), // should not be highlighted
		];

		render(
			<Checklist highlightNextAction>
				{ tasks.map( ( task ) => (
					<ChecklistItem key={ task.id } task={ task } />
				) ) }
			</Checklist>
		);

		// Get all checklist items
		const items = screen.getAllByRole( 'listitem' );

		// Second task should have the highlighted class
		expect( items[ 1 ] ).toHaveClass( 'highlighted' );
		// Third task should not be highlighted
		expect( items[ 2 ] ).not.toHaveClass( 'highlighted' );
	} );
} );
