/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getDraftSharing } from '../';

describe( 'getDraftSharing()', () => {
	const state = {
		draftSharing: {
			site1: {
				post1: {
					isEnabled: true,
					link: 'site1-post1-sharing-link',
				},
			},
		},
	};

	it( 'returns draft sharing state', () => {
		const draftSharing = getDraftSharing( state, 'site1', 'post1' );
		expect( draftSharing ).to.eql( {
			isEnabled: state.draftSharing.site1.post1.isEnabled,
			link: state.draftSharing.site1.post1.link,
		} );
	} );

	it( 'returns disabled draft sharing for non-existent state', () => {
		const draftSharing = getDraftSharing( state, 'non-existant-site', 'non-existant-post' );
		expect( draftSharing ).to.be.an( 'object' ).with.property( 'isEnabled' ).that.is.false;
	} );
} );
