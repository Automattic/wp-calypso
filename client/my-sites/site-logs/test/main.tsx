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
import { SiteLogs } from '../main';

// PageJS breaks the tests due to failing to read the document title.
// Mock it for now to avoid the error.
jest.mock( 'page' );

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

test( 'date is always rendered in the first column place', async () => {
	mockSuccessfulLogApis( [
		// API is returning date in the last column
		{ message_first: 'log entry', date: '2023-03-24T04:36:04.238Z' },
	] );

	const { container } = render( <SiteLogs />, { initialState: makeTestState() } );

	await waitFor( () =>
		expect( container.querySelector( 'th:first-child' ) ).toHaveTextContent( 'date' )
	);
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

test( 'switching pages requests data using correct scroll_id', async () => {
	// Mock first page (uses no scroll_id)
	nock( 'https://public-api.wordpress.com' )
		.post(
			/\/wpcom\/v2\/sites\/\d+\/hosting\/(error-)?logs/,
			( { scroll_id } ) => scroll_id === undefined
		)
		.reply( 200, {
			message: 'OK',
			data: {
				scroll_id: 'next_page',
				total_results: 2,
				logs: [ { message: 'log entry' } ],
			},
		} );
	// Mock second page (uses scroll_id from first page)
	nock( 'https://public-api.wordpress.com' )
		.post(
			/\/wpcom\/v2\/sites\/\d+\/hosting\/(error-)?logs/,
			( { scroll_id } ) => scroll_id === 'next_page'
		)
		.reply( 200, {
			message: 'OK',
			data: {
				scroll_id: null,
				total_results: 2,
				logs: [ { message: 'second entry' } ],
			},
		} );

	render( <SiteLogs pageSize={ 1 } />, { initialState: makeTestState() } );

	await waitFor( () => expect( screen.getByText( 'log entry' ) ).toBeInTheDocument() );

	await userEvent.click( screen.getByRole( 'button', { name: 'Next' } ) );

	await waitFor( () => expect( screen.getByText( 'second entry' ) ).toBeInTheDocument() );
	expect( screen.queryByText( 'log entry' ) ).not.toBeInTheDocument();

	await userEvent.click( screen.getByRole( 'button', { name: 'Previous' } ) );

	await waitFor( () => expect( screen.getByText( 'log entry' ) ).toBeInTheDocument() );
	expect( screen.queryByText( 'second entry' ) ).not.toBeInTheDocument();
} );

test( 'advance three pages', async () => {
	// Mock first page (uses no scroll_id)
	nock( 'https://public-api.wordpress.com' )
		.post(
			/\/wpcom\/v2\/sites\/\d+\/hosting\/(error-)?logs/,
			( { scroll_id } ) => scroll_id === undefined
		)
		.reply( 200, {
			message: 'OK',
			data: {
				scroll_id: 'page2',
				total_results: 100,
				logs: [ { message: 'page 1 entry' } ],
			},
		} );
	// Mock second page (uses scroll_id from first page)
	nock( 'https://public-api.wordpress.com' )
		.post(
			/\/wpcom\/v2\/sites\/\d+\/hosting\/(error-)?logs/,
			( { scroll_id } ) => scroll_id === 'page2'
		)
		.reply( 200, {
			message: 'OK',
			data: {
				scroll_id: 'page3',
				total_results: 100,
				logs: [ { message: 'page 2 entry' } ],
			},
		} );
	// Mock third page (uses scroll_id from second page)
	nock( 'https://public-api.wordpress.com' )
		.post(
			/\/wpcom\/v2\/sites\/\d+\/hosting\/(error-)?logs/,
			( { scroll_id } ) => scroll_id === 'page3'
		)
		.reply( 200, {
			message: 'OK',
			data: {
				scroll_id: 'page4',
				total_results: 100,
				logs: [ { message: 'page 3 entry' } ],
			},
		} );

	render( <SiteLogs pageSize={ 1 } />, { initialState: makeTestState() } );

	await waitFor( () => expect( screen.getByText( 'page 1 entry' ) ).toBeInTheDocument() );

	await userEvent.click( screen.getByRole( 'button', { name: 'Next' } ) );

	await waitFor( () => expect( screen.getByText( 'page 2 entry' ) ).toBeInTheDocument() );

	await userEvent.click( screen.getByRole( 'button', { name: 'Next' } ) );

	await waitFor( () => expect( screen.getByText( 'page 3 entry' ) ).toBeInTheDocument() );
} );
