/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import React from 'react';
import documentHead from 'calypso/state/document-head/reducer';
import siteSettings from 'calypso/state/site-settings/reducer';
import { reducer as ui } from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SiteLogsTable, formatColumnName } from '../../site-monitoring/components/site-logs-table';
import { SiteLogs } from '../main';

// PageJS breaks the tests due to failing to read the document title.
// Mock it for now to avoid the error.
jest.mock( 'page' );

// Mock matchMedia, used in Gutenberg components
Object.defineProperty( window, 'matchMedia', {
	value: jest.fn( () => {
		return {
			matches: true,
			addListener: jest.fn(),
			removeListener: jest.fn(),
		};
	} ),
} );

const render = ( el, options ) =>
	renderWithProvider( el, { ...options, reducers: { ui, documentHead, siteSettings } } );

const makeTestState = ( { siteId = 1, gmtOffset = 0 } = {} ) => ( {
	ui: { selectedSiteId: siteId },
	siteSettings: {
		items: {
			[ siteId ]: { gmt_offset: gmtOffset },
		},
	},
} );

const mockSuccessfulLogApis = (
	logs,
	{
		scroll_id = null,
		total_results = undefined,
	}: { scroll_id?: string | null; total_results?: number } = {}
) =>
	nock( 'https://public-api.wordpress.com' )
		.post( /\/wpcom\/v2\/sites\/\d+\/hosting\/(error-)?logs/ )
		.reply( 200, {
			message: 'OK',
			data: {
				scroll_id,
				total_results: total_results ?? logs.length,
				logs,
			},
		} );

test( 'displays the last 7 days worth of logs in descending order on mount', async () => {
	nock( 'https://public-api.wordpress.com' )
		// This particular test doesn't care whether we're requesting PHP or web logs
		.post( /\/wpcom\/v2\/sites\/113\/hosting\/(error-)?logs/, ( { start, end, sort_order } ) => {
			const sevenDays = 7 * 24 * 60 * 60;
			const fudgeFactor = 5; // Allow for a few seconds of drift
			const timeRange = end - start;
			return sort_order === 'desc' && Math.abs( timeRange - sevenDays ) < fudgeFactor;
		} )
		.reply( 200, {
			message: 'OK',
			data: {
				scroll_id: null,
				total_results: 1,
				logs: [ { message: 'log entry' } ],
			},
		} );

	render( <SiteLogs />, { initialState: makeTestState( { siteId: 113 } ) } );

	await waitFor( () => expect( screen.getByText( /log entry/ ) ).toBeInTheDocument() );
} );

test( 'the number of columns equals to the amount of headerTitles + 1', async () => {
	const apiData = [ { date: '2023-03-24T04:36:04.238Z', request_type: 'GET' } ];

	mockSuccessfulLogApis( apiData );

	const headerTitles = [ 'date', 'request_type' ];

	const { container } = render(
		<SiteLogsTable logs={ apiData } isLoading={ false } headerTitles={ headerTitles } />,
		{ initialState: makeTestState() }
	);

	const headerCells = container.querySelectorAll( 'thead th' );
	expect( headerCells.length ).toBe( headerTitles.length + 1 ); // Plus one for the empty last column with chevron

	headerTitles.forEach( ( title, index ) => {
		expect( headerCells[ index ] ).toHaveTextContent( formatColumnName( title ) );
	} );

	// Add assertion for the empty last column cell
	expect( headerCells[ headerTitles.length ] ).toHaveTextContent( '' );
} );

test( `date is rendered in site's timestamp`, async () => {
	mockSuccessfulLogApis( [
		// API is returning date in the last column
		{ date: '2023-03-24T04:36:04.238Z' },
	] );

	render( <SiteLogs />, {
		initialState: makeTestState( { gmtOffset: 3 } ),
	} );

	await waitFor( () =>
		expect( screen.getByText( 'Mar 24, 2023 @ 07:36:04.238 +03:00' ) ).toBeInTheDocument()
	);
} );

test( 'only show pagination controls when there are multiple page', async () => {
	mockSuccessfulLogApis( [ { message: 'log entry' }, { message: 'entry 2' } ], {
		scroll_id: 'next',
		total_results: 3,
	} );
	const state = makeTestState();

	const { rerender } = render( <SiteLogs pageSize={ 2 } />, { initialState: state } );

	await waitFor( () => expect( screen.getByText( 'log entry' ) ).toBeInTheDocument() );

	expect( screen.queryByRole( 'button', { name: /Next/ } ) ).toBeEnabled();
	expect( screen.queryByRole( 'button', { name: /Previous/ } ) ).toBeDisabled();
	expect( screen.queryByText( /Showing 1\u20132 of 3/ ) ).toBeInTheDocument();

	mockSuccessfulLogApis( [
		{ message: 'log entry' },
		{ message: 'entry 2' },
		{ message: 'entry 3' },
	] );

	rerender( <SiteLogs pageSize={ 3 } />, { initialState: state } );

	await waitFor( () => expect( screen.getByText( 'entry 3' ) ).toBeInTheDocument() );

	expect( screen.queryByRole( 'button', { name: /Next/ } ) ).not.toBeInTheDocument();
	expect( screen.queryByRole( 'button', { name: /Previous/ } ) ).not.toBeInTheDocument();
	expect( screen.queryByText( /Showing/ ) ).not.toBeInTheDocument();
} );

