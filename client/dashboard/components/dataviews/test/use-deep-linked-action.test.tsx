/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { useDeepLinkedAction } from '../use-deep-linked-action';
import type { Action } from '@wordpress/dataviews';

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
	let navigate: jest.Mock;

	beforeEach( () => {
		navigate = jest.fn();
	} );

	test( 'returns the action with the first item it is eligible for', () => {
		const { result } = renderHook( () =>
			useDeepLinkedAction( { queryParams: { action: 'rename' }, navigate, actions, items } )
		);

		expect( result.current?.action ).toBe( modalAction );
		expect( result.current?.item ).toBe( items[ 1 ] );
	} );

	test( 'drops the param from the URL on arrival, keeping the others', () => {
		renderHook( () =>
			useDeepLinkedAction( {
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
				useDeepLinkedAction( { queryParams, navigate, actions, items } ),
			{ initialProps: { queryParams: { action: 'rename' } as Record< string, unknown > } }
		);

		rerender( { queryParams: {} } );

		expect( result.current?.action ).toBe( modalAction );
	} );

	test( 'closes on request, and does not reopen', () => {
		const { result, rerender } = renderHook( () =>
			useDeepLinkedAction( { queryParams: { action: 'rename' }, navigate, actions, items } )
		);

		act( () => result.current?.onClose() );
		rerender();

		expect( result.current ).toBeUndefined();
	} );

	test( 'returns nothing without a deep link', () => {
		const { result } = renderHook( () =>
			useDeepLinkedAction( { queryParams: {}, navigate, actions, items } )
		);

		expect( result.current ).toBeUndefined();
		expect( navigate ).not.toHaveBeenCalled();
	} );

	test( 'ignores an unknown action, and one that has no modal', () => {
		const { result: unknownAction } = renderHook( () =>
			useDeepLinkedAction( { queryParams: { action: 'nope' }, navigate, actions, items } )
		);
		const { result: withoutModal } = renderHook( () =>
			useDeepLinkedAction( { queryParams: { action: 'delete' }, navigate, actions, items } )
		);

		expect( unknownAction.current ).toBeUndefined();
		expect( withoutModal.current ).toBeUndefined();
	} );

	test( 'returns nothing when no item is eligible', () => {
		const { result } = renderHook( () =>
			useDeepLinkedAction( {
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
			useDeepLinkedAction( {
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
