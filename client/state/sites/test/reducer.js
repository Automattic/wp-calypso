/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { useSandbox } from 'test/helpers/use-sinon';
import {
	MEDIA_DELETE,
	SITE_FRONT_PAGE_SET_SUCCESS,
	SITE_DELETE_RECEIVE,
	JETPACK_DISCONNECT_RECEIVE,
	SITE_RECEIVE,
	SITE_REQUEST,
	SITE_REQUEST_FAILURE,
	SITE_REQUEST_SUCCESS,
	SITES_RECEIVE,
	SITES_REQUEST,
	SITES_REQUEST_FAILURE,
	SITES_REQUEST_SUCCESS,
	SITES_UPDATE,
	SITE_SETTINGS_RECEIVE,
	SITE_SETTINGS_UPDATE,
	THEME_ACTIVATE_SUCCESS,
	WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import reducer, { items, requestingAll, requesting } from '../reducer';

describe( 'reducer', () => {
	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	it( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'connection',
			'domains',
			'requestingAll',
			'items',
			'mediaStorage',
			'plans',
			'guidedTransfer',
			'monitor',
			'vouchers',
			'updates',
			'requesting',
			'sharingButtons',
		] );
	} );

	describe( 'requestingAll()', () => {
		it( 'should default false', () => {
			const state = requestingAll( undefined, {} );

			expect( state ).to.be.false;
		} );

		it( 'should update fetching state on fetch', () => {
			const state = requestingAll( undefined, {
				type: SITES_REQUEST
			} );

			expect( state ).to.be.true;
		} );

		it( 'should update fetching state on success', () => {
			const state = requestingAll( true, {
				type: SITES_REQUEST_SUCCESS
			} );

			expect( state ).to.be.false;
		} );

		it( 'should update fetching state on failure', () => {
			const state = requestingAll( true, {
				type: SITES_REQUEST_FAILURE
			} );

			expect( state ).to.be.false;
		} );
	} );

	describe( '#items()', () => {
		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'can receive all sites', () => {
			const state = items( undefined, {
				type: SITES_RECEIVE,
				sites: [
					{ ID: 2916284, name: 'WordPress.com Example Blog' },
					{ ID: 77203074, name: 'Another test site' }
				]
			} );
			expect( state ).to.eql( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' },
				77203074: { ID: 77203074, name: 'Another test site' }
			} );
		} );

		it( 'overwrites sites when all sites are received', () => {
			const original = deepFreeze( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' },
				77203074: { ID: 77203074, name: 'Another test site' }
			} );
			const state = items( original, {
				type: SITES_RECEIVE,
				sites: [
					{ ID: 77203074, name: 'A Bowl of Pho' }
				]
			} );
			expect( state ).to.eql( {
				77203074: { ID: 77203074, name: 'A Bowl of Pho' }
			} );
		} );

		it( 'should not affect state to receive updates for untracked sites', () => {
			const original = deepFreeze( {} );
			const state = items( original, {
				type: SITES_UPDATE,
				sites: [
					{ ID: 2916284, name: 'WordPress.com Example Blog' }
				]
			} );

			expect( state ).to.equal( original );
		} );

		it( 'should update sites which are already tracked', () => {
			const original = deepFreeze( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' }
			} );
			const state = items( original, {
				type: SITES_UPDATE,
				sites: [
					{ ID: 2916284, name: 'WordPress.com Example Blog!' }
				]
			} );

			expect( state ).to.eql( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog!' }
			} );
		} );

		it( 'should return same state if received site matches existing', () => {
			const original = deepFreeze( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' }
			} );
			const state = items( original, {
				type: SITE_RECEIVE,
				sites: [
					{ ID: 2916284, name: 'WordPress.com Example Blog' }
				]
			} );

			expect( state ).to.equal( original );
		} );

		it( 'should index sites by ID', () => {
			const state = items( undefined, {
				type: SITE_RECEIVE,
				site: { ID: 2916284, name: 'WordPress.com Example Blog' }
			} );

			expect( state ).to.eql( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' }
			} );
		} );

		it( 'should accumulate sites', () => {
			const original = deepFreeze( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' }
			} );
			const state = items( original, {
				type: SITE_RECEIVE,
				site: { ID: 77203074, name: 'Just You Wait' }
			} );

			expect( state ).to.eql( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' },
				77203074: { ID: 77203074, name: 'Just You Wait' }
			} );
		} );

		it( 'should remove deleted sites', () => {
			const original = deepFreeze( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' },
				77203074: { ID: 77203074, name: 'Just You Wait' }
			} );

			const state = items( original, {
				type: SITE_DELETE_RECEIVE,
				site: { ID: 2916284, name: 'WordPress.com Example Blog' }
			} );

			expect( state ).to.eql( {
				77203074: { ID: 77203074, name: 'Just You Wait' }
			} );
		} );

		it( 'should remove Jetpack Disconnected sites', () => {
			const original = deepFreeze( {
				2916284: { ID: 2916284, name: 'Jetpack Example Blog' },
				77203074: { ID: 77203074, name: 'Just You Wait' }
			} );

			const state = items( original, {
				type: JETPACK_DISCONNECT_RECEIVE,
				siteId: 2916284,
				status: { }
			} );

			expect( state ).to.eql( {
				77203074: { ID: 77203074, name: 'Just You Wait' }
			} );
		} );

		it( 'should return the original state when deleting a site that is not present', () => {
			const original = deepFreeze( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' },
				77203074: { ID: 77203074, name: 'Just You Wait' }
			} );

			const state = items( original, {
				type: SITE_DELETE_RECEIVE,
				site: { ID: 1337, name: 'non-existent site' }
			} );

			expect( state ).to.eql( original );
		} );

		it( 'should override previous site of same ID', () => {
			const original = deepFreeze( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' }
			} );
			const state = items( original, {
				type: SITE_RECEIVE,
				site: { ID: 2916284, name: 'Just You Wait' }
			} );

			expect( state ).to.eql( {
				2916284: { ID: 2916284, name: 'Just You Wait' }
			} );
		} );

		it( 'should strip invalid keys on the received site object', () => {
			const state = items( undefined, {
				type: SITE_RECEIVE,
				site: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
					slug: 'example.wordpress.com',
					updateComputedAttributes() {}
				}
			} );

			expect( state ).to.eql( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' }
			} );
		} );

		it( 'should strip invalid keys on the received site objects', () => {
			const state = items( undefined, {
				type: SITES_RECEIVE,
				sites: [ {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
					slug: 'example.wordpress.com',
					updateComputedAttributes() {}
				} ]
			} );

			expect( state ).to.eql( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' }
			} );
		} );

		it( 'should update properties when wordads is activated', () => {
			const original = deepFreeze( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog', options: { foo: 'bar' } }
			} );
			const state = items( original, {
				type: WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
				siteId: 2916284
			} );

			expect( state ).to.eql( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog', options: { foo: 'bar', wordads: true } }
			} );
		} );

		it( 'should do nothing when site is not loaded and wordads is activated', () => {
			const original = deepFreeze( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' }
			} );
			const state = items( original, {
				type: WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
				siteId: 77203074
			} );

			expect( state ).to.eql( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' }
			} );
		} );

		it( 'should update the theme slug option when a theme is activated', () => {
			const original = deepFreeze( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
					options: {
						theme_slug: 'pub/twentythirteen'
					}
				}
			} );
			const state = items( original, {
				type: THEME_ACTIVATE_SUCCESS,
				siteId: 2916284,
				themeStylesheet: 'pub/twentysixteen'
			} );

			expect( state ).to.eql( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
					options: {
						theme_slug: 'pub/twentysixteen'
					}
				}
			} );
		} );

		it( 'should update properties when the front page is changed', () => {
			const original = deepFreeze( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog', options: { show_on_front: 'posts', page_on_front: 0 } }
			} );
			const state = items( original, {
				type: SITE_FRONT_PAGE_SET_SUCCESS,
				siteId: 2916284,
				updatedOptions: {
					show_on_front: 'page',
					page_on_front: 1,
				}
			} );

			expect( state ).to.eql( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog', options: { show_on_front: 'page', page_on_front: 1 } }
			} );
		} );

		it( 'should do nothing when site is not loaded and the front page is changed', () => {
			const original = deepFreeze( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog', options: { show_on_front: 'posts', page_on_front: 0 } }
			} );
			const state = items( original, {
				type: SITE_FRONT_PAGE_SET_SUCCESS,
				siteId: 77203074,
				updatedOptions: {
					show_on_front: 'page',
					page_on_front: 1,
				}
			} );

			expect( state ).to.eql( original );
		} );

		it( 'should return same state when site settings updated but not site icon', () => {
			const original = deepFreeze( {} );
			const state = items( original, {
				type: SITE_SETTINGS_UPDATE,
				siteId: 2916284,
				settings: {}
			} );

			expect( state ).to.equal( original );
		} );

		it( 'should return same state when site settings received with icon for untracked site', () => {
			const original = deepFreeze( {} );
			const state = items( original, {
				type: SITE_SETTINGS_RECEIVE,
				siteId: 2916284,
				settings: {
					site_icon: 42
				}
			} );

			expect( state ).to.equal( original );
		} );

		it( 'should return same state if received icon setting and matches current value', () => {
			const original = deepFreeze( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
					icon: {
						media_id: 42
					}
				}
			} );
			const state = items( original, {
				type: SITE_SETTINGS_RECEIVE,
				siteId: 2916284,
				settings: {
					site_icon: 42
				}
			} );

			expect( state ).to.equal( original );
		} );

		it( 'should return same state if received privacy setting and matches current value', () => {
			const original = deepFreeze( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
					is_private: true
				}
			} );
			const state = items( original, {
				type: SITE_SETTINGS_RECEIVE,
				siteId: 2916284,
				settings: {
					blog_public: -1
				}
			} );

			expect( state ).to.equal( original );
		} );

		it( 'should return same state if received null icon setting and already unset', () => {
			const original = deepFreeze( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog'
				}
			} );
			const state = items( original, {
				type: SITE_SETTINGS_RECEIVE,
				siteId: 2916284,
				settings: {
					site_icon: null
				}
			} );

			expect( state ).to.equal( original );
		} );

		it( 'should return site having blavatar with unset icon property if received null icon setting', () => {
			const original = deepFreeze( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
					icon: {
						img: 'https://secure.gravatar.com/blavatar/0d6c430459af115394a012d20b6711d6',
						ico: 'https://secure.gravatar.com/blavatar/0d6c430459af115394a012d20b6711d6'
					}
				}
			} );
			const state = items( original, {
				type: SITE_SETTINGS_RECEIVE,
				siteId: 2916284,
				settings: {
					site_icon: null
				}
			} );

			expect( state ).to.eql( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog'
				}
			} );
		} );

		it( 'should return site with unset icon property if received null icon setting', () => {
			const original = deepFreeze( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
					icon: {
						media_id: 42
					}
				}
			} );
			const state = items( original, {
				type: SITE_SETTINGS_RECEIVE,
				siteId: 2916284,
				settings: {
					site_icon: null
				}
			} );

			expect( state ).to.eql( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog'
				}
			} );
		} );

		it( 'should return site with icon property with media id if received different icon setting', () => {
			const original = deepFreeze( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog'
				}
			} );
			const state = items( original, {
				type: SITE_SETTINGS_RECEIVE,
				siteId: 2916284,
				settings: {
					site_icon: 42
				}
			} );

			expect( state ).to.eql( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
					icon: {
						media_id: 42
					}
				}
			} );
		} );

		it( 'should return site with false privacy setting if received blog_public of 1', () => {
			const original = deepFreeze( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
					is_private: true
				}
			} );
			const state = items( original, {
				type: SITE_SETTINGS_RECEIVE,
				siteId: 2916284,
				settings: {
					blog_public: 1
				}
			} );

			expect( state ).to.eql( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
					is_private: false
				}
			} );
		} );

		it( 'should update both privacy and icon if received both setting updates', () => {
			const original = deepFreeze( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog'
				}
			} );
			const state = items( original, {
				type: SITE_SETTINGS_RECEIVE,
				siteId: 2916284,
				settings: {
					blog_public: 1,
					site_icon: 42
				}
			} );

			expect( state ).to.eql( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
					is_private: false,
					icon: {
						media_id: 42
					}
				}
			} );
		} );

		it( 'should return same state if media deleted but not including site icon setting', () => {
			const original = deepFreeze( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
					icon: {
						media_id: 42
					}
				}
			} );
			const state = items( original, {
				type: MEDIA_DELETE,
				siteId: 2916284,
				mediaIds: [ 36 ]
			} );

			expect( state ).to.equal( original );
		} );

		it( 'should return site with unset icon property if media deleted includes icon setting', () => {
			const original = deepFreeze( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
					icon: {
						media_id: 42
					}
				}
			} );
			const state = items( original, {
				type: MEDIA_DELETE,
				siteId: 2916284,
				mediaIds: [ 42 ]
			} );

			expect( state ).to.eql( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog'
				}
			} );
		} );

		it( 'should persist state', () => {
			const original = deepFreeze( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog'
				}
			} );
			const state = items( original, { type: SERIALIZE } );

			expect( state ).to.eql( original );
		} );

		it( 'should load valid persisted state', () => {
			const original = deepFreeze( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog'
				}
			} );
			const state = items( original, { type: DESERIALIZE } );

			expect( state ).to.eql( original );
		} );

		it( 'should return initial state when state is invalid', () => {
			const original = deepFreeze( {
				2916284: { bad: true }
			} );
			const state = items( original, { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );
	} );

	describe( 'requesting()', () => {
		it( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should track site request started', () => {
			const state = requesting( undefined, {
				type: SITE_REQUEST,
				siteId: 2916284
			} );

			expect( state ).to.eql( {
				2916284: true
			} );
		} );

		it( 'should accumulate site requests started', () => {
			const original = deepFreeze( {
				2916284: true
			} );
			const state = requesting( original, {
				type: SITE_REQUEST,
				siteId: 77203074
			} );

			expect( state ).to.eql( {
				2916284: true,
				77203074: true
			} );
		} );

		it( 'should track site request succeeded', () => {
			const original = deepFreeze( {
				2916284: true,
				77203074: true
			} );
			const state = requesting( original, {
				type: SITE_REQUEST_SUCCESS,
				siteId: 2916284
			} );

			expect( state ).to.eql( {
				2916284: false,
				77203074: true
			} );
		} );

		it( 'should track site request failed', () => {
			const original = deepFreeze( {
				2916284: false,
				77203074: true
			} );
			const state = requesting( original, {
				type: SITE_REQUEST_FAILURE,
				siteId: 77203074
			} );

			expect( state ).to.eql( {
				2916284: false,
				77203074: false
			} );
		} );
	} );
} );
