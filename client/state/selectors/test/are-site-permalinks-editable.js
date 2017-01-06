/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { areSitePermalinksEditable } from '../';

describe( 'areSitePermalinksEditable()', () => {
	it( 'should return false if site ID is not tracked', () => {
		const permalinksEditable = areSitePermalinksEditable( {
			sites: {
				items: {}
			}
		}, 77203199 );

		expect( permalinksEditable ).to.be.false;
	} );

	it( 'should return true if the permalinks structure contains postname', () => {
		const permalinksEditable = areSitePermalinksEditable( {
			sites: {
				items: {
					77203199: {
						ID: 77203199,
						options: {
							permalink_structure: '/%postname%/'
						}
					}
				}
			}
		}, 77203199 );

		expect( permalinksEditable ).to.be.true;
	} );

	it( 'should return false if the permalinks structure does not contain postname', () => {
		const permalinksEditable = areSitePermalinksEditable( {
			sites: {
				items: {
					77203199: {
						ID: 77203199,
						options: {
							permalink_structure: '/%year%/%month%/%ID%'
						}
					}
				}
			}
		}, 77203199 );

		expect( permalinksEditable ).to.be.false;
	} );
} );
