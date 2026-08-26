/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { useDeepLinkedAction } from '../use-deep-linked-action';
import type { Action } from '@wordpress/dataviews';

const mockNavigate = jest.fn();

jest.mock( '@tanstack/react-router', () => ( {
	...jest.requireActual( '@tanstack/react-router' ),
	useNavigate: () => mockNavigate,
} ) );

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

describe( 'useDeepLinkedAction', () => {
	beforeEach( () => {
		mockNavigate.mockClear();
	} );

	test( 'returns the action with the first item it is eligible for', () => {
		const { result } = renderHook( () =>
			useDeepLinkedAction( { actionId: 'rename', actions, items } )
		);

		expect( result.current?.action ).toBe( modalAction );
		expect( result.current?.item ).toBe( items[ 1 ] );
	} );

	test( 'drops the param from the URL on arrival', () => {
		renderHook( () => useDeepLinkedAction( { actionId: 'rename', actions, items } ) );

		expect( mockNavigate ).toHaveBeenCalledWith( expect.objectContaining( { replace: true } ) );

		const { search } = mockNavigate.mock.calls[ 0 ][ 0 ];
		expect( search( { page: 2, action: 'rename' } ) ).toEqual( { page: 2, action: undefined } );
	} );

	test( 'stays open once the param is gone', () => {
		const { result, rerender } = renderHook(
			( { actionId }: { actionId?: string } ) =>
				useDeepLinkedAction( { actionId, actions, items } ),
			{ initialProps: { actionId: 'rename' as string | undefined } }
		);

		rerender( { actionId: undefined } );

		expect( result.current?.action ).toBe( modalAction );
	} );

	test( 'closes on request, and does not reopen', () => {
		const { result, rerender } = renderHook( () =>
			useDeepLinkedAction( { actionId: 'rename', actions, items } )
		);

		act( () => result.current?.onClose() );
		rerender();

		expect( result.current ).toBeUndefined();
	} );

	test( 'returns nothing without a deep link', () => {
		const { result } = renderHook( () => useDeepLinkedAction( { actions, items } ) );

		expect( result.current ).toBeUndefined();
		expect( mockNavigate ).not.toHaveBeenCalled();
	} );

	test( 'ignores an unknown action, and one that has no modal', () => {
		const { result: unknownAction } = renderHook( () =>
			useDeepLinkedAction( { actionId: 'nope', actions, items } )
		);
		const { result: withoutModal } = renderHook( () =>
			useDeepLinkedAction( { actionId: 'delete', actions, items } )
		);

		expect( unknownAction.current ).toBeUndefined();
		expect( withoutModal.current ).toBeUndefined();
	} );

	test( 'returns nothing when no item is eligible', () => {
		const { result } = renderHook( () =>
			useDeepLinkedAction( { actionId: 'rename', actions, items: [ items[ 0 ] ] } )
		);

		expect( result.current ).toBeUndefined();
	} );
} );
