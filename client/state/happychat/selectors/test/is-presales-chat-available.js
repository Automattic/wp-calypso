/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isPresalesChatAvailable from '../is-presales-chat-available';

describe( '#isPresalesChatAvailable()', () => {
	test( 'should return false if presales chat is not available', () => {
		const isPresaleAvailable = isPresalesChatAvailable( {
			ui: {
				olark: {
					availability: {
						presale: false,
					},
				},
			},
		} );
		expect( isPresaleAvailable ).to.equal( false );
	} );
	test( 'should return true if presales chat is available', () => {
		const isPresaleAvailable = isPresalesChatAvailable( {
			ui: {
				olark: {
					availability: {
						presale: true,
					},
				},
			},
		} );
		expect( isPresaleAvailable ).to.equal( true );
	} );
} );
