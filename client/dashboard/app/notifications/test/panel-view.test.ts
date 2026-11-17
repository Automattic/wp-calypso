import { getInboxLocation } from '../panel-view';

describe( 'getInboxLocation', () => {
	test( 'opens the page on All from the All tab', () => {
		expect( getInboxLocation( { filterName: 'all' } ) ).toEqual( {
			to: '/notifications',
			search: { filter: undefined },
		} );
	} );

	test.each( [ 'unread', 'comments', 'follows', 'likes' ] )(
		'opens the page on the same tab from the %s tab',
		( filterName ) => {
			expect( getInboxLocation( { filterName } ) ).toEqual( {
				to: '/notifications',
				search: { filter: filterName },
			} );
		}
	);

	test( 'opens the page on the open note and keeps the tab', () => {
		expect( getInboxLocation( { filterName: 'comments', noteId: '42' } ) ).toEqual( {
			to: '/notifications/$noteId',
			params: { noteId: '42' },
			search: { filter: 'comments' },
		} );
	} );
} );
