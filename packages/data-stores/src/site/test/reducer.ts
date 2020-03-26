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
import { existingSite } from '../reducer';
import { createActions } from '../actions';
import { ExistingSiteDetails, ExistingSiteError } from '../types';

const { receiveExistingSite, receiveExistingSiteFailed } = createActions( {
	client_id: '',
	client_secret: '',
} );

describe( 'existingSite', () => {
	const existingSiteDetails: ExistingSiteDetails = {
		ID: 1,
		name: 'My test site',
		description: '',
		URL: 'http://mytestsite12345.wordpress.com',
	};

	const existingSiteError: ExistingSiteError = {
		error: 'unknown_blog',
		message: 'Unknown blog',
	};

	it( 'returns the correct default state', () => {
		const state = existingSite( undefined, { type: 'TEST_ACTION' } );
		expect( state ).toEqual( {} );
	} );

	it( 'returns site data keyed by slug', () => {
		const state = existingSite(
			undefined,
			receiveExistingSite( 'mytestsite12345.wordpress.com', existingSiteDetails )
		);
		expect( state ).toEqual( {
			'mytestsite12345.wordpress.com': existingSiteDetails,
		} );
	} );

	it( 'clears existing data keyed by slug, and no other data is affected', () => {
		const originalState = {
			'mytestsite12345.wordpress.com': existingSiteDetails,
			'myothertestsite12345.wordpress.com': existingSiteDetails,
		};
		const updatedState = existingSite(
			originalState,
			receiveExistingSiteFailed( 'myothertestsite12345.wordpress.com', existingSiteError )
		);

		expect( updatedState ).toEqual( {
			'mytestsite12345.wordpress.com': existingSiteDetails,
		} );
	} );
} );
