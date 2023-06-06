import { render, screen } from '@testing-library/react';
import React from 'react';
import Checklist from '../checklist';
import { buildTask } from './lib/fixtures';
import '@testing-library/jest-dom';

describe( 'Checklist', () => {
	describe( 'when provided no tasks', () => {
		it( 'then no tasks are rendered', () => {
			render( <Checklist tasks={ [] } /> );
			const checklistItems = screen.queryByRole( 'listitem' );
			expect( checklistItems ).not.toBeInTheDocument();
		} );
	} );

	describe( 'when a number of tasks are provided', () => {
		it( 'then the same number of tasks are rendered', () => {
			render(
				<Checklist tasks={ [ buildTask( { id: 'task1' } ), buildTask( { id: 'task2' } ) ] } />
			);
			const checklistItems = screen.getAllByRole( 'listitem' );
			expect( checklistItems.length ).toBe( 2 );
		} );
	} );
} );
