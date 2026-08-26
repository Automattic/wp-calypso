/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataViewsActionModal } from '../dataviews-action-modal';
import type { ActionModal } from '@wordpress/dataviews';

type Item = { id: string; name: string };

const item: Item = { id: '1', name: 'Example' };

function createAction( overrides: Partial< ActionModal< Item > > = {} ): ActionModal< Item > {
	return {
		id: 'rename',
		label: 'Rename',
		RenderModal: ( { items, closeModal } ) => (
			<button onClick={ closeModal }>Renaming { items[ 0 ].name }</button>
		),
		...overrides,
	};
}

describe( '<DataViewsActionModal>', () => {
	test( 'titles the modal with the action label, and renders its modal for the item', () => {
		render(
			<DataViewsActionModal action={ createAction() } item={ item } onClose={ jest.fn() } />
		);

		expect( screen.getByRole( 'dialog', { name: 'Rename' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Renaming Example' } ) ).toBeVisible();
	} );

	test( 'prefers the modal header over the label, and resolves both when they are functions', () => {
		render(
			<DataViewsActionModal
				action={ createAction( {
					label: ( items ) => `Rename ${ items[ 0 ].name }`,
					modalHeader: ( items ) => `Renaming ${ items[ 0 ].name }`,
				} ) }
				item={ item }
				onClose={ jest.fn() }
			/>
		);

		expect( screen.getByRole( 'dialog', { name: 'Renaming Example' } ) ).toBeVisible();
	} );

	test( 'closes from the action’s own modal', async () => {
		const onClose = jest.fn();
		render( <DataViewsActionModal action={ createAction() } item={ item } onClose={ onClose } /> );

		await userEvent.click( screen.getByRole( 'button', { name: 'Renaming Example' } ) );

		expect( onClose ).toHaveBeenCalled();
	} );
} );
