/**
 * @jest-environment jsdom
 */

import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { ReaderSidebar } from '../index';

jest.mock( 'calypso/reader/stats', () => ( {
	recordAction: jest.fn(),
	recordGaEvent: jest.fn(),
} ) );

describe( 'ReaderSidebar', () => {
	const mockRecordReaderTracksEvent: jest.Mock = jest.fn();
	const mockRecordTracksEvent: jest.Mock = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'handleSidebarMenuClick', () => {
		let instance: ReaderSidebar;

		beforeEach( () => {
			instance = new ReaderSidebar( {
				recordReaderTracksEvent: mockRecordReaderTracksEvent,
				recordTracksEvent: mockRecordTracksEvent,
			} );
		} );

		it.each( [
			{
				label: 'discover',
				action: 'clicked_reader_sidebar_discover',
				gaEvent: 'Clicked Reader Sidebar Discover',
				tracksEvent: 'calypso_reader_sidebar_discover_clicked',
				path: '/discover',
			},
			{
				label: 'search',
				action: 'clicked_reader_sidebar_search',
				gaEvent: 'Clicked Reader Sidebar Search',
				tracksEvent: 'calypso_reader_sidebar_search_clicked',
				path: '/reader/search',
			},
			{
				label: 'likes',
				action: 'clicked_reader_sidebar_like_activity',
				gaEvent: 'Clicked Reader Sidebar Like Activity',
				tracksEvent: 'calypso_reader_sidebar_like_activity_clicked',
				path: '/activities/likes',
			},
			{
				label: 'conversations',
				action: 'clicked_reader_sidebar_conversations',
				gaEvent: 'Clicked Reader Sidebar Conversations',
				tracksEvent: 'calypso_reader_sidebar_conversations_clicked',
				path: '/reader/conversations',
			},
			{
				label: 'manage subscriptions',
				action: 'clicked_reader_sidebar_manage_subscriptions',
				gaEvent: 'Clicked Reader Sidebar Manage Subscriptions',
				tracksEvent: 'calypso_reader_sidebar_manage_subscriptions_clicked',
				path: '/reader/subscriptions',
			},
		] )(
			'dispatches all four tracking calls when the $label handler fires',
			( { action, gaEvent, tracksEvent, path } ) => {
				const clickHandler = instance.handleSidebarMenuClick( {
					action,
					gaEvent,
					tracksEvent,
				} );
				clickHandler( {}, path );

				expect( recordAction ).toHaveBeenCalledWith( action );
				expect( recordGaEvent ).toHaveBeenCalledWith( gaEvent );
				expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith( tracksEvent );
				expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
					'calypso_global_sidebar_menu_item_click',
					{
						section: 'read',
						path,
					}
				);
			}
		);

		it( 'should not call tracking functions when handler is undefined', () => {
			const clickHandler = instance.handleSidebarMenuClick( undefined );
			clickHandler( {}, '/some-path' );

			expect( recordAction ).not.toHaveBeenCalled();
			expect( recordGaEvent ).not.toHaveBeenCalled();
			expect( mockRecordReaderTracksEvent ).not.toHaveBeenCalled();
			expect( mockRecordTracksEvent ).not.toHaveBeenCalled();
		} );

		it( 'should not call tracking functions when handler is null', () => {
			const clickHandler = instance.handleSidebarMenuClick( null );
			clickHandler( {}, '/some-path' );

			expect( recordAction ).not.toHaveBeenCalled();
			expect( recordGaEvent ).not.toHaveBeenCalled();
			expect( mockRecordReaderTracksEvent ).not.toHaveBeenCalled();
			expect( mockRecordTracksEvent ).not.toHaveBeenCalled();
		} );
	} );
} );
