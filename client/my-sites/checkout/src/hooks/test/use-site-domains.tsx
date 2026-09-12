/**
 * @jest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import wpcom from 'calypso/lib/wp';
import { SITE_DOMAINS_RECEIVE } from 'calypso/state/action-types';
import { createSiteDomainObject } from 'calypso/state/sites/domains/assembler';
import domainsReducer from 'calypso/state/sites/domains/reducer';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import useSiteDomains from '../use-site-domains';
import type { ReactNode } from 'react';

jest.mock( 'calypso/lib/wp', () => ( { req: { get: jest.fn() } } ) );

const domainsReceiveAction = ( siteId: number, domains: { domain: string }[] ) => ( {
	type: SITE_DOMAINS_RECEIVE,
	siteId,
	domains: domains.map( createSiteDomainObject ),
} );

function setup() {
	const store = createStore(
		combineReducers( { sites: combineReducers( { domains: domainsReducer } ) } ),
		applyMiddleware( thunk )
	);
	const wrapper = ( { children }: { children: ReactNode } ) => (
		<Provider store={ store }>{ children }</Provider>
	);
	return { store, wrapper };
}

beforeEach( () => {
	jest.mocked( wpcom.req.get ).mockReset();
	jest.mocked( wpcom.req.get ).mockImplementation( () => new Promise( () => {} ) );
} );

test( 'shares an in-flight domain request between checkout consumers', async () => {
	const { wrapper } = setup();
	let resolveRequest: ( value: { domains: [] } ) => void = () => {};
	jest.mocked( wpcom.req.get ).mockImplementation(
		() =>
			new Promise( ( resolve ) => {
				resolveRequest = resolve;
			} )
	);
	const { result } = renderHook( () => [ useSiteDomains( 1 ), useSiteDomains( 1 ) ], { wrapper } );
	expect( wpcom.req.get ).toHaveBeenCalledTimes( 1 );
	await act( async () => resolveRequest( { domains: [] } ) );
	expect( result.current ).toEqual( [ [], [] ] );
} );

test( 'does not retain another site domains when the current site is empty or absent', () => {
	const { store, wrapper } = setup();
	store.dispatch( domainsReceiveAction( 1, [ { domain: 'first.example' } ] ) );
	store.dispatch( domainsReceiveAction( 2, [] ) );
	const { result, rerender } = renderHook( ( { siteId } ) => useSiteDomains( siteId ), {
		wrapper,
		initialProps: { siteId: 1 as number | undefined },
	} );
	expect( result.current ).toBe( getDomainsBySiteId( store.getState(), 1 ) );
	rerender( { siteId: 2 } );
	expect( result.current ).toEqual( [] );
	rerender( { siteId: undefined } );
	expect( result.current ).toEqual( [] );
	expect( wpcom.req.get ).not.toHaveBeenCalled();
} );

test( 'clears a domain list when the last domain is removed', () => {
	const { store, wrapper } = setup();
	store.dispatch( domainsReceiveAction( 1, [ { domain: 'first.example' } ] ) );
	const { result } = renderHook( () => useSiteDomains( 1 ), { wrapper } );
	act( () => {
		store.dispatch( domainsReceiveAction( 1, [] ) );
	} );
	expect( result.current ).toEqual( [] );
} );

test( 'returns an empty list while a different site loads', () => {
	const { store, wrapper } = setup();
	store.dispatch( domainsReceiveAction( 1, [ { domain: 'first.example' } ] ) );
	const { result, rerender } = renderHook( ( { siteId } ) => useSiteDomains( siteId ), {
		wrapper,
		initialProps: { siteId: 1 },
	} );
	rerender( { siteId: 2 } );
	expect( result.current ).toEqual( [] );
	expect( wpcom.req.get ).toHaveBeenCalledWith( '/sites/2/domains', { apiVersion: '1.2' } );
} );

test( 'does not loop on failure and allows a new checkout mount to retry', async () => {
	const { wrapper } = setup();
	jest.mocked( wpcom.req.get ).mockRejectedValueOnce( new Error( 'Network error' ) );
	const { result, unmount } = renderHook( () => useSiteDomains( 1 ), { wrapper } );
	await act( async () => {} );
	expect( result.current ).toEqual( [] );
	expect( wpcom.req.get ).toHaveBeenCalledTimes( 1 );
	unmount();
	jest
		.mocked( wpcom.req.get )
		.mockResolvedValueOnce( { domains: [ { domain: 'first.example' } ] } );
	const retried = renderHook( () => useSiteDomains( 1 ), { wrapper } );
	await waitFor( () => expect( retried.result.current ).toHaveLength( 1 ) );
	expect( wpcom.req.get ).toHaveBeenCalledTimes( 2 );
} );
