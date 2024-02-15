import { render, screen } from '@testing-library/react';
import React from 'react';
import Checklist from '../';
import ChecklistItem from '../../checklist-item';
import { buildTask } from '../../test/lib/fixtures';
import '@testing-library/jest-dom';

describe( 'Checklist', () => {
	it( 'renders the list of items', () => {
		render(
			<Checklist>
				<ChecklistItem key={ 0 } task={ buildTask( {} ) } />
				<ChecklistItem key={ 1 } task={ buildTask( {} ) } />
			</Checklist>
		);
		const checklistItems = screen.getAllByRole( 'listitem' );
		expect( checklistItems.length ).toBe( 2 );
	} );

	it( 'renders a empty list when provided no tasks', () => {
		render( <Checklist /> );
		const checklistItems = screen.queryByRole( 'listitem' );

		expect( checklistItems ).not.toBeInTheDocument();
	} );
} );
