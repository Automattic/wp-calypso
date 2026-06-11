/**
 * @jest-environment jsdom
 */
import { readSpacesQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { CreateSpaceModal } from '../index';
import type { ReadSpace } from '@automattic/api-core';

const WORK: ReadSpace = {
	id: '2f5d8f28-04b7-4f6a-a908-6c4d2b4b8f21',
	name: 'Work',
	tags: [],
	layout: { color: 'blue', icon: 'inbox' },
};

function setup( { existing = [] as ReadSpace[], onCreated = jest.fn() } = {} ) {
	const queryClient = new QueryClient();
	queryClient.setQueryData( readSpacesQuery().queryKey, existing );
	const onClose = jest.fn();
	const user = userEvent.setup();
	renderWithProvider( <CreateSpaceModal isOpen onClose={ onClose } onCreated={ onCreated } />, {
		queryClient,
	} );
	return { queryClient, onClose, onCreated, user };
}

describe( 'CreateSpaceModal', () => {
	it( 'renders nothing when closed', () => {
		renderWithProvider( <CreateSpaceModal isOpen={ false } onClose={ jest.fn() } /> );

		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
	} );

	it( 'keeps Create disabled until a valid name is entered', async () => {
		const { user } = setup();

		expect( screen.getByRole( 'button', { name: 'Create' } ) ).toBeDisabled();

		await user.type( screen.getByLabelText( 'Name' ), 'Reading' );

		expect( screen.getByRole( 'button', { name: 'Create' } ) ).toBeEnabled();
	} );

	it( 'shows a required error once the name is cleared', async () => {
		const { user } = setup();

		const input = screen.getByLabelText( 'Name' );
		await user.type( input, 'Reading' );
		await user.clear( input );

		expect( await screen.findByText( 'Name is required' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Create' } ) ).toBeDisabled();
	} );

	it( 'rejects a name longer than the maximum length', async () => {
		const { user } = setup();

		await user.type( screen.getByLabelText( 'Name' ), 'a'.repeat( 51 ) );

		expect( await screen.findByText( /50 characters or fewer/ ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Create' } ) ).toBeDisabled();
	} );

	it( 'rejects a duplicate name regardless of case', async () => {
		const { user } = setup( { existing: [ WORK ] } );

		await user.type( screen.getByLabelText( 'Name' ), 'work' );

		expect( await screen.findByText( 'A space with this name already exists' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Create' } ) ).toBeDisabled();
	} );

	it( 'creates a space (tags optional), appends it to the cached list, and closes', async () => {
		const { user, onClose, queryClient } = setup();

		await user.type( screen.getByLabelText( 'Name' ), 'Reading' );
		await user.click( screen.getByRole( 'button', { name: 'Create' } ) );

		await waitFor( () => expect( onClose ).toHaveBeenCalled() );

		const spaces = queryClient.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey );
		expect( spaces ).toEqual( [ expect.objectContaining( { name: 'Reading', tags: [] } ) ] );
		// Sources live only on the single-space detail cache, not on list items.
		expect( spaces?.[ 0 ] ).not.toHaveProperty( 'sources' );
		expect( onClose ).toHaveBeenCalled();
	} );

	it( 'notifies the parent with the created space', async () => {
		const { user, onCreated } = setup();

		await user.type( screen.getByLabelText( 'Name' ), 'Reading' );
		await user.click( screen.getByRole( 'button', { name: 'Create' } ) );

		await waitFor( () =>
			expect( onCreated ).toHaveBeenCalledWith( expect.objectContaining( { name: 'Reading' } ) )
		);
	} );

	it( 'closes without creating when Cancel is clicked', async () => {
		const { user, onClose, queryClient } = setup();

		await user.click( screen.getByRole( 'button', { name: 'Cancel' } ) );

		expect( onClose ).toHaveBeenCalled();
		expect( queryClient.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey ) ).toEqual( [] );
	} );
} );
