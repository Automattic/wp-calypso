/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isPosterUpdated } from '../';

describe( 'isPosterUpdated()', () => {
	it( 'should return the poster updated state', () => {
		const isUpdated = isPosterUpdated( {
			ui: {
				editor: {
					videoEditor: {
						isPosterUpdated: false
					}
				}
			}
		} );

		expect( isUpdated ).to.be.false;
	} );
} );
