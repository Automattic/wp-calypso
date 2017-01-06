/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isTransientMedia } from '../';

describe( 'isTransientMedia()', () => {
	it( 'should return false if the media is not known', () => {
		const isTransient = isTransientMedia( {
			media: {
				items: {}
			}
		}, 2916284, 42 );

		expect( isTransient ).to.be.false;
	} );

	it( 'should return false if the media has no transient flag', () => {
		const isTransient = isTransientMedia( {
			media: {
				items: {
					2916284: {
						42: { ID: 42, title: 'flowers' }
					}
				}
			}
		}, 2916284, 42 );

		expect( isTransient ).to.be.false;
	} );

	it( 'should return the true if truthy transient flag on media', () => {
		const isTransient = isTransientMedia( {
			media: {
				items: {
					2916284: {
						42: { ID: 42, title: 'flowers', 'transient': true }
					}
				}
			}
		}, 2916284, 42 );

		expect( isTransient ).to.be.true;
	} );
} );
