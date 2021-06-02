/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom/extend-expect';

/**
 * Internal Dependencies
 */
import { logmeinUrl } from '../';

jest.mock( '@automattic/calypso-config', () => {
	const fn = () => {
		return [];
	};
	fn.isEnabled = jest.fn( () => true );
	return fn;
} );

describe( 'logmeinUrl', () => {
	const allow = [ 'https://test.blog' ];

	it( 'appends logmein', () => {
		expect( logmeinUrl( 'https://test.blog', allow ) ).toBe( 'https://test.blog/?logmein=direct' );
	} );

	it( 'works with other params', () => {
		expect( logmeinUrl( 'https://test.blog/?test=1', allow ) ).toBe(
			'https://test.blog/?test=1&logmein=direct'
		);
	} );

	it( 'works with paths', () => {
		expect( logmeinUrl( 'https://test.blog/path/abc/?test=1', allow ) ).toBe(
			'https://test.blog/path/abc/?test=1&logmein=direct'
		);
	} );

	it( 'overrides existing logmein', () => {
		expect( logmeinUrl( 'https://test.blog/path/abc/?logmein=0&test=1', allow ) ).toBe(
			'https://test.blog/path/abc/?logmein=direct&test=1'
		);
	} );

	it( 'ignores domains not in the allow list', () => {
		expect( logmeinUrl( 'https://not-test.blog', [ 'https://not-test.blog' ] ) ).toBe(
			'https://not-test.blog/?logmein=direct'
		);
		expect( logmeinUrl( 'https://test.blog', [ 'https://not-test.blog' ] ) ).toBe(
			'https://test.blog'
		);
	} );

	it( 'ignores all when allow list is empty', () => {
		expect( logmeinUrl( 'https://test.blog', [] ) ).toBe( 'https://test.blog' );
	} );
} );
