/**
 * @jest-environment jsdom
 */
import { readSpaceQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { CustomizeModal } from '../index';
import type { ReadSpaceDetails } from '@automattic/api-core';

const SPACE: ReadSpaceDetails = {
	id: 'work-id',
	name: 'Work',
	tags: [],
	layout: { color: 'blue', icon: 'inbox', view: 'standard-list' },
	sources: [],
};

function render( onClose = jest.fn() ) {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	queryClient.setQueryData( readSpaceQuery( SPACE.id ).queryKey, SPACE );

	const view = renderWithProvider(
		<CustomizeModal isOpen spaceId={ SPACE.id } onClose={ onClose } />,
		{ queryClient, initialState: { currentUser: { id: 1 } } }
	);
	return { ...view, queryClient, onClose };
}

function renderWithPendingSpace( onClose = jest.fn() ) {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	queryClient.prefetchQuery( {
		...readSpaceQuery( SPACE.id ),
		queryFn: () => new Promise< never >( () => undefined ),
	} );

	const view = renderWithProvider(
		<CustomizeModal isOpen spaceId={ SPACE.id } onClose={ onClose } />,
		{ queryClient, initialState: { currentUser: { id: 1 } } }
	);
	return { ...view, queryClient, onClose };
}

describe( 'CustomizeModal', () => {
	it( 'lists the layout presets and pre-selects the space layout', () => {
		render();

		expect( screen.getByRole( 'radio', { name: /List/ } ) ).toBeChecked();
		expect( screen.getByRole( 'radio', { name: /Magazine/ } ) ).not.toBeChecked();
		expect( screen.getByRole( 'radio', { name: /Gallery/ } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'radio', { name: /Board/ } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'radio', { name: /Legacy/ } ) ).toBeInTheDocument();
	} );

	it( 'saves the chosen layout to the space cache and closes', async () => {
		const user = userEvent.setup();
		const { queryClient, onClose } = render();

		await user.click( screen.getByRole( 'radio', { name: /Gallery/ } ) );
		await user.click( screen.getByRole( 'button', { name: 'Save changes' } ) );

		const cached = queryClient.getQueryData< ReadSpaceDetails >(
			readSpaceQuery( SPACE.id ).queryKey
		);
		expect( cached?.layout.view ).toBe( 'gallery' );
		expect( onClose ).toHaveBeenCalled();
	} );

	it( 'does not change the layout when cancelled', async () => {
		const user = userEvent.setup();
		const { queryClient, onClose } = render();

		await user.click( screen.getByRole( 'radio', { name: /Board/ } ) );
		await user.click( screen.getByRole( 'button', { name: 'Cancel' } ) );

		const cached = queryClient.getQueryData< ReadSpaceDetails >(
			readSpaceQuery( SPACE.id ).queryKey
		);
		expect( cached?.layout.view ).toBe( 'standard-list' );
		expect( onClose ).toHaveBeenCalled();
	} );

	it( 'does not allow saving before the space detail has loaded', async () => {
		const user = userEvent.setup();
		const { queryClient, onClose } = renderWithPendingSpace();

		await user.click( screen.getByRole( 'radio', { name: /Gallery/ } ) );
		expect( screen.getByRole( 'button', { name: 'Save changes' } ) ).toBeDisabled();

		expect( queryClient.getQueryData( readSpaceQuery( SPACE.id ).queryKey ) ).toBeUndefined();
		expect( onClose ).not.toHaveBeenCalled();
	} );
} );
