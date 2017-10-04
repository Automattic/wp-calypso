/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { hasInitializedSites } from '../';

describe( 'hasInitializedSites()', () => {
	it( 'should return false if site selection has not occurred', () => {
		expect( hasInitializedSites( { ui: { siteSelectionInitialized: false } } ) ).to.be.false;
	} );
	it( 'should return true if site selection has occurred', () => {
		expect( hasInitializedSites( { ui: { siteSelectionInitialized: true } } ) ).to.be.true;
	} );
} );
