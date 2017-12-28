/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { receiveDomainsSuggestions, requestDomainsSuggestions } from '../actions';
import {
	DOMAINS_SUGGESTIONS_RECEIVE,
	DOMAINS_SUGGESTIONS_REQUEST,
	DOMAINS_SUGGESTIONS_REQUEST_FAILURE,
	DOMAINS_SUGGESTIONS_REQUEST_SUCCESS,
} from 'client/state/action-types';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'actions', () => {
	let sandbox, spy;

	useSandbox( newSandbox => {
		sandbox = newSandbox;
		spy = sandbox.spy();
	} );

	const exampleQuery = {
		query: 'example',
		quantity: 2,
		vendor: 'domainsbot',
		include_wordpressdotcom: false,
	};

	const failingQuery = {
		query: 'example',
		quantity: 10,
		vendor: 'domainsbot',
		include_wordpressdotcom: true,
	};

	const exampleSuggestions = [
		{ domain_name: 'example.me', cost: '$25.00', product_id: 46, product_slug: 'dotme_domain' },
		{ domain_name: 'example.org', cost: '$18.00', product_id: 6, product_slug: 'domain_reg' },
	];

	describe( '#receiveDomainsSuggestions()', () => {
		test( 'should return an action object', () => {
			const suggestions = exampleSuggestions;
			const queryObject = exampleQuery;
			const action = receiveDomainsSuggestions( suggestions, queryObject );
			expect( action ).to.eql( {
				type: DOMAINS_SUGGESTIONS_RECEIVE,
				suggestions,
				queryObject,
			} );
		} );
	} );

	describe( '#requestDomainsSuggestions()', () => {
		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/domains/suggestions' )
				.query( exampleQuery )
				.reply( 200, exampleSuggestions )
				.get( '/rest/v1.1/domains/suggestions' )
				.query( failingQuery )
				.reply( 403, {
					error: 'authorization_required',
					message: 'An active access token must be used to access domains suggestions.',
				} );
		} );

		test( 'should dispatch fetch action when thunk triggered', () => {
			requestDomainsSuggestions( exampleQuery )( spy );
			expect( spy ).to.have.been.calledWithMatch( {
				type: DOMAINS_SUGGESTIONS_REQUEST,
				queryObject: exampleQuery,
			} );
		} );

		test( 'should dispatch receive action when request completes', () => {
			return requestDomainsSuggestions( exampleQuery )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: DOMAINS_SUGGESTIONS_RECEIVE,
					queryObject: exampleQuery,
					suggestions: exampleSuggestions,
				} );
			} );
		} );

		test( 'should dispatch success action when request completes', () => {
			return requestDomainsSuggestions( exampleQuery )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: DOMAINS_SUGGESTIONS_REQUEST_SUCCESS,
					queryObject: exampleQuery,
				} );
			} );
		} );

		test( 'should dispatch fail action when request fails', () => {
			return requestDomainsSuggestions( failingQuery )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: DOMAINS_SUGGESTIONS_REQUEST_FAILURE,
					queryObject: failingQuery,
					error: sandbox.match( {
						message: 'An active access token must be used to access domains suggestions.',
					} ),
				} );
			} );
		} );
	} );
} );
