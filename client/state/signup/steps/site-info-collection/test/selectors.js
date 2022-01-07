import { expect } from 'chai';
import { initialState } from '../schema';
import { getSiteInfoCollectionData, getSiteInfoCollectionCurrentIndex } from '../selectors';

describe( 'selectors', () => {
	test( 'should return the initial state as a default state', () => {
		expect( getSiteInfoCollectionData( { signup: undefined } ) ).to.be.eql( initialState );
	} );

	test( 'should return the site info collection data from the state', () => {
		expect(
			getSiteInfoCollectionData( {
				signup: {
					steps: {
						siteInformationCollection: {
							siteTitle: 'test-site-title',
						},
					},
				},
			} )
		).to.be.eql( {
			siteTitle: 'test-site-title',
		} );
	} );

	test( 'should return the site info collection current index from the state', () => {
		expect(
			getSiteInfoCollectionCurrentIndex( {
				signup: {
					steps: {
						siteInformationCollection: {
							currentIndex: 100,
						},
					},
				},
			} )
		).to.be.eql( 100 );
	} );
} );
