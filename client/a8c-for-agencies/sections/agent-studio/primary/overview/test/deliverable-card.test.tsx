/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import DeliverableCard from '../deliverable-card';
import type { AgentStudioOutput } from '../../../types';

// Stub the delete dialog — its render path is independent and pulls in extra
// Redux state we don't need for this card's behavior.
jest.mock( '../delete-deliverable-dialog', () => ( {
	__esModule: true,
	default: () => null,
} ) );

function renderWithStore( ui: React.ReactElement ) {
	const store = createStore( ( state = {} ) => state );
	return render( <Provider store={ store }>{ ui }</Provider> );
}

function makeOutput( overrides: Partial< AgentStudioOutput > = {} ): AgentStudioOutput {
	return {
		id: 'run-1',
		projectId: '',
		title: 'Launch one-pager',
		description: 'Pitch leave-behind.',
		agentName: 'June',
		deliverableType: 'PDF',
		status: 'ready',
		createdAt: '2026-05-20T10:00:00Z',
		updatedAt: '2026-05-20T10:05:00Z',
		...overrides,
	};
}

beforeEach( () => {
	jest.restoreAllMocks();
} );

describe( 'DeliverableCard', () => {
	it( 'shows the page count copy when a ready one-pager has no preview images', () => {
		const output = makeOutput( { pageCount: 4 } );

		renderWithStore( <DeliverableCard output={ output } /> );

		expect( screen.getAllByText( '4 pages' ).length ).toBeGreaterThan( 0 );
	} );

	it( 'falls back to assetCount when pageCount is absent', () => {
		const output = makeOutput( {
			pageCount: undefined,
			assetCount: 6,
			deliverableType: 'Social assets',
			previewUrls: [ 'https://example.com/a.png' ],
		} );

		renderWithStore( <DeliverableCard output={ output } /> );

		expect( screen.getByText( '6 assets' ) ).toBeVisible();
	} );

	it( 'opens the PDF in a new tab when a ready card with a downloadUrl is clicked', async () => {
		const open = jest.spyOn( window, 'open' ).mockImplementation( () => null );
		const user = userEvent.setup();

		const output = makeOutput( {
			pageCount: 2,
			downloadUrl: 'https://example.com/run-1.pdf',
		} );

		renderWithStore( <DeliverableCard output={ output } /> );

		await user.click( screen.getByText( 'Launch one-pager' ) );

		expect( open ).toHaveBeenCalledWith(
			'https://example.com/run-1.pdf',
			'_blank',
			'noopener,noreferrer'
		);
	} );

	it( 'does not open anything when the card is generating', async () => {
		const open = jest.spyOn( window, 'open' ).mockImplementation( () => null );
		const user = userEvent.setup();

		const output = makeOutput( { status: 'generating', downloadUrl: undefined } );

		renderWithStore( <DeliverableCard output={ output } /> );

		await user.click( screen.getByText( 'Launch one-pager' ) );

		expect( open ).not.toHaveBeenCalled();
	} );

	it( 'does not open anything when the Delete button is clicked on an openable card', async () => {
		const open = jest.spyOn( window, 'open' ).mockImplementation( () => null );
		const user = userEvent.setup();

		const output = makeOutput( {
			pageCount: 2,
			downloadUrl: 'https://example.com/run-1.pdf',
		} );

		renderWithStore( <DeliverableCard output={ output } /> );

		await user.click( screen.getByRole( 'button', { name: 'Delete' } ) );

		expect( open ).not.toHaveBeenCalled();
	} );
} );
