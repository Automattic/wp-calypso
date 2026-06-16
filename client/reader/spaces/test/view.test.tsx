/**
 * @jest-environment jsdom
 */
import { readSpaceQuery, readSpacesQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { QueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SpacesView } from '../view';
import type { ReadSpaceDetails } from '@automattic/api-core';

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: Object.assign( jest.fn(), { replace: jest.fn() } ),
} ) );

jest.mock( 'calypso/components/data/document-head', () => ( {
	__esModule: true,
	default: () => null,
} ) );

jest.mock( '@automattic/react-virtualized', () => ( {
	AutoSizer: ( {
		children,
	}: {
		children: ( size: { width: number; height: number } ) => React.ReactNode;
	} ) => children( { width: 480, height: 360 } ),
	List: ( {
		rowCount,
		rowRenderer,
	}: {
		rowCount: number;
		rowRenderer: ( props: {
			index: number;
			key: string;
			style: React.CSSProperties;
		} ) => React.ReactNode;
	} ) => (
		<div>
			{ Array.from( { length: Math.min( rowCount, 5 ) }, ( _value, index ) =>
				rowRenderer( { index, key: `row-${ index }`, style: {} } )
			) }
		</div>
	),
} ) );

const WORK: ReadSpaceDetails = {
	id: '2f5d8f28-04b7-4f6a-a908-6c4d2b4b8f21',
	name: 'Work',
	tags: [],
	layout: { color: 'blue', icon: 'inbox' },
	sources: [],
};

function render( ui: React.ReactElement ) {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	queryClient.setQueryData( readSpacesQuery().queryKey, [ WORK ] );
	queryClient.setQueryData( readSpaceQuery( WORK.id ).queryKey, WORK );

	return renderWithProvider( ui, {
		queryClient,
		initialState: { currentUser: { id: 1 } },
	} );
}

describe( 'SpacesView', () => {
	beforeEach( () => {
		window.history.replaceState( {}, '', '/reader/spaces' );
		jest.mocked( page ).mockClear();
		jest.mocked( page.replace ).mockClear();
	} );

	it( 'shows a Manage sources button on a space detail page', () => {
		render( <SpacesView id={ WORK.id } /> );

		expect( screen.getByRole( 'button', { name: 'Manage sources' } ) ).toBeVisible();
	} );

	it( 'does not show the Manage sources button on the spaces landing page', () => {
		render( <SpacesView /> );

		expect( screen.queryByRole( 'button', { name: 'Manage sources' } ) ).not.toBeInTheDocument();
	} );

	it( 'opens the sources action when Manage sources is clicked', async () => {
		const user = userEvent.setup();
		render( <SpacesView id={ WORK.id } /> );

		await user.click( screen.getByRole( 'button', { name: 'Manage sources' } ) );

		expect( page ).toHaveBeenCalledWith(
			'/reader/spaces/2f5d8f28-04b7-4f6a-a908-6c4d2b4b8f21#action=manage-sources'
		);
	} );

	it( 'renders the sources modal when the manage-sources action hash is present', () => {
		window.history.replaceState(
			{},
			'',
			'/reader/spaces/2f5d8f28-04b7-4f6a-a908-6c4d2b4b8f21#action=manage-sources'
		);

		render( <SpacesView id={ WORK.id } /> );

		expect( screen.getByRole( 'heading', { name: 'Sources for “Work”' } ) ).toBeVisible();
	} );

	it( 'does not render the sources modal without the manage-sources action hash', () => {
		render( <SpacesView id={ WORK.id } /> );

		expect(
			screen.queryByRole( 'heading', { name: 'Sources for “Work”' } )
		).not.toBeInTheDocument();
	} );

	it( 'does not render the sources modal on the spaces landing page', () => {
		window.history.replaceState( {}, '', '/reader/spaces#action=manage-sources' );

		render( <SpacesView /> );

		expect(
			screen.queryByRole( 'heading', { name: 'Sources for “Work”' } )
		).not.toBeInTheDocument();
	} );

	it( 'removes the action hash when the sources modal closes', async () => {
		const user = userEvent.setup();
		window.history.replaceState(
			{},
			'',
			'/reader/spaces/2f5d8f28-04b7-4f6a-a908-6c4d2b4b8f21#action=manage-sources'
		);
		render( <SpacesView id={ WORK.id } /> );

		await user.click( screen.getByRole( 'button', { name: 'Done' } ) );

		expect( page.replace ).toHaveBeenCalledWith(
			'/reader/spaces/2f5d8f28-04b7-4f6a-a908-6c4d2b4b8f21'
		);
	} );
} );
