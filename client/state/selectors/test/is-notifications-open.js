/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isNotificationsOpen from 'calypso/state/selectors/is-notifications-open';

describe( 'isNotificationsOpen()', () => {
	test( 'returns true if notifications are open', () => {
		const isOpen = isNotificationsOpen( { ui: { isNotificationsOpen: true } } );
		expect( isOpen ).to.equal( true );
	} );
	test( 'returns false if notifications are closed', () => {
		const isOpen = isNotificationsOpen( { ui: { isNotificationsOpen: false } } );
		expect( isOpen ).to.equal( false );
	} );
	test( 'defaults to false if no data is available', () => {
		const isOpen = isNotificationsOpen( {} );
		expect( isOpen ).to.equal( false );
	} );
} );
