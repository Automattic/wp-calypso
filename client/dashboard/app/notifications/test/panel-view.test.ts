import { getInboxLocation } from '../panel-view';

describe( 'getInboxLocation', () => {
	test( 'opens the page on All from the All tab', () => {
		expect( getInboxLocation( { filterName: 'all' } ) ).toEqual( {
			to: '/notifications',
			search: { filter: undefined },
			state: { notificationsNoteId: undefined },
		} );
	} );

	test.each( [ 'unread', 'comments', 'follows', 'likes' ] )(
		'opens the page on the same tab from the %s tab',
		( filterName ) => {
			expect( getInboxLocation( { filterName } ) ).toEqual( {
				to: '/notifications',
				search: { filter: filterName },
				state: { notificationsNoteId: undefined },
			} );
		}
	);

	test( 'hands the open note to the page and keeps the tab', () => {
		expect( getInboxLocation( { filterName: 'comments', noteId: '42' } ) ).toEqual( {
			to: '/notifications',
			search: { filter: 'comments' },
			state: { notificationsNoteId: '42' },
		} );
	} );
} );
