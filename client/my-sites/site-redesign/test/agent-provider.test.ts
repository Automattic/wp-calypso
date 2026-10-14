/** @jest-environment jsdom */
import { connectRedesignHost, createRedesignProvider } from '../agent-provider';
import type { Redesign } from '../api';

const run = { id: 'rd_1', site_id: 1, status: 'interview' } as Redesign;

test( 'leaves all interview abilities on the server and provides the owned run context', () => {
	const disconnect = connectRedesignHost( { run } );
	const provider = createRedesignProvider( () => 1 );
	expect( provider ).not.toHaveProperty( 'toolProvider' );
	expect( provider.capabilities.themeIndependentSuggestions ).toBe( true );
	expect( provider.contextProvider.getClientContext() ).toMatchObject( {
		environment: 'site-redesign',
		site_redesign: { redesign_id: 'rd_1', site_id: 1, status: 'interview' },
	} );
	disconnect();
	expect( provider.contextProvider.getClientContext().site_redesign ).toBeNull();
} );

test( 'rejects old provider context after a site or run switch and ignores old cleanup', () => {
	let siteId = 1;
	const disconnectOld = connectRedesignHost( { run } );
	const oldProvider = createRedesignProvider( () => siteId );
	siteId = 2;
	const disconnectNew = connectRedesignHost( { run: { ...run, id: 'rd_2', site_id: 2 } } );
	disconnectOld();
	expect( oldProvider.contextProvider.getClientContext().site_redesign ).toBeNull();
	const newProvider = createRedesignProvider( () => siteId );
	expect( newProvider.contextProvider.getClientContext().site_redesign?.redesign_id ).toBe(
		'rd_2'
	);
	const disconnectReplaced = connectRedesignHost( { run: { ...run, id: 'rd_3', site_id: 2 } } );
	expect( newProvider.contextProvider.getClientContext().site_redesign ).toBeNull();
	disconnectNew();
	disconnectReplaced();
} );

test( 'never retargets an existing provider to a fresh run; only a new provider gets it', () => {
	const disconnectOld = connectRedesignHost( { run } );
	const oldProvider = createRedesignProvider( () => 1 );
	disconnectOld();
	const disconnectFresh = connectRedesignHost( { run: { ...run, id: 'rd_2' } } );
	const freshProvider = createRedesignProvider( () => 1 );
	expect( oldProvider.contextProvider.getClientContext().site_redesign ).toBeNull();
	expect( freshProvider.contextProvider.getClientContext().site_redesign?.redesign_id ).toBe(
		'rd_2'
	);
	disconnectFresh();
} );

test( 'a provider created while no run is offered stays without context', () => {
	const provider = createRedesignProvider( () => 1 );
	const disconnect = connectRedesignHost( { run: { ...run, id: 'rd_2' } } );
	expect( provider.contextProvider.getClientContext().site_redesign ).toBeNull();
	disconnect();
} );

test( 'guides a paid checkout return to the existing design instead of a new interview', () => {
	const disconnectPaid = connectRedesignHost( { run, applyOnly: true } );
	const provider = createRedesignProvider( () => 1 );
	expect( provider.getEmptyViewSuggestions() ).toEqual( [
		expect.objectContaining( { id: 'site-redesign-review', label: 'Review my design' } ),
	] );
	disconnectPaid();
	const disconnectFree = connectRedesignHost( { run } );
	expect( provider.getEmptyViewSuggestions() ).toEqual( [
		expect.objectContaining( { id: 'site-redesign-interview', label: 'Start designing' } ),
	] );
	disconnectFree();
} );
