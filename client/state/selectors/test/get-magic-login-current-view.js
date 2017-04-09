/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getMagicLoginCurrentView } from '../';

describe( 'getMagicLoginCurrentView()', () => {
	it( 'should return null if there is no information yet', () => {
		const isShowing = getMagicLoginCurrentView( undefined );
		expect( isShowing ).to.be.null;
	} );

	it( 'should return the current view if set', () => {
		const isShowing = getMagicLoginCurrentView( {
			login: {
				magicLogin: {
					currentView: 'some random view',
				},
			},
		} );
		expect( isShowing ).to.equal( 'some random view' );
	} );
} );
