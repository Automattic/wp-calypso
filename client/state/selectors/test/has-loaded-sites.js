/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import hasLoadedSites from 'calypso/state/selectors/has-loaded-sites';

describe( 'hasLoadedSites()', () => {
	it( 'should return false if site items are null', () => {
		expect( hasLoadedSites( { sites: { items: null } } ) ).to.be.false;
	} );
	it( 'should return true if site items are empty', () => {
		expect( hasLoadedSites( { sites: { items: {} } } ) ).to.be.true;
	} );
	it( 'should return true if sites exist in state', () => {
		expect( hasLoadedSites( { sites: { items: { 1: { ID: 1 } } } } ) ).to.be.true;
	} );
} );
