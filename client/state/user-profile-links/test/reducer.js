/** @format */

/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { items } from '../reducer';
import { USER_PROFILE_LINKS_RECEIVE } from 'state/action-types';

describe( 'reducer', () => {
	describe( 'items', () => {
		const profileLinks = [
			{
				link_slug: 'wordpress-org',
				title: 'WordPress.org',
				value: 'https://wordpress.org/',
			},
			{
				link_slug: 'wordpress-com',
				title: 'WordPress.com',
				value: 'https://wordpress.com/',
			},
		];

		test( 'should default to an empty array', () => {
			const state = items( undefined, {} );
			expect( state ).toEqual( [] );
		} );

		test( 'should add profile links to the initial state', () => {
			const state = items( null, {
				type: USER_PROFILE_LINKS_RECEIVE,
				profileLinks,
			} );

			expect( state ).toEqual( profileLinks );
		} );

		test( 'should overwrite profile links in state', () => {
			const newProfileLinks = [
				{
					link_slug: 'automattic-com',
					title: 'Automattic',
					value: 'https://automattic.com/',
				},
				{
					link_slug: 'gravatar-com',
					title: 'Gravatar',
					value: 'https://gravatar.com/',
				},
			];
			const state = deepFreeze( profileLinks );
			const newState = items( state, {
				type: USER_PROFILE_LINKS_RECEIVE,
				profileLinks: newProfileLinks,
			} );

			expect( newState ).toEqual( newProfileLinks );
		} );
	} );
} );
