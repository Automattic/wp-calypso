/**
 * Internal dependencies
 */

import { hasUnseenNotifications as has } from 'calypso/state/selectors/has-unseen-notifications';

const hasUnseenWithNoUser = has( () => null );
const hasUnseenWithUserUnseen = has( () => ( { has_unseen_notes: true } ) );
const hasUnseenWithUserNoUnseen = has( () => ( { has_unseen_notes: false } ) );

test( 'assumes nothing on empty state', () => {
	expect( hasUnseenWithNoUser( {} ) ).not.toEqual( expect.anything() );
} );

test( 'follows unseen count', () => {
	expect( hasUnseenWithNoUser( { notificationsUnseenCount: 4 } ) ).toBe( true );
	expect( hasUnseenWithNoUser( { notificationsUnseenCount: 0 } ) ).toBe( false );
} );

test( 'prefers unseen count over user info', () => {
	expect( hasUnseenWithUserNoUnseen( { notificationsUnseenCount: 5 } ) ).toBe( true );
	expect( hasUnseenWithUserUnseen( { notificationsUnseenCount: 0 } ) ).toBe( false );
} );

test( 'falls back to user info', () => {
	expect( hasUnseenWithUserNoUnseen( {} ) ).toBe( false );
	expect( hasUnseenWithUserUnseen( {} ) ).toBe( true );
} );
