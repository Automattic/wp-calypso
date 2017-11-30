/** @format */

/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import {
	JETPACK_ONBOARDING_SITE_DESCRIPTION_SET,
	JETPACK_ONBOARDING_SITE_TITLE_SET,
} from 'state/action-types';

describe( 'reducer', () => {
	const defaultState = {
		siteTitle: 'Example Site',
		siteDescription: 'Example Description',
	};

	test( 'should default to an empty object', () => {
		const state = reducer( undefined, {} );
		expect( state ).toEqual( {} );
	} );

	test( 'should set site title in state', () => {
		const state = deepFreeze( {} );
		const siteTitle = 'My Awesome Site';
		const newState = reducer( state, {
			type: JETPACK_ONBOARDING_SITE_TITLE_SET,
			siteTitle,
		} );

		expect( newState ).toEqual( {
			siteTitle,
		} );
	} );

	test( 'should update site title in state', () => {
		const state = deepFreeze( defaultState );
		const siteTitle = 'My Awesome Site';
		const newState = reducer( state, {
			type: JETPACK_ONBOARDING_SITE_TITLE_SET,
			siteTitle,
		} );

		expect( newState ).toEqual( {
			...defaultState,
			siteTitle,
		} );
	} );

	test( 'should set site description in state', () => {
		const state = deepFreeze( {} );
		const siteDescription = 'Not just another WordPress site';
		const newState = reducer( state, {
			type: JETPACK_ONBOARDING_SITE_DESCRIPTION_SET,
			siteDescription,
		} );

		expect( newState ).toEqual( {
			siteDescription,
		} );
	} );

	test( 'should update site description in state', () => {
		const state = deepFreeze( defaultState );
		const siteDescription = 'Not just another WordPress site';
		const newState = reducer( state, {
			type: JETPACK_ONBOARDING_SITE_DESCRIPTION_SET,
			siteDescription,
		} );

		expect( newState ).toEqual( {
			...defaultState,
			siteDescription,
		} );
	} );
} );
