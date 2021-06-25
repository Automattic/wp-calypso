/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	SUPPORT_ARTICLE_ALTERNATES_RECEIVE,
	SUPPORT_ARTICLE_ALTERNATES_REQUEST,
	SUPPORT_ARTICLE_ALTERNATES_REQUEST_SUCCESS,
	SUPPORT_ARTICLE_ALTERNATES_REQUEST_FAILURE,
} from 'calypso/state/action-types';

import supportArticlesAlternates from '../reducer';

describe( 'reducer', () => {
	test( 'should add article alternates to items', () => {
		const state = supportArticlesAlternates( deepFreeze( {} ), {
			type: SUPPORT_ARTICLE_ALTERNATES_RECEIVE,
			postKey: 'post-key',
			payload: {},
		} );

		expect( state.items ).toEqual( {
			'post-key': {},
		} );
	} );

	test( 'should add request for article alternates', () => {
		const state = supportArticlesAlternates( deepFreeze( {} ), {
			type: SUPPORT_ARTICLE_ALTERNATES_REQUEST,
			postKey: 'post-key',
		} );

		expect( state.requests ).toEqual( {
			'post-key': {},
		} );
	} );

	test( 'should flag article alternates request as completed', () => {
		const state = supportArticlesAlternates( deepFreeze( {} ), {
			type: SUPPORT_ARTICLE_ALTERNATES_REQUEST_SUCCESS,
			postKey: 'post-key',
		} );

		expect( state.requests ).toEqual( {
			'post-key': { completed: true },
		} );
	} );

	test( 'should flag article alternates request as failed', () => {
		const state = supportArticlesAlternates( deepFreeze( {} ), {
			type: SUPPORT_ARTICLE_ALTERNATES_REQUEST_FAILURE,
			postKey: 'post-key',
		} );

		expect( state.requests ).toEqual( {
			'post-key': { failed: true },
		} );
	} );
} );
