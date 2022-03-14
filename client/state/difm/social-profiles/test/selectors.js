import { expect } from 'chai';
import { getSocialProfiles } from '../selectors';

describe( 'selectors', () => {
	test( 'should return the initial state as a default state', () => {
		expect( getSocialProfiles( { difm: undefined } ) ).to.be.eql( {
			FACEBOOK: '',
			INSTAGRAM: '',
			LINKEDIN: '',
			TWITTER: '',
		} );
	} );

	test( 'should return the site info collection data from the state', () => {
		expect(
			getSocialProfiles( {
				difm: {
					socialProfiles: {
						FACEBOOK: 'test',
						INSTAGRAM: 'test',
						LINKEDIN: 'test',
						TWITTER: 'test',
					},
				},
			} )
		).to.be.eql( {
			FACEBOOK: 'test',
			INSTAGRAM: 'test',
			LINKEDIN: 'test',
			TWITTER: 'test',
		} );
	} );
} );
