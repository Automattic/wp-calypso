/**
 * @jest-environment jsdom
 */
import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { DataViewsActionModal, useDeepLinkedDataViewsAction } from '../dataviews-action-modal';
import type { Action, ActionModal } from '@wordpress/dataviews';

type NamedItem = { id: string; name: string };

const item: NamedItem = { id: '1', name: 'Example' };

function createAction(
	overrides: Partial< ActionModal< NamedItem > > = {}
): ActionModal< NamedItem > {
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

type Item = { id: string; eligible: boolean };

const items: Item[] = [
	{ id: 'first', eligible: false },
	{ id: 'second', eligible: true },
];

const modalAction = {
	id: 'rename',
	label: 'Rename',
	isEligible: ( item: Item ) => item.eligible,
	RenderModal: () => <div />,
} as Action< Item >;

const buttonAction = {
	id: 'delete',
	label: 'Delete',
	callback: () => {},
} as Action< Item >;

const actions = [ modalAction, buttonAction ];

describe( 'useDeepLinkedDataViewsAction', () => {
	let navigate: jest.Mock;

	beforeEach( () => {
		navigate = jest.fn();
	} );

	test( 'returns the action with the first item it is eligible for', () => {
		const { result } = renderHook( () =>
			useDeepLinkedDataViewsAction( {
				queryParams: { action: 'rename' },
				navigate,
				actions,
				items,
			} )
		);

		expect( result.current?.action ).toBe( modalAction );
		expect( result.current?.item ).toBe( items[ 1 ] );
	} );

	test( 'drops the param from the URL on arrival, keeping the others', () => {
		renderHook( () =>
			useDeepLinkedDataViewsAction( {
				queryParams: { action: 'rename', page: 2 },
				navigate,
				actions,
				items,
			} )
		);

		expect( navigate ).toHaveBeenCalledWith( {
			search: { action: undefined, page: 2 },
			replace: true,
		} );
	} );

	test( 'stays open once the param is gone', () => {
		const { result, rerender } = renderHook(
			( { queryParams }: { queryParams: Record< string, unknown > } ) =>
				useDeepLinkedDataViewsAction( { queryParams, navigate, actions, items } ),
			{ initialProps: { queryParams: { action: 'rename' } as Record< string, unknown > } }
		);

		rerender( { queryParams: {} } );

		expect( result.current?.action ).toBe( modalAction );
	} );

	test( 'closes on request, and does not reopen', () => {
		const { result, rerender } = renderHook( () =>
			useDeepLinkedDataViewsAction( {
				queryParams: { action: 'rename' },
				navigate,
				actions,
				items,
			} )
		);

		act( () => result.current?.onClose() );
		rerender();

		expect( result.current ).toBeUndefined();
	} );

	test( 'returns nothing without a deep link', () => {
		const { result } = renderHook( () =>
			useDeepLinkedDataViewsAction( { queryParams: {}, navigate, actions, items } )
		);

		expect( result.current ).toBeUndefined();
		expect( navigate ).not.toHaveBeenCalled();
	} );

	test( 'ignores an unknown action, and one that has no modal', () => {
		const { result: unknownAction } = renderHook( () =>
			useDeepLinkedDataViewsAction( { queryParams: { action: 'nope' }, navigate, actions, items } )
		);
		const { result: withoutModal } = renderHook( () =>
			useDeepLinkedDataViewsAction( {
				queryParams: { action: 'delete' },
				navigate,
				actions,
				items,
			} )
		);

		expect( unknownAction.current ).toBeUndefined();
		expect( withoutModal.current ).toBeUndefined();
	} );

	test( 'returns nothing when no item is eligible', () => {
		const { result } = renderHook( () =>
			useDeepLinkedDataViewsAction( {
				queryParams: { action: 'rename' },
				navigate,
				actions,
				items: [ items[ 0 ] ],
			} )
		);

		expect( result.current ).toBeUndefined();
	} );

	test( 'reads the action from a caller-named param', () => {
		const { result } = renderHook( () =>
			useDeepLinkedDataViewsAction( {
				queryParams: { open: 'rename' },
				navigate,
				actions,
				items,
				paramName: 'open',
			} )
		);

		expect( result.current?.action ).toBe( modalAction );
		expect( navigate ).toHaveBeenCalledWith( {
			search: { open: undefined },
			replace: true,
		} );
	} );
} );
