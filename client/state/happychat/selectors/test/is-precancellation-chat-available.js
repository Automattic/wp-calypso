/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isPrecancellationChatAvailable from '../is-precancellation-chat-available';

describe( '#isPrecancellationChatAvailable()', () => {
	test( 'should return false if cancellation chat is not available', () => {
		const isPrecancellationAvailable = isPrecancellationChatAvailable( {
			ui: {
				olark: {
					availability: {
						precancellation: false,
					},
				},
			},
		} );
		expect( isPrecancellationAvailable ).to.equal( false );
	} );
	test( 'should return true if cancellation chat is available', () => {
		const isPrecancellationAvailable = isPrecancellationChatAvailable( {
			ui: {
				olark: {
					availability: {
						precancellation: true,
					},
				},
			},
		} );
		expect( isPrecancellationAvailable ).to.equal( true );
	} );
} );
