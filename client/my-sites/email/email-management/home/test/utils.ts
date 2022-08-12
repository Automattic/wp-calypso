import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	recordInboxNewMailboxUpsellClickEvent,
	ContextsForInboxNewMailboxUpsellClickEvent,
} from '../utils';

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

describe( 'recordInboxNewMailboxUpsellClickEvent()', () => {
	afterEach( () => {
		recordTracksEvent.mockClear();
	} );

	test( 'should send tracks event as user on titan free trial', () => {
		recordInboxNewMailboxUpsellClickEvent( ContextsForInboxNewMailboxUpsellClickEvent.Free );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_inbox_new_mailbox_upsell_click', {
			context: ContextsForInboxNewMailboxUpsellClickEvent.Free,
		} );
	} );

	test( 'should send tracks event as user with any paid subscription', () => {
		recordInboxNewMailboxUpsellClickEvent( ContextsForInboxNewMailboxUpsellClickEvent.Paid );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_inbox_new_mailbox_upsell_click', {
			context: ContextsForInboxNewMailboxUpsellClickEvent.Paid,
		} );
	} );
} );
