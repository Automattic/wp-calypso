import { expect } from 'chai';
import { getWebsiteContent, getWebsiteContentDataCollectionIndex } from '../selectors';

describe( 'selectors', () => {
	test( 'should return the initial state as a default state', () => {
		expect( getWebsiteContent( { signup: undefined } ) ).to.be.eql( [
			{
				title: 'Home',
				content: '',
				images: [],
			},
			{
				title: 'About',
				content: '',
				images: [],
			},
			{
				title: 'Contact',
				content: '',
				images: [],
			},
		] );
	} );

	test( 'should return the web site content collection current index from the state', () => {
		expect(
			getWebsiteContentDataCollectionIndex( {
				signup: {
					steps: {
						websiteContentCollection: {
							currentIndex: 100,
						},
					},
				},
			} )
		).to.be.eql( 100 );
	} );
} );
