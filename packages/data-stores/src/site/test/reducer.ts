/*
 * These tests shouldn't require the jsdom environment,
 * but we're waiting for this PR to merge:
 * https://github.com/WordPress/gutenberg/pull/20486
 *
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import { sites } from '../reducer';
import { SiteDetails, SiteError } from '../types';

describe( 'Site', () => {
	const siteDetailsResponse: SiteDetails = {
		ID: 12345,
		name: 'My test site',
		description: '',
		URL: 'http://mytestsite12345.wordpress.com',
	};

	const siteErrorResponse: SiteError = {
		error: 'unknown_blog',
		message: 'Unknown blog',
	};

	it( 'returns the correct default state', () => {
		const state = sites( undefined, { type: 'TEST_ACTION' } );
		expect( state ).toEqual( {} );
	} );

	it( 'returns site data keyed by id', () => {
		const state = sites( undefined, {
			type: 'RECEIVE_SITE',
			siteId: 12345,
			response: siteDetailsResponse,
		} );
		expect( state ).toEqual( {
			12345: siteDetailsResponse,
		} );
	} );

	it( 'clears data keyed by id, and no other data is affected', () => {
		const originalState = {
			12345: siteDetailsResponse,
			23456: siteDetailsResponse,
		};
		const updatedState = sites( originalState, {
			type: 'RECEIVE_SITE_FAILED',
			siteId: 23456,
			response: siteErrorResponse,
		} );

		expect( updatedState ).toEqual( {
			12345: siteDetailsResponse,
		} );
	} );
} );
