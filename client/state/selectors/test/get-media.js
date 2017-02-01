/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getMedia } from '../';
import MediaQueryManager from 'lib/query-manager/media';

describe( 'getMedia()', () => {
	const query = {
		search: 'flower'
	};

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
					},
					queries: {
						[ MediaQueryManager.QueryKey.stringify( query ) ]: {
							itemKeys: [ 42 ]
						}
					}
				} )
			}
		}
	};

	it( 'should return null if the site is not in state', () => {
		const media = getMedia( state, 2916285, query );

		expect( media ).to.be.null;
	} );

	it( 'should return null if the query is not in state', () => {
		const media = getMedia( state, 2916284, {
			search: 'flowers'
		} );

		expect( media ).to.be.null;
	} );

	it( 'should return media', () => {
		const media = getMedia( state, 2916284, query );

		expect( media ).to.eql( [ item ] );
	} );
} );
