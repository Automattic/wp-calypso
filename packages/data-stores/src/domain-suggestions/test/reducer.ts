/**
 * Internal dependencies
 */

import { domainSuggestions } from '../reducer';
import type { DomainSuggestionState, DomainSuggestion } from '../types';
import { DataStatus } from '../constants';

describe( 'domainSuggestions', () => {
	const initialTimeStamp = Date.now();
	const initialState: DomainSuggestionState = {
		state: DataStatus.Uninitialized,
		data: undefined,
		errorMessage: null,
		lastUpdated: initialTimeStamp,
		pendingSince: undefined,
	};

	it( 'goes into a state of pending when fetching results', () => {
		const now = Date.now();
		const state = domainSuggestions( initialState, {
			type: 'FETCH_DOMAIN_SUGGESTIONS',
			timeStamp: now,
		} );

		const expectedState: DomainSuggestionState = {
			state: DataStatus.Pending,
			data: undefined,
			errorMessage: null,
			lastUpdated: initialTimeStamp,
			pendingSince: now,
		};
		expect( state ).toEqual( expectedState );
	} );

	it( 'goes into a state of errored when fetching results have failed', () => {
		const now = Date.now();
		const errorMessage = 'An unexpected error has occured';
		const state = domainSuggestions( initialState, {
			type: 'RECEIVE_DOMAIN_SUGGESTIONS_ERROR',
			timeStamp: now,
			errorMessage,
		} );

		const expectedState: DomainSuggestionState = {
			state: DataStatus.Failure,
			data: undefined,
			errorMessage: errorMessage,
			lastUpdated: now,
			pendingSince: undefined,
		};
		expect( state ).toEqual( expectedState );
	} );

	it( 'goes into a state of success when fetching results have returned results', () => {
		const queryObject = {
			include_dotblogsubdomain: false,
			include_wordpressdotcom: true,
			locale: 'en',
			only_wordpressdotcom: false,
			quantity: 11,
			query: 'test site',
			vendor: 'variation4_front',
		};
		const suggestions: DomainSuggestion[] = [
			{
				domain_name: 'test.site',
				relevance: 1,
				supports_privacy: true,
				vendor: 'donuts',
				match_reasons: [ 'tld-common', 'tld-exact' ],
				product_id: 78,
				product_slug: 'dotsite_domain',
				cost: '$25.00',
			},
			{
				domain_name: 'hot-test-site.com',
				relevance: 1,
				supports_privacy: true,
				vendor: 'donuts',
				match_reasons: [ 'tld-common' ],
				product_id: 6,
				product_slug: 'domain_reg',
				cost: '$18.00',
			},
		];
		const now = Date.now();
		const state = domainSuggestions( initialState, {
			type: 'RECEIVE_DOMAIN_SUGGESTIONS_SUCCESS',
			queryObject,
			suggestions,
			timeStamp: now,
		} );

		const expectedState: DomainSuggestionState = {
			state: DataStatus.Success,
			data: { [ JSON.stringify( queryObject ) ]: suggestions },
			errorMessage: null,
			lastUpdated: now,
			pendingSince: undefined,
		};
		expect( state ).toEqual( expectedState );
		expect( state.data[ JSON.stringify( queryObject ) ].length ).toEqual( suggestions.length );
	} );
} );
