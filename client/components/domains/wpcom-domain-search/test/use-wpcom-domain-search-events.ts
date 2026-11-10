/**
 * @jest-environment jsdom
 */

import { getNewRailcarId, recordTracksEvent } from '@automattic/calypso-analytics';
import { act } from '@testing-library/react';
import { createElement, useEffect } from 'react';
import { renderHookWithProvider, renderWithProvider } from 'calypso/test-helpers/testing-library';
import { recordSearchFormSubmit, recordSearchFormView } from '../analytics';
import { useWPCOMDomainSearchEvents } from '../use-wpcom-domain-search-events';

jest.mock( '@automattic/calypso-analytics', () => ( {
	...jest.requireActual( '@automattic/calypso-analytics' ),
	getNewRailcarId: jest.fn().mockReturnValue( 'railcar-id' ),
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( '../analytics', () => ( {
	...jest.requireActual( '../analytics' ),
	recordSearchFormSubmit: jest.fn().mockReturnValue( {
		type: 'test',
	} ),
} ) );

const mockGetNewRailcarId = getNewRailcarId as jest.MockedFunction< typeof getNewRailcarId >;

const railcarIdGenerator = () => {
	let i = 0;

	return () => {
		return `railcar-id-${ i++ }`;
	};
};

const defaultProps = {
	flowName: 'flow-name',
	flowAllowsMultipleDomainsInCart: false,
	analyticsSection: 'analytics-section',
	vendor: 'vendor',
};

describe( 'useWPCOMDomainSearchEvents', () => {
	describe( 'calypso_domain_search', () => {
		const START = new Date( '2026-09-22T10:00:00Z' ).getTime();

		beforeEach( () => {
			jest.useFakeTimers();
			jest.setSystemTime( START );
			jest.mocked( recordSearchFormSubmit ).mockClear();
		} );

		afterEach( () => {
			jest.useRealTimers();
		} );

		const renderEvents = ( props = defaultProps ) =>
			renderHookWithProvider(
				( hookProps: typeof defaultProps ) => useWPCOMDomainSearchEvents( hookProps ),
				{
					initialProps: props,
				}
			);

		it( 'sends the search with its trigger and start time 10 seconds after it starts', () => {
			const { result } = renderEvents();

			result.current.onSearchStart( 'coffee', 'prefilled' );

			jest.advanceTimersByTime( 9_999 );
			expect( recordSearchFormSubmit ).not.toHaveBeenCalled();

			jest.advanceTimersByTime( 1 );
			expect( recordSearchFormSubmit ).toHaveBeenCalledTimes( 1 );
			expect( recordSearchFormSubmit ).toHaveBeenCalledWith(
				'coffee',
				'analytics-section',
				0,
				1,
				'vendor',
				'flow-name',
				'prefilled',
				START
			);
		} );

		it( 'only sends the last search of a burst', () => {
			const { result } = renderEvents();

			result.current.onSearchStart( 'coffee', 'prefilled' );
			jest.advanceTimersByTime( 5_000 );
			result.current.onSearchStart( 'tea', 'submit' );
			jest.advanceTimersByTime( 10_000 );

			expect( recordSearchFormSubmit ).toHaveBeenCalledTimes( 1 );
			expect( recordSearchFormSubmit ).toHaveBeenCalledWith(
				'tea',
				'analytics-section',
				0,
				1,
				'vendor',
				'flow-name',
				'submit',
				START + 5_000
			);
		} );

		it( 'sends a pending search immediately when unmounted', () => {
			const { result, unmount } = renderEvents();

			result.current.onSearchStart( 'coffee', 'submit' );
			jest.advanceTimersByTime( 3_000 );
			unmount();

			expect( recordSearchFormSubmit ).toHaveBeenCalledTimes( 1 );
			expect( recordSearchFormSubmit ).toHaveBeenCalledWith(
				'coffee',
				'analytics-section',
				0,
				1,
				'vendor',
				'flow-name',
				'submit',
				START
			);
		} );

		it( 'sends a pending search immediately when the page is hidden, and only once', () => {
			const { result, unmount } = renderEvents();

			result.current.onSearchStart( 'coffee', 'cached' );
			jest.advanceTimersByTime( 3_000 );

			act( () => {
				window.dispatchEvent( new Event( 'pagehide' ) );
			} );

			expect( recordSearchFormSubmit ).toHaveBeenCalledTimes( 1 );
			expect( recordSearchFormSubmit ).toHaveBeenCalledWith(
				'coffee',
				'analytics-section',
				0,
				1,
				'vendor',
				'flow-name',
				'cached',
				START
			);

			unmount();
			jest.advanceTimersByTime( 10_000 );

			expect( recordSearchFormSubmit ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'sends nothing on unmount when no search is pending', () => {
			const { unmount } = renderEvents();

			unmount();

			expect( recordSearchFormSubmit ).not.toHaveBeenCalled();
		} );

		it( 'counts searches and measures the time between their start times', () => {
			const { result } = renderEvents();

			result.current.onSearchStart( 'coffee', 'submit' );
			jest.advanceTimersByTime( 15_000 );
			result.current.onSearchStart( 'tea', 'submit' );
			jest.advanceTimersByTime( 25_000 );
			result.current.onSearchStart( 'coffee', 'submit' );
			jest.advanceTimersByTime( 10_000 );

			expect( jest.mocked( recordSearchFormSubmit ).mock.calls ).toEqual( [
				[ 'coffee', 'analytics-section', 0, 1, 'vendor', 'flow-name', 'submit', START ],
				[ 'tea', 'analytics-section', 15, 2, 'vendor', 'flow-name', 'submit', START + 15_000 ],
				[ 'coffee', 'analytics-section', 25, 3, 'vendor', 'flow-name', 'submit', START + 40_000 ],
			] );
		} );

		it( 'does not send a search for query or filter changes alone', () => {
			const { result } = renderEvents();

			result.current.onQueryChange( 'coffee' );
			result.current.onFilterApplied( { tlds: [ 'com' ], exactSldMatchesOnly: false } );
			result.current.onFilterReset( { tlds: [], exactSldMatchesOnly: false }, [ 'tlds' ] );
			jest.advanceTimersByTime( 10_000 );

			expect( recordSearchFormSubmit ).not.toHaveBeenCalled();
		} );

		it( 'keeps the pending search when the props change before it is sent', () => {
			const { result, rerender } = renderEvents();

			result.current.onSearchStart( 'coffee', 'submit' );
			rerender( { ...defaultProps, flowName: 'other-flow' } );
			jest.advanceTimersByTime( 10_000 );

			expect( recordSearchFormSubmit ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'sends a search started by a child during its mount effect', () => {
			const Child = ( { events }: { events: ReturnType< typeof useWPCOMDomainSearchEvents > } ) => {
				useEffect( () => {
					events.onSearchStart?.( 'coffee', 'prefilled' );
				}, [ events ] );

				return null;
			};

			const Parent = () =>
				createElement( Child, { events: useWPCOMDomainSearchEvents( defaultProps ) } );

			renderWithProvider( createElement( Parent ) );
			jest.advanceTimersByTime( 10_000 );

			expect( recordSearchFormSubmit ).toHaveBeenCalledTimes( 1 );
			expect( recordSearchFormSubmit ).toHaveBeenCalledWith(
				'coffee',
				'analytics-section',
				0,
				1,
				'vendor',
				'flow-name',
				'prefilled',
				START
			);
		} );
	} );

	it( 'registers a new railcar id when the query changes', () => {
		mockGetNewRailcarId.mockImplementation( railcarIdGenerator() );
		const { result } = renderHookWithProvider( () => useWPCOMDomainSearchEvents( defaultProps ) );

		// Initial suggestion interaction
		result.current.onSuggestionInteract( {
			domain_name: 'my-domain.com',
			position: 0,
			vendor: 'wpcom',
		} );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_traintracks_interact',
			expect.objectContaining( {
				railcar: 'railcar-id-0-0',
			} )
		);

		// Repeat interaction without changing the query
		result.current.onSuggestionInteract( {
			domain_name: 'my-domain.com',
			position: 0,
			vendor: 'wpcom',
		} );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_traintracks_interact',
			expect.objectContaining( {
				railcar: 'railcar-id-0-0',
			} )
		);

		// Change query and interact with a new suggestion
		result.current.onQueryChange( 'my-domain.com' );

		// Interact with a new suggestion
		result.current.onSuggestionInteract( {
			domain_name: 'my-domain.com',
			position: 0,
			vendor: 'wpcom',
		} );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_traintracks_interact',
			expect.objectContaining( {
				railcar: 'railcar-id-1-0',
			} )
		);
	} );

	describe( 'Name Pulse', () => {
		const createStore = () => {
			const store = {
				getState: () => ( { currentUser: { id: null } } ),
				subscribe: () => () => {},
				dispatch: jest.fn(),
			};

			return store;
		};

		const getDispatchedTracksProperties = ( store: ReturnType< typeof createStore > ) =>
			store.dispatch.mock.calls.flatMap( ( [ action ] ) =>
				( action.meta?.analytics ?? [] )
					.filter(
						( entry: { payload: { service: string } } ) => entry.payload.service === 'tracks'
					)
					.map( ( entry: { payload: { properties: object } } ) => entry.payload.properties )
			);

		const renderEvents = ( isNamePulse?: boolean ) => {
			const store = createStore();
			const { result } = renderHookWithProvider(
				() => useWPCOMDomainSearchEvents( { ...defaultProps, isNamePulse } ),
				{ store }
			);

			return { events: result.current, store };
		};

		const bundle = { bundle_group_id: 'group', domains: [ {}, {} ] };

		beforeEach( () => {
			jest.mocked( recordTracksEvent ).mockClear();
		} );

		it( 'marks every classic Tracks event as legacy_v1 when Name Pulse is off', () => {
			const { events, store } = renderEvents();

			events.onPageView();
			events.onShowMoreResults( 2 );
			events.onBundleShown( bundle, 'card' );

			expect( getDispatchedTracksProperties( store ) ).toEqual( [
				{ section: 'analytics-section', flow_name: 'flow-name', search_ui_version: 'legacy_v1' },
				{
					search_query: '',
					page_number: 2,
					section: 'analytics-section',
					flow_name: 'flow-name',
					search_ui_version: 'legacy_v1',
				},
			] );
			expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_domain_bundle_shown', {
				domain_bundle_group_id: 'group',
				domain_count: 2,
				placement: 'card',
				search_ui_version: 'legacy_v1',
			} );
		} );

		it( 'marks every Tracks event as Name Pulse, and adds the props it is given', () => {
			const { events, store } = renderEvents( true );

			events.onPageView();
			events.onShowMoreResults( 2, { result_group: 'exact' } );
			events.onBundleShown( bundle, 'card' );
			events.onNamePulseTracksEvent( 'view_cart_click', {} );

			const dispatched = getDispatchedTracksProperties( store );
			expect( dispatched ).toHaveLength( 2 );
			dispatched.forEach( ( properties ) =>
				expect( properties ).toHaveProperty( 'search_ui_version', 'i4_v1' )
			);
			expect( dispatched[ 1 ] ).toHaveProperty( 'result_group', 'exact' );
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_domain_bundle_shown',
				expect.objectContaining( { search_ui_version: 'i4_v1' } )
			);
			expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_domain_search_view_cart_click', {
				section: 'analytics-section',
				flow_name: 'flow-name',
				search_ui_version: 'i4_v1',
			} );
		} );

		it.each( [ false, true ] )(
			'leaves the Google Analytics entries untouched (Name Pulse: %s)',
			( isNamePulse ) => {
				const { events, store } = renderEvents( isNamePulse );

				events.onPageView();

				const [ googleEntry ] = recordSearchFormView( 'analytics-section', 'flow-name' ).meta
					.analytics;
				expect( store.dispatch.mock.calls[ 0 ][ 0 ].meta.analytics[ 0 ] ).toEqual( googleEntry );
			}
		);

		it( 'uses the railcar Name Pulse gives for the render and the interaction', () => {
			const { events } = renderEvents( true );
			const suggestion = { domain_name: 'coffee.com', position: 4, vendor: 'name_pulse_exact' };

			events.onSuggestionRender( suggestion, undefined, { railcar: 'set-1-7' } );
			events.onSuggestionInteract( suggestion, 'set-1-7' );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_traintracks_render',
				expect.objectContaining( { railcar: 'set-1-7', ui_position: 4 } )
			);
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_traintracks_interact',
				expect.objectContaining( { railcar: 'set-1-7' } )
			);
		} );

		it( 'records a Name Pulse search right away and ignores the debounced one', () => {
			jest.useFakeTimers();
			jest
				.mocked( recordSearchFormSubmit )
				.mockImplementationOnce( jest.requireActual( '../analytics' ).recordSearchFormSubmit );
			const { events, store } = renderEvents( true );

			events.onSearchStart( 'coffee', 'input_changed' );
			events.onNamePulseSearch( 'coffee', 'input_changed', {
				search_id: 'search-1',
				query_shape: 'single',
			} );
			jest.advanceTimersByTime( 10_000 );
			jest.useRealTimers();

			expect( getDispatchedTracksProperties( store ) ).toEqual( [
				expect.objectContaining( {
					search_box_value: 'coffee',
					search_count: 1,
					trigger: 'input_changed',
					search_id: 'search-1',
					query_shape: 'single',
				} ),
			] );
		} );
	} );
} );
