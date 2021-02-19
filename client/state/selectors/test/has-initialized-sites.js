/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import hasInitializedSites from 'calypso/state/selectors/has-initialized-sites';

describe( 'hasInitializedSites()', () => {
	test( 'should return false if site selection has not occurred', () => {
		expect( hasInitializedSites( { ui: { siteSelectionInitialized: false } } ) ).to.be.false;
	} );
	test( 'should return true if site selection has occurred', () => {
		expect( hasInitializedSites( { ui: { siteSelectionInitialized: true } } ) ).to.be.true;
	} );
} );
