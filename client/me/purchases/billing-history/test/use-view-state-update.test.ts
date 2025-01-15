/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { type Operator } from '@wordpress/dataviews';
import { defaultDataViewsState } from '../constants';
import { useViewStateUpdate } from '../hooks/use-view-state-update';

describe( 'useViewStateUpdate', () => {
	test( 'initializes with default state', () => {
		const { result } = renderHook( () => useViewStateUpdate() );
		expect( result.current.view ).toEqual( defaultDataViewsState );
	} );

	test( 'updates page number', async () => {
		const { result } = renderHook( () => useViewStateUpdate() );

		await act( async () => {
			result.current.updateView( { page: 2 } );
		} );

		expect( result.current.view.page ).toBe( 2 );
	} );

	test( 'updates perPage and resets to page 1', async () => {
		const { result } = renderHook( () => useViewStateUpdate() );

		await act( async () => {
			result.current.updateView( { perPage: 50 } );
		} );

		expect( result.current.view.perPage ).toBe( 50 );
		expect( result.current.view.page ).toBe( 1 );
	} );

	test( 'updates sort and resets to page 1', async () => {
		const { result } = renderHook( () => useViewStateUpdate() );

		await act( async () => {
			result.current.updateView( {
				sort: { field: 'date', direction: 'desc' },
			} );
		} );

		expect( result.current.view.sort ).toEqual( { field: 'date', direction: 'desc' } );
		expect( result.current.view.page ).toBe( 1 );
	} );

	test( 'updates filters and resets to page 1', async () => {
		const { result } = renderHook( () => useViewStateUpdate() );
		const newFilters = [ { field: 'service', value: 'Jetpack', operator: 'is' as Operator } ];

		await act( async () => {
			result.current.updateView( { filters: newFilters } );
		} );

		expect( result.current.view.filters ).toEqual( newFilters );
		expect( result.current.view.page ).toBe( 1 );
	} );

	test( 'updates search and resets to page 1', async () => {
		const { result } = renderHook( () => useViewStateUpdate() );

		await act( async () => {
			result.current.updateView( { search: 'test' } );
		} );

		expect( result.current.view.search ).toBe( 'test' );
		expect( result.current.view.page ).toBe( 1 );
	} );

	test( 'updates fields without resetting page', async () => {
		const { result } = renderHook( () => useViewStateUpdate() );
		const newFields = [ 'date', 'amount' ];

		await act( async () => {
			result.current.updateView( { fields: newFields } );
		} );

		expect( result.current.view.fields ).toEqual( newFields );
		expect( result.current.view.page ).toBe( defaultDataViewsState.page );
	} );

	test( 'does not reset page when explicitly setting page with other updates', async () => {
		const { result } = renderHook( () => useViewStateUpdate() );

		await act( async () => {
			result.current.updateView( {
				page: 3,
				sort: { field: 'date', direction: 'desc' },
			} );
		} );

		expect( result.current.view.sort ).toEqual( { field: 'date', direction: 'desc' } );
		expect( result.current.view.page ).toBe( 3 );
	} );

	test( 'does not update state when new values are the same as current', async () => {
		const { result } = renderHook( () => useViewStateUpdate() );

		await act( async () => {
			result.current.updateView( {
				perPage: defaultDataViewsState.perPage,
				search: defaultDataViewsState.search,
			} );
		} );

		expect( result.current.view ).toEqual( defaultDataViewsState );
	} );
} );
