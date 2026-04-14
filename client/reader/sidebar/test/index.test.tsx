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

		it( 'should call tracking functions when handler is provided', () => {
			const handler = {
				action: 'clicked_reader_sidebar_discover',
				gaEvent: 'Clicked Reader Sidebar Discover',
				tracksEvent: 'calypso_reader_sidebar_discover_clicked',
			};
			const path = '/discover';

			const clickHandler = instance.handleSidebarMenuClick( handler );
			clickHandler( {}, path );

			expect( recordAction ).toHaveBeenCalledWith( 'clicked_reader_sidebar_discover' );
			expect( recordGaEvent ).toHaveBeenCalledWith( 'Clicked Reader Sidebar Discover' );
			expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
				'calypso_reader_sidebar_discover_clicked'
			);
			expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
				'calypso_global_sidebar_menu_item_click',
				{
					section: 'read',
					path: '/discover',
				}
			);
		} );

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

		it( 'should handle search menu click with correct tracking keys', () => {
			const handler = {
				action: 'clicked_reader_sidebar_search',
				gaEvent: 'Clicked Reader Sidebar Search',
				tracksEvent: 'calypso_reader_sidebar_search_clicked',
			};
			const path = '/reader/search';

			const clickHandler = instance.handleSidebarMenuClick( handler );
			clickHandler( {}, path );

			expect( recordAction ).toHaveBeenCalledWith( 'clicked_reader_sidebar_search' );
			expect( recordGaEvent ).toHaveBeenCalledWith( 'Clicked Reader Sidebar Search' );
			expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
				'calypso_reader_sidebar_search_clicked'
			);
		} );

		it( 'should handle likes menu click with correct tracking keys', () => {
			const handler = {
				action: 'clicked_reader_sidebar_like_activity',
				gaEvent: 'Clicked Reader Sidebar Like Activity',
				tracksEvent: 'calypso_reader_sidebar_like_activity_clicked',
			};
			const path = '/activities/likes';

			const clickHandler = instance.handleSidebarMenuClick( handler );
			clickHandler( {}, path );

			expect( recordAction ).toHaveBeenCalledWith( 'clicked_reader_sidebar_like_activity' );
			expect( recordGaEvent ).toHaveBeenCalledWith( 'Clicked Reader Sidebar Like Activity' );
			expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
				'calypso_reader_sidebar_like_activity_clicked'
			);
		} );

		it( 'should handle conversations menu click with correct tracking keys', () => {
			const handler = {
				action: 'clicked_reader_sidebar_conversations',
				gaEvent: 'Clicked Reader Sidebar Conversations',
				tracksEvent: 'calypso_reader_sidebar_conversations_clicked',
			};
			const path = '/reader/conversations';

			const clickHandler = instance.handleSidebarMenuClick( handler );
			clickHandler( {}, path );

			expect( recordAction ).toHaveBeenCalledWith( 'clicked_reader_sidebar_conversations' );
			expect( recordGaEvent ).toHaveBeenCalledWith( 'Clicked Reader Sidebar Conversations' );
			expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
				'calypso_reader_sidebar_conversations_clicked'
			);
		} );

		it( 'should handle manage subscriptions menu click with correct tracking keys', () => {
			const handler = {
				action: 'clicked_reader_sidebar_manage_subscriptions',
				gaEvent: 'Clicked Reader Sidebar Manage Subscriptions',
				tracksEvent: 'calypso_reader_sidebar_manage_subscriptions_clicked',
			};
			const path = '/reader/subscriptions';

			const clickHandler = instance.handleSidebarMenuClick( handler );
			clickHandler( {}, path );

			expect( recordAction ).toHaveBeenCalledWith( 'clicked_reader_sidebar_manage_subscriptions' );
			expect( recordGaEvent ).toHaveBeenCalledWith( 'Clicked Reader Sidebar Manage Subscriptions' );
			expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
				'calypso_reader_sidebar_manage_subscriptions_clicked'
			);
		} );
	} );
} );
