/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer, {
	items as unwrappedItems,
	requestingAll,
	requesting,
	deleting,
	hasAllSitesList,
} from '../reducer';
import {
	MEDIA_DELETE,
	SITE_DELETE,
	SITE_DELETE_FAILURE,
	SITE_DELETE_SUCCESS,
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
	SITE_SETTINGS_RECEIVE,
	SITE_SETTINGS_UPDATE,
	THEME_ACTIVATE_SUCCESS,
	WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
	SITE_PLUGIN_UPDATED,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';
import { withSchemaValidation } from 'state/utils';
import { useSandbox } from 'test/helpers/use-sinon';

const items = withSchemaValidation( unwrappedItems.schema, unwrappedItems );

describe( 'reducer', () => {
	useSandbox( sandbox => {
		sandbox.stub( console, 'warn' );
	} );

	test( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'connection',
			'deleting',
			'domains',
			'requestingAll',
			'items',
			'mediaStorage',
			'plans',
			'guidedTransfer',
			'monitor',
			'vouchers',
			'requesting',
			'sharingButtons',
			'blogStickers',
			'hasAllSitesList',
		] );
	} );

	describe( 'requestingAll()', () => {
		test( 'should default false', () => {
			const state = requestingAll( undefined, {} );

			expect( state ).to.be.false;
		} );

		test( 'should update fetching state on fetch', () => {
			const state = requestingAll( undefined, {
				type: SITES_REQUEST,
			} );

			expect( state ).to.be.true;
		} );

		test( 'should update fetching state on success', () => {
			const state = requestingAll( true, {
				type: SITES_REQUEST_SUCCESS,
			} );

			expect( state ).to.be.false;
		} );

		test( 'should update fetching state on failure', () => {
			const state = requestingAll( true, {
				type: SITES_REQUEST_FAILURE,
			} );

			expect( state ).to.be.false;
		} );
	} );

	describe( '#items()', () => {
		test( 'should default to null', () => {
			const state = items( undefined, {} );

			expect( state ).to.be.null;
		} );

		test( 'can receive all sites', () => {
			const state = items( undefined, {
				type: SITES_RECEIVE,
				sites: [
					{ ID: 2916284, name: 'WordPress.com Example Blog' },
					{ ID: 77203074, name: 'Another test site' },
				],
			} );
			expect( state ).to.eql( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' },
				77203074: { ID: 77203074, name: 'Another test site' },
			} );
		} );

		test( 'overwrites sites when all sites are received', () => {
			const original = deepFreeze( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' },
				77203074: { ID: 77203074, name: 'Another test site' },
			} );
			const state = items( original, {
				type: SITES_RECEIVE,
				sites: [ { ID: 77203074, name: 'A Bowl of Pho' } ],
			} );
			expect( state ).to.eql( {
				77203074: { ID: 77203074, name: 'A Bowl of Pho' },
			} );
		} );

		test( 'should return same state if received site matches existing', () => {
			const original = deepFreeze( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' },
			} );
			const state = items( original, {
				type: SITE_RECEIVE,
				sites: [ { ID: 2916284, name: 'WordPress.com Example Blog' } ],
			} );

			expect( state ).to.equal( original );
		} );

		test( 'should index sites by ID', () => {
			const state = items( undefined, {
				type: SITE_RECEIVE,
				site: { ID: 2916284, name: 'WordPress.com Example Blog' },
			} );

			expect( state ).to.eql( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' },
			} );
		} );

		test( 'should accumulate sites', () => {
			const original = deepFreeze( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' },
			} );
			const state = items( original, {
				type: SITE_RECEIVE,
				site: { ID: 77203074, name: 'Just You Wait' },
			} );

			expect( state ).to.eql( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' },
				77203074: { ID: 77203074, name: 'Just You Wait' },
			} );
		} );

		test( 'should remove deleted sites', () => {
			const original = deepFreeze( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' },
				77203074: { ID: 77203074, name: 'Just You Wait' },
			} );

			const state = items( original, {
				type: SITE_DELETE_RECEIVE,
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				77203074: { ID: 77203074, name: 'Just You Wait' },
			} );
		} );

		test( 'should remove Jetpack Disconnected sites', () => {
			const original = deepFreeze( {
				2916284: { ID: 2916284, name: 'Jetpack Example Blog' },
				77203074: { ID: 77203074, name: 'Just You Wait' },
			} );

			const state = items( original, {
				type: JETPACK_DISCONNECT_RECEIVE,
				siteId: 2916284,
				status: {},
			} );

			expect( state ).to.eql( {
				77203074: { ID: 77203074, name: 'Just You Wait' },
			} );
		} );

		test( 'should return the original state when deleting a site that is not present', () => {
			const original = deepFreeze( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' },
				77203074: { ID: 77203074, name: 'Just You Wait' },
			} );

			const state = items( original, {
				type: SITE_DELETE_RECEIVE,
				siteId: 1337,
			} );

			expect( state ).to.eql( original );
		} );

		test( 'should override previous site of same ID', () => {
			const original = deepFreeze( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' },
			} );
			const state = items( original, {
				type: SITE_RECEIVE,
				site: { ID: 2916284, name: 'Just You Wait' },
			} );

			expect( state ).to.eql( {
				2916284: { ID: 2916284, name: 'Just You Wait' },
			} );
		} );

		test( 'should strip invalid keys on the received site object', () => {
			const state = items( undefined, {
				type: SITE_RECEIVE,
				site: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
					slug: 'example.wordpress.com',
					updateComputedAttributes() {},
				},
			} );

			expect( state ).to.eql( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' },
			} );
		} );

		test( 'should strip invalid keys on the received site objects', () => {
			const state = items( undefined, {
				type: SITES_RECEIVE,
				sites: [
					{
						ID: 2916284,
						name: 'WordPress.com Example Blog',
						slug: 'example.wordpress.com',
						updateComputedAttributes() {},
					},
				],
			} );

			expect( state ).to.eql( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' },
			} );
		} );

		test( 'should update properties when wordads is activated', () => {
			const original = deepFreeze( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog', options: { foo: 'bar' } },
			} );
			const state = items( original, {
				type: WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
					options: { foo: 'bar', wordads: true },
				},
			} );
		} );

		test( 'should do nothing when site is not loaded and wordads is activated', () => {
			const original = deepFreeze( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' },
			} );
			const state = items( original, {
				type: WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
				siteId: 77203074,
			} );

			expect( state ).to.eql( {
				2916284: { ID: 2916284, name: 'WordPress.com Example Blog' },
			} );
		} );

		test( 'should update the theme slug option when a theme is activated', () => {
			const original = deepFreeze( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
					options: {
						theme_slug: 'pub/twentythirteen',
					},
				},
			} );
			const state = items( original, {
				type: THEME_ACTIVATE_SUCCESS,
				siteId: 2916284,
				themeStylesheet: 'pub/twentysixteen',
			} );

			expect( state ).to.eql( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
					options: {
						theme_slug: 'pub/twentysixteen',
					},
				},
			} );
		} );

		test( 'should return same state when site settings updated but not site icon', () => {
			const original = deepFreeze( {} );
			const state = items( original, {
				type: SITE_SETTINGS_UPDATE,
				siteId: 2916284,
				settings: {},
			} );

			expect( state ).to.equal( original );
		} );

		test( 'should return same state when site settings received with icon for untracked site', () => {
			const original = deepFreeze( {} );
			const state = items( original, {
				type: SITE_SETTINGS_RECEIVE,
				siteId: 2916284,
				settings: {
					site_icon: 42,
				},
			} );

			expect( state ).to.equal( original );
		} );

		test( 'should return same state if received icon setting and matches current value', () => {
			const original = deepFreeze( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
					icon: {
						media_id: 42,
					},
				},
			} );
			const state = items( original, {
				type: SITE_SETTINGS_RECEIVE,
				siteId: 2916284,
				settings: {
					site_icon: 42,
				},
			} );

			expect( state ).to.equal( original );
		} );

		test( 'should return same state if received privacy setting and matches current value', () => {
			const original = deepFreeze( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
					is_private: true,
				},
			} );
			const state = items( original, {
				type: SITE_SETTINGS_RECEIVE,
				siteId: 2916284,
				settings: {
					blog_public: -1,
				},
			} );

			expect( state ).to.equal( original );
		} );

		test( 'should return same state if received null icon setting and already unset', () => {
			const original = deepFreeze( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
				},
			} );
			const state = items( original, {
				type: SITE_SETTINGS_RECEIVE,
				siteId: 2916284,
				settings: {
					site_icon: null,
				},
			} );

			expect( state ).to.equal( original );
		} );

		test( 'should return site having blavatar with unset icon property if received null icon setting', () => {
			const original = deepFreeze( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
					icon: {
						img: 'https://secure.gravatar.com/blavatar/0d6c430459af115394a012d20b6711d6',
						ico: 'https://secure.gravatar.com/blavatar/0d6c430459af115394a012d20b6711d6',
					},
				},
			} );
			const state = items( original, {
				type: SITE_SETTINGS_RECEIVE,
				siteId: 2916284,
				settings: {
					site_icon: null,
				},
			} );

			expect( state ).to.eql( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
				},
			} );
		} );

		test( 'should return site with unset icon property if received null icon setting', () => {
			const original = deepFreeze( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
					icon: {
						media_id: 42,
					},
				},
			} );
			const state = items( original, {
				type: SITE_SETTINGS_RECEIVE,
				siteId: 2916284,
				settings: {
					site_icon: null,
				},
			} );

			expect( state ).to.eql( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
				},
			} );
		} );

		test( 'should return site with icon property with media id if received different icon setting', () => {
			const original = deepFreeze( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
				},
			} );
			const state = items( original, {
				type: SITE_SETTINGS_RECEIVE,
				siteId: 2916284,
				settings: {
					site_icon: 42,
				},
			} );

			expect( state ).to.eql( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
					icon: {
						media_id: 42,
					},
				},
			} );
		} );

		test( 'should return site with false privacy setting if received blog_public of 1', () => {
			const original = deepFreeze( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
					is_private: true,
				},
			} );
			const state = items( original, {
				type: SITE_SETTINGS_RECEIVE,
				siteId: 2916284,
				settings: {
					blog_public: 1,
				},
			} );

			expect( state ).to.eql( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
					is_private: false,
				},
			} );
		} );

		test( 'should update both privacy and icon if received both setting updates', () => {
			const original = deepFreeze( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
				},
			} );
			const state = items( original, {
				type: SITE_SETTINGS_RECEIVE,
				siteId: 2916284,
				settings: {
					blog_public: 1,
					site_icon: 42,
				},
			} );

			expect( state ).to.eql( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
					is_private: false,
					icon: {
						media_id: 42,
					},
				},
			} );
		} );

		test( 'should return same state if media deleted but not including site icon setting', () => {
			const original = deepFreeze( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
					icon: {
						media_id: 42,
					},
				},
			} );
			const state = items( original, {
				type: MEDIA_DELETE,
				siteId: 2916284,
				mediaIds: [ 36 ],
			} );

			expect( state ).to.equal( original );
		} );

		test( 'should return site with unset icon property if media deleted includes icon setting', () => {
			const original = deepFreeze( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
					icon: {
						media_id: 42,
					},
				},
			} );
			const state = items( original, {
				type: MEDIA_DELETE,
				siteId: 2916284,
				mediaIds: [ 42 ],
			} );

			expect( state ).to.eql( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
				},
			} );
		} );

		test( 'should persist state', () => {
			const original = deepFreeze( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
				},
			} );
			const state = items( original, { type: SERIALIZE } );

			expect( state ).to.eql( original );
		} );

		test( 'should load valid persisted state', () => {
			const original = deepFreeze( {
				2916284: {
					ID: 2916284,
					name: 'WordPress.com Example Blog',
				},
			} );
			const state = items( original, { type: DESERIALIZE } );

			expect( state ).to.eql( original );
		} );

		test( 'should return initial state when state is invalid', () => {
			const original = deepFreeze( {
				2916284: { bad: true },
			} );
			const state = items( original, { type: DESERIALIZE } );

			expect( state ).to.be.null;
		} );
	} );

	describe( 'requesting()', () => {
		test( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should track site request started', () => {
			const state = requesting( undefined, {
				type: SITE_REQUEST,
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: true,
			} );
		} );

		test( 'should accumulate site requests started', () => {
			const original = deepFreeze( {
				2916284: true,
			} );
			const state = requesting( original, {
				type: SITE_REQUEST,
				siteId: 77203074,
			} );

			expect( state ).to.eql( {
				2916284: true,
				77203074: true,
			} );
		} );

		test( 'should track site request succeeded', () => {
			const original = deepFreeze( {
				2916284: true,
				77203074: true,
			} );
			const state = requesting( original, {
				type: SITE_REQUEST_SUCCESS,
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: false,
				77203074: true,
			} );
		} );

		test( 'should track site request failed', () => {
			const original = deepFreeze( {
				2916284: false,
				77203074: true,
			} );
			const state = requesting( original, {
				type: SITE_REQUEST_FAILURE,
				siteId: 77203074,
			} );

			expect( state ).to.eql( {
				2916284: false,
				77203074: false,
			} );
		} );
	} );

	describe( 'deleting()', () => {
		test( 'should default to an empty object', () => {
			const state = deleting( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should track request for deleting a site started', () => {
			const state = deleting( undefined, {
				type: SITE_DELETE,
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: true,
			} );
		} );

		test( 'should accumulate requests for deleting a site started', () => {
			const original = deepFreeze( {
				2916284: true,
			} );
			const state = deleting( original, {
				type: SITE_DELETE,
				siteId: 77203074,
			} );

			expect( state ).to.eql( {
				2916284: true,
				77203074: true,
			} );
		} );

		test( 'should track request for deleting a site succeeded', () => {
			const original = deepFreeze( {
				2916284: true,
				77203074: true,
			} );
			const state = deleting( original, {
				type: SITE_DELETE_SUCCESS,
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: false,
				77203074: true,
			} );
		} );

		test( 'should track request for deleting a site failed', () => {
			const original = deepFreeze( {
				2916284: false,
				77203074: true,
			} );
			const state = deleting( original, {
				type: SITE_DELETE_FAILURE,
				siteId: 77203074,
			} );

			expect( state ).to.eql( {
				2916284: false,
				77203074: false,
			} );
		} );
	} );

	describe( 'hasAllSitesList()', () => {
		test( 'should default false', () => {
			const state = hasAllSitesList( undefined, {} );

			expect( state ).to.be.false;
		} );

		test( 'should update on receiving all sites', () => {
			const state = hasAllSitesList( undefined, {
				type: SITES_RECEIVE,
			} );

			expect( state ).to.be.true;
		} );

		test( 'should not update on receiving a single site', () => {
			const state = hasAllSitesList( false, {
				type: SITE_RECEIVE,
			} );

			expect( state ).to.be.false;
		} );
	} );

	describe( '#updates', () => {
		const exampleUpdates = {
			plugins: 1,
			themes: 1,
			total: 2,
			translations: 0,
			wordpress: 0,
		};

		test( 'should reduce plugins and total updates count after successful plugin update', () => {
			const original = deepFreeze( {
				2916284: {
					updates: {
						plugins: 1,
						themes: 1,
						total: 4,
						translations: 1,
						wordpress: 1,
					},
				},
				77203074: {
					updates: exampleUpdates,
				},
			} );

			const state = items( original, {
				type: SITE_PLUGIN_UPDATED,
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: {
					updates: {
						plugins: 0,
						themes: 1,
						total: 3,
						translations: 1,
						wordpress: 1,
					},
				},
				77203074: {
					updates: exampleUpdates,
				},
			} );
		} );

		test( 'should load persisted state with valid updates', () => {
			const original = deepFreeze( {
				2916284: {
					ID: 2916284,
					name: 'Test Blog',
					updates: exampleUpdates,
				},
			} );

			const state = items( original, { type: DESERIALIZE } );
			expect( state ).to.eql( original );
		} );

		test( 'should return initial state when persisted state has invalid updates', () => {
			const original = deepFreeze( {
				2916284: {
					ID: 2916284,
					name: 'Test Blog',
					updates: { plugins: false },
				},
			} );

			const state = items( original, { type: DESERIALIZE } );
			expect( state ).to.be.null;
		} );
	} );
} );
