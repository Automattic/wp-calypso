import {
	EVENT_ADD_TO_CART_FAILURE,
	EVENT_CANCEL_BUTTON_CLICK,
	EVENT_CONTINUE_BUTTON_CLICK,
	getTracksEventName,
} from 'calypso/my-sites/email/add-mailboxes/get-tracks-event-name';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';

describe( 'getTracksEventName', () => {
	it.each( [
		[ EmailProvider.Titan, 'calypso_email_management_titan_add_mailboxes_add_to_cart_failure' ],
		[ EmailProvider.Google, 'calypso_email_management_gsuite_add_users_add_to_cart_failure' ],
	] )( 'returns the add-to-cart failure event for %s', ( provider, expected ) => {
		expect( getTracksEventName( provider, EVENT_ADD_TO_CART_FAILURE ) ).toEqual( expected );
	} );

	it( 'still returns the existing button click events', () => {
		expect( getTracksEventName( EmailProvider.Titan, EVENT_CONTINUE_BUTTON_CLICK ) ).toEqual(
			'calypso_email_management_titan_add_mailboxes_continue_button_click'
		);
		expect( getTracksEventName( EmailProvider.Google, EVENT_CANCEL_BUTTON_CLICK ) ).toEqual(
			'calypso_email_management_gsuite_add_users_cancel_button_click'
		);
	} );
} );
