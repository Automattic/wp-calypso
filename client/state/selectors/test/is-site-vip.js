/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isSiteVip } from '../';

describe( 'isSiteVip()', () => {
	it( 'returns null if site does not exist', () => {
		const isVip = isSiteVip( { sites: { items: { 5: { is_vip: true } } } }, 99999 );
		expect( isVip ).to.be.null;
	} );

	it( 'returns true if is_vip property of the site is true', () => {
		const isVip = isSiteVip( { sites: { items: { 5: { is_vip: true } } } }, 5 );
		expect( isVip ).to.be.true;
	} );

	it( 'returns false if is_vip property of the site is false', () => {
		const isVip = isSiteVip( { sites: { items: { 5: { is_vip: false } } } }, 5 );
		expect( isVip ).to.be.false;
	} );

	it( 'returns false if is_vip property of the site does not exist', () => {
		const isVip = isSiteVip( { sites: { items: { 5: {} } } }, 5 );
		expect( isVip ).to.be.null;
	} );
} );
