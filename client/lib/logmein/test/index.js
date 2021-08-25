/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom/extend-expect';

import config from '@automattic/calypso-config';
import { createStore } from 'redux';
import {
	logmeinUrl,
	attachLogmein,
	logmeinOnClick,
	logmeinOnRightClick,
	setLogmeinReduxStore,
} from '../';

jest.mock( '@automattic/calypso-config', () => {
	const fn = () => '';
	fn.isEnabled = jest.fn( () => true );
	return fn;
} );

const store = createStore( ( state ) => state, {
	sites: {
		items: [
			{
				URL: 'https://test.blog',
				options: {
					is_mapped_domain: true,
					unmapped_url: 'https://example.wordpress.com',
				},
			},
		],
	},
	currentUser: {
		id: 'not null',
	},
} );

describe( 'logmein', () => {
	beforeEach( () => {
		config.isEnabled.mockImplementation( () => true );
		setLogmeinReduxStore( store );
	} );

	describe( 'logmeinUrl', () => {
		it( 'appends logmein', () => {
			expect( logmeinUrl( 'https://test.blog' ) ).toBe( 'https://test.blog/?logmein=direct' );
		} );

		it( 'works with other params', () => {
			expect( logmeinUrl( 'https://test.blog/?test=1' ) ).toBe(
				'https://test.blog/?test=1&logmein=direct'
			);
		} );

		it( 'works with paths', () => {
			expect( logmeinUrl( 'https://test.blog/path/abc/?test=1' ) ).toBe(
				'https://test.blog/path/abc/?test=1&logmein=direct'
			);
		} );

		it( 'overrides existing logmein', () => {
			expect( logmeinUrl( 'https://test.blog/path/abc/?logmein=0&test=1' ) ).toBe(
				'https://test.blog/path/abc/?logmein=direct&test=1'
			);
		} );

		it( 'ignores domains not in the users site list', () => {
			expect( logmeinUrl( 'https://not-test.blog' ) ).toBe( 'https://not-test.blog' );
		} );

		it( 'ignores all when allow list is empty', () => {
			const emptySitesStore = createStore( ( state ) => state, {
				sites: {
					items: [],
				},
				currentUser: {
					id: 'not null',
				},
			} );
			setLogmeinReduxStore( emptySitesStore );
			expect( logmeinUrl( 'https://test.blog' ) ).toBe( 'https://test.blog' );
		} );

		it( 'fallsback to url input when not enabled', () => {
			config.isEnabled.mockImplementation( () => false );
			expect( logmeinUrl( 'https://test.blog' ) ).toBe( 'https://test.blog' );
		} );

		it( 'fallsback to url input when not logged in', () => {
			const loggedOutStore = createStore( ( state ) => state, {
				sites: {
					items: [
						{
							URL: 'https://test.blog',
							options: {
								is_mapped_domain: true,
								unmapped_url: 'https://example.wordpress.com',
							},
						},
					],
				},
				currentUser: {
					id: null, // !== null under test
				},
			} );
			setLogmeinReduxStore( loggedOutStore );
			expect( logmeinUrl( 'https://test.blog' ) ).toBe( 'https://test.blog' );
		} );

		it( 'fallsback on url input when given invalid urls', () => {
			expect( logmeinUrl( undefined ) ).toBe( undefined );
		} );

		it( 'unmapped url usage is not replaced with mapped urls when possible', () => {
			expect( logmeinUrl( 'https://example.wordpress.com' ) ).not.toBe(
				'https://test.blog/?logmein=direct'
			);
			expect( logmeinUrl( 'https://example.wordpress.com' ) ).toBe(
				'https://example.wordpress.com'
			);
		} );

		it( 'fallback on url input when given a nonapplicable domain', () => {
			const nonapplicableStore = createStore( ( state ) => state, {
				sites: {
					items: [
						{
							URL: 'https://not.mapped',
							options: {
								is_mapped_domain: false,
								unmapped_url: 'https://example.wordpress.com',
							},
						},
						{
							URL: 'https://is.vip',
							is_vip: true,
							options: {
								is_mapped_domain: true,
								unmapped_url: 'https://example.wordpress.com',
							},
						},
						{
							URL: 'https://jetpack.domain',
							jetpack: true,
							options: {
								is_mapped_domain: true,
								unmapped_url: 'https://example.wordpress.com',
							},
						},
						{
							URL: 'https://atomic.domain',
							options: {
								is_automated_transfer: true,
								is_mapped_domain: true,
								unmapped_url: 'https://example.wordpress.com',
							},
						},
						{
							URL: 'https://redirecting.domain',
							options: {
								is_redirect: true,
								is_mapped_domain: true,
								unmapped_url: 'https://example.wordpress.com',
							},
						},
						{
							URL: 'https://wpcom.store',
							options: {
								is_wpcom_store: true,
								is_mapped_domain: true,
								unmapped_url: 'https://example.wordpress.com',
							},
						},
					],
				},
				currentUser: {
					id: 'not null',
				},
			} );
			setLogmeinReduxStore( nonapplicableStore );
			expect( logmeinUrl( 'https://unknown.blog' ) ).toBe( 'https://unknown.blog' );
			expect( logmeinUrl( 'https://not.mapped' ) ).toBe( 'https://not.mapped' );
			expect( logmeinUrl( 'https://is.vip' ) ).toBe( 'https://is.vip' );
			expect( logmeinUrl( 'https://jetpack.domain' ) ).toBe( 'https://jetpack.domain' );
			expect( logmeinUrl( 'https://atomic.domain' ) ).toBe( 'https://atomic.domain' );
			expect( logmeinUrl( 'https://redirecting.domain' ) ).toBe( 'https://redirecting.domain' );
			expect( logmeinUrl( 'https://wpcom.store' ) ).toBe( 'https://wpcom.store' );
		} );

		it( 'replaces http urls with https', () => {
			expect( logmeinUrl( 'http://test.blog' ) ).toBe( 'https://test.blog/?logmein=direct' );
		} );

		it( 'fallsback on url input when given relative urls', () => {
			expect( logmeinUrl( '/relative' ) ).toBe( '/relative' );

			// Making a trade off here, protocol-less urls are treated as relative.
			// Relatively safely support can be added for these if they're are prevelant but I don't think they are.
			expect( logmeinUrl( 'test.blog' ) ).toBe( 'test.blog' );
		} );

		it( 'sets logmein=direct param', () => {
			expect( logmeinUrl( 'https://test.blog' ) ).toBe( 'https://test.blog/?logmein=direct' );
		} );
	} );

	describe( 'attachLogmein', () => {
		const handlers = [];
		jest.spyOn( document, 'addEventListener' ).mockImplementation( ( event ) => {
			handlers.push( event );
			return true;
		} );

		it( 'attaches logmeinOnClick methods', () => {
			attachLogmein( store );
			expect( handlers ).toEqual( [ 'click', 'auxclick', 'contextmenu' ] );
		} );
	} );

	describe( 'logmeinOnClick', () => {
		it( 'updates closest links href to the new url', () => {
			const link = document.createElement( 'a' );
			link.href = 'https://test.blog';
			logmeinOnClick( { target: link } );
			expect( link.href ).toEqual( 'https://test.blog/?logmein=direct' );
		} );

		it( 'only updates once per domain', () => {
			const repeatstore = createStore( ( state ) => state, {
				sites: {
					items: [
						{
							URL: 'https://repeat.blog',
							options: {
								is_mapped_domain: true,
								unmapped_url: 'https://example.wordpress.com',
							},
						},
					],
				},
				currentUser: {
					id: 'not null',
				},
			} );
			setLogmeinReduxStore( repeatstore );

			const link = document.createElement( 'a' );
			link.href = 'https://repeat.blog/path/one';
			logmeinOnClick( { target: link } );
			expect( link.href ).toEqual( 'https://repeat.blog/path/one?logmein=direct' );
			link.href = 'https://repeat.blog/path/two';
			logmeinOnClick( { target: link } );

			// Link should only change on the first call against a host (path is irrelevant)
			expect( link.href ).toEqual( 'https://repeat.blog/path/two' );
		} );
	} );

	describe( 'logmeinOnRightClick', () => {
		it( 'updates closest links href to the new url', () => {
			const link = document.createElement( 'a' );
			link.href = 'https://test.blog';
			logmeinOnRightClick( { target: link } );
			expect( link.href ).toEqual( 'https://test.blog/?logmein=direct' );
			link.href = 'https://test.blog';
			logmeinOnRightClick( { target: link } );
			expect( link.href ).toEqual( 'https://test.blog/?logmein=direct' );
			link.href = 'https://test.blog';
			logmeinOnRightClick( { target: link } );
			expect( link.href ).toEqual( 'https://test.blog/?logmein=direct' );
		} );
	} );
} );
