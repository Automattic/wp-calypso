/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useUnsubscribeWithUndo } from '../use-unsubscribe-with-undo';

const mockFollowSite = jest.fn();
const mockUnfollowSite = jest.fn();
jest.mock( '../use-follow-mutations', () => ( {
	useFollowSite: () => ( { mutate: mockFollowSite } ),
	useUnfollowSite: () => ( { mutate: mockUnfollowSite } ),
} ) );

const mockRecordReaderTracksEvent = jest.fn();
jest.mock( 'calypso/state/reader/analytics/useRecordReaderTracksEvent', () => ( {
	useRecordReaderTracksEvent: () => mockRecordReaderTracksEvent,
} ) );

const mockDispatch = jest.fn();
jest.mock( 'calypso/state', () => ( {
	...jest.requireActual( 'calypso/state' ),
	useDispatch: () => mockDispatch,
} ) );

const params = {
	feedUrl: 'https://example.com/feed',
	siteName: 'Example Blog',
	source: 'recent',
};

const target = { feedUrl: params.feedUrl };
const eventProps = { feed_url: params.feedUrl, source: params.source };

// The notice action carries the Undo handler in its options, which is the only  way to exercise undo without rendering the global notices tree.
const getNotice = () => mockDispatch.mock.calls[ 0 ][ 0 ].notice;

describe( 'useUnsubscribeWithUndo', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'unsubscribes, records the tracks event, and shows an undo notice', () => {
		const { result } = renderHook( () => useUnsubscribeWithUndo() );

		result.current( params );

		expect( mockUnfollowSite ).toHaveBeenCalledWith( target );
		expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_unsubscribe_clicked',
			eventProps
		);
		expect( getNotice().text ).toBe( 'Success! You are now unsubscribed from "Example Blog".' );
		expect( getNotice().button ).toBe( 'Undo' );
	} );

	test( 'falls back to the feed URL when the site has no name', () => {
		const { result } = renderHook( () => useUnsubscribeWithUndo() );

		result.current( { ...params, siteName: undefined } );

		expect( getNotice().text ).toBe(
			`Success! You are now unsubscribed from "${ params.feedUrl }".`
		);
	} );

	test( 'undo re-subscribes and dismisses the notice', () => {
		const { result } = renderHook( () => useUnsubscribeWithUndo() );

		result.current( params );
		const notice = getNotice();
		notice.onClick();

		expect( mockFollowSite ).toHaveBeenCalledWith( target );
		expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_unsubscribe_undo_clicked',
			eventProps
		);
		expect( mockDispatch ).toHaveBeenCalledWith(
			expect.objectContaining( { type: 'NOTICE_REMOVE', noticeId: notice.noticeId } )
		);
	} );
} );