test( `switching pages forwards and backwards only fetches pages which haven't been loaded yet`, async () => {
	nock( 'https://public-api.wordpress.com' )
		.post(
			/\/wpcom\/v2\/sites\/\d+\/hosting\/(error-)?logs/,
			( { scroll_id } ) => scroll_id === undefined
		)
		.reply( 200, {
			message: 'OK',
			data: {
				scroll_id: 'next_page',
				total_results: 3,
				logs: [ { message: 'log entry' } ],
			},
		} );

	render( <SiteLogs pageSize={ 1 } />, { initialState: makeTestState() } );

	await waitFor( () => expect( screen.getByText( 'log entry' ) ).toBeInTheDocument() );

	nock( 'https://public-api.wordpress.com' )
		.post(
			/\/wpcom\/v2\/sites\/\d+\/hosting\/(error-)?logs/,
			( { scroll_id } ) => scroll_id === 'next_page'
		)
		.reply( 200, {
			message: 'OK',
			data: {
				scroll_id: 'next_page',
				total_results: 3,
				logs: [ { message: 'second entry' } ],
			},
		} );

	await userEvent.click( screen.getByRole( 'button', { name: 'Next' } ) );

	await waitFor( () => expect( screen.getByText( 'second entry' ) ).toBeInTheDocument() );
	expect( screen.queryByText( 'log entry' ) ).not.toBeInTheDocument();

	// No network call should happen for the next "Previous" and "Next" click
	nock.cleanAll();

	await userEvent.click( screen.getByRole( 'button', { name: 'Previous' } ) );

	await waitFor( () => expect( screen.getByText( 'log entry' ) ).toBeInTheDocument() );
	expect( screen.queryByText( 'second entry' ) ).not.toBeInTheDocument();

	await userEvent.click( screen.getByRole( 'button', { name: 'Next' } ) );

	await waitFor( () => expect( screen.getByText( 'second entry' ) ).toBeInTheDocument() );
	expect( screen.queryByText( 'log entry' ) ).not.toBeInTheDocument();

	// One more network request to load the 3rd page
	nock( 'https://public-api.wordpress.com' )
		.post(
			/\/wpcom\/v2\/sites\/\d+\/hosting\/(error-)?logs/,
			( { scroll_id } ) => scroll_id === 'next_page'
		)
		.reply( 200, {
			message: 'OK',
			data: {
				scroll_id: null,
				total_results: 3,
				logs: [ { message: 'third entry' } ],
			},
		} );

	await userEvent.click( screen.getByRole( 'button', { name: 'Next' } ) );

	await waitFor( () => expect( screen.getByText( 'third entry' ) ).toBeInTheDocument() );
	expect( screen.queryByText( 'log entry' ) ).not.toBeInTheDocument();
	expect( screen.queryByText( 'second entry' ) ).not.toBeInTheDocument();
} );

test( 'advance three pages', async () => {
	nock( 'https://public-api.wordpress.com' )
		.post(
			/\/wpcom\/v2\/sites\/\d+\/hosting\/(error-)?logs/,
			( { scroll_id } ) => scroll_id === undefined
		)
		.reply( 200, {
			message: 'OK',
			data: {
				scroll_id: 'next_scroll',
				total_results: 100,
				logs: [ { message: 'page 1 entry' } ],
			},
		} );

	render( <SiteLogs pageSize={ 1 } />, { initialState: makeTestState() } );

	await waitFor( () => expect( screen.getByText( 'page 1 entry' ) ).toBeInTheDocument() );

	nock( 'https://public-api.wordpress.com' )
		.post(
			/\/wpcom\/v2\/sites\/\d+\/hosting\/(error-)?logs/,
			( { scroll_id } ) => scroll_id === 'next_scroll'
		)
		.reply( 200, {
			message: 'OK',
			data: {
				scroll_id: 'next_scroll',
				total_results: 100,
				logs: [ { message: 'page 2 entry' } ],
			},
		} );

	await userEvent.click( screen.getByRole( 'button', { name: 'Next' } ) );

	await waitFor( () => expect( screen.getByText( 'page 2 entry' ) ).toBeInTheDocument() );

	nock( 'https://public-api.wordpress.com' )
		.post(
			/\/wpcom\/v2\/sites\/\d+\/hosting\/(error-)?logs/,
			( { scroll_id } ) => scroll_id === 'next_scroll'
		)
		.reply( 200, {
			message: 'OK',
			data: {
				scroll_id: 'next_scroll',
				total_results: 100,
				logs: [ { message: 'page 3 entry' } ],
			},
		} );

	await userEvent.click( screen.getByRole( 'button', { name: 'Next' } ) );

	await waitFor( () => expect( screen.getByText( 'page 3 entry' ) ).toBeInTheDocument() );
} );
