/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { hasPosterUpdateError } from '../';

describe( 'hasPosterUpdateError()', () => {
	it( 'should return the poster error state', () => {
		const hasError = hasPosterUpdateError( {
			ui: {
				editor: {
					videoEditor: {
						hasPosterUpdateError: true
					}
				}
			}
		} );

		expect( hasError ).to.be.true;
	} );
} );
