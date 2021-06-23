/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom/extend-expect';

/**
 * External Dependencies
 */
import { createStore } from 'redux';

/**
 * Internal Dependencies
 */
import { logmeinUrl, attachLogmein, logmeinOnClick, logmeinOnRightClick } from '../';
import config from '@automattic/calypso-config';

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

describe( 'logmeinUrl', () => {
	beforeEach( () => {
		config.isEnabled.mockImplementation( () => true );
	} );

	it( 'appends logmein', () => {
		expect( logmeinUrl( 'https://test.blog', store ) ).toBe( 'https://test.blog/?logmein=direct' );
	} );

	it( 'works with other params', () => {
		expect( logmeinUrl( 'https://test.blog/?test=1', store ) ).toBe(
			'https://test.blog/?test=1&logmein=direct'
		);
	} );

	it( 'works with paths', () => {
		expect( logmeinUrl( 'https://test.blog/path/abc/?test=1', store ) ).toBe(
			'https://test.blog/path/abc/?test=1&logmein=direct'
		);
	} );

	it( 'overrides existing logmein', () => {
		expect( logmeinUrl( 'https://test.blog/path/abc/?logmein=0&test=1', store ) ).toBe(
			'https://test.blog/path/abc/?logmein=direct&test=1'
		);
	} );

	it( 'ignores domains not in the users site list', () => {
		expect( logmeinUrl( 'https://not-test.blog', store ) ).toBe( 'https://not-test.blog' );
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
		expect( logmeinUrl( 'https://test.blog', emptySitesStore ) ).toBe( 'https://test.blog' );
	} );

	it( 'fallsback to url input when not enabled', () => {
		config.isEnabled.mockImplementation( () => false );
		expect( logmeinUrl( 'https://test.blog', store ) ).toBe( 'https://test.blog' );
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
		expect( logmeinUrl( 'https://test.blog', loggedOutStore ) ).toBe( 'https://test.blog' );
	} );

	it( 'fallsback on url input when given relative urls', () => {
		expect( logmeinUrl( undefined, store ) ).toBe( undefined );
	} );

	it( 'unmapped url usage is replaced with mapped urls when possible', () => {
		expect( logmeinUrl( 'https://example.wordpress.com', store ) ).toBe(
			'https://test.blog/?logmein=direct'
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
		expect( logmeinUrl( 'https://unknown.blog', nonapplicableStore ) ).toBe(
			'https://unknown.blog'
		);
		expect( logmeinUrl( 'https://not.mapped', nonapplicableStore ) ).toBe( 'https://not.mapped' );
		expect( logmeinUrl( 'https://is.vip', nonapplicableStore ) ).toBe( 'https://is.vip' );
		expect( logmeinUrl( 'https://jetpack.domain', nonapplicableStore ) ).toBe(
			'https://jetpack.domain'
		);
		expect( logmeinUrl( 'https://atomic.domain', nonapplicableStore ) ).toBe(
			'https://atomic.domain'
		);
		expect( logmeinUrl( 'https://redirecting.domain', nonapplicableStore ) ).toBe(
			'https://redirecting.domain'
		);
		expect( logmeinUrl( 'https://wpcom.store', nonapplicableStore ) ).toBe( 'https://wpcom.store' );
	} );

	it( 'replaces http urls with https', () => {
		expect( logmeinUrl( 'http://test.blog', store ) ).toBe( 'https://test.blog/?logmein=direct' );
	} );

	it( 'sets logmein=direct param', () => {
		expect( logmeinUrl( 'http://test.blog', store ) ).toBe( 'https://test.blog/?logmein=direct' );
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
		expect( handlers ).toEqual( [ 'click', 'contextmenu' ] );
	} );
} );

describe( 'logmeinOnClick', () => {
	it( 'updates closest links href to the new url', () => {
		const link = document.createElement( 'a' );
		link.href = 'https://test.blog';
		logmeinOnClick( { target: link }, store );
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

		const link = document.createElement( 'a' );
		link.href = 'https://repeat.blog/path/one';
		logmeinOnClick( { target: link }, repeatstore );
		expect( link.href ).toEqual( 'https://repeat.blog/path/one?logmein=direct' );
		link.href = 'https://repeat.blog/path/two';
		logmeinOnClick( { target: link }, repeatstore );

		// Link should only change on the first call against a host (path is irrelevant)
		expect( link.href ).toEqual( 'https://repeat.blog/path/two' );
	} );
} );

describe( 'logmeinOnRightClick', () => {
	it( 'updates closest links href to the new url', () => {
		const link = document.createElement( 'a' );
		link.href = 'https://test.blog';
		logmeinOnRightClick( { target: link }, store );
		expect( link.href ).toEqual( 'https://test.blog/?logmein=direct' );
		link.href = 'https://test.blog';
		logmeinOnRightClick( { target: link }, store );
		expect( link.href ).toEqual( 'https://test.blog/?logmein=direct' );
		link.href = 'https://test.blog';
		logmeinOnRightClick( { target: link }, store );
		expect( link.href ).toEqual( 'https://test.blog/?logmein=direct' );
	} );
} );
