/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getSelectedMedia } from '../';
import MediaQueryManager from 'lib/query-manager/media';

describe( 'getSelectedMedia()', () => {
	const item = {
		ID: 42,
		title: 'flowers'
	};

	const state = {
		media: {
			queries: {
				2916284: new MediaQueryManager( {
					items: {
						42: item
					}
				} )
			},
			selected: {
				2916284: [ 42 ]
			}
		}
	};

	it( 'should return null if the site is not in state', () => {
		expect( getSelectedMedia( state, 2916285 ) ).to.be.null;
	} );

	it( 'should return the selected media', () => {
		expect( getSelectedMedia( state, 2916284 ) ).to.eql( [ item ] );
	} );
} );
