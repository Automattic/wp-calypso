/**
 * @vitest-environment jsdom
 */

import { isEnabled } from '@automattic/calypso-config';
import { render, screen } from '@testing-library/react';
import { type Mock, vi } from 'vitest';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { ReaderSidebar } from '../index';
import type { ReactNode } from 'react';

vi.mock( '@automattic/calypso-config', () => {
	const config = vi.fn();
	const isEnabledMock = vi.fn( () => false );
	return {
		__esModule: true,
		default: Object.assign( config, { isEnabled: isEnabledMock } ),
		isEnabled: isEnabledMock,
	};
} );

vi.mock( 'calypso/reader/components/app-title', () => ( { default: () => <div>Reader</div> } ) );
vi.mock( 'calypso/reader/sidebar/reader-sidebar-recent', () => ( {
	default: () => <div>Following</div>,
} ) );
vi.mock( 'calypso/reader/sidebar/reader-sidebar-lists', () => ( {
	default: () => <li>Lists</li>,
} ) );
vi.mock( 'calypso/reader/sidebar/reader-sidebar-tags', () => ( { default: () => <li>Tags</li> } ) );
vi.mock( 'calypso/reader/sidebar/reader-sidebar-connections', () => ( {
	default: () => <li>Connections</li>,
} ) );
vi.mock( 'calypso/reader/sidebar/reader-sidebar-organizations', () => ( {
	default: () => <li>Organizations</li>,
} ) );
vi.mock( 'calypso/layout/sidebar/menu', () => ( {
	default: ( { children }: { children: ReactNode } ) => <ul>{ children }</ul>,
} ) );
vi.mock( 'calypso/layout/sidebar/item', () => ( {
	default: ( { label }: { label: ReactNode } ) => <li>{ label }</li>,
} ) );
vi.mock( 'calypso/layout/sidebar/separator', () => ( {
	default: () => <li aria-hidden="true" />,
} ) );

vi.mock( 'calypso/reader/stats', () => ( {
	recordAction: vi.fn(),
	recordGaEvent: vi.fn(),
} ) );

describe( 'ReaderSidebar', () => {
	const mockRecordReaderTracksEvent: Mock = vi.fn();
	const mockRecordTracksEvent: Mock = vi.fn();
	const defaultProps = {
		path: '/reader',
		translate: ( text: string ) => text,
		subscribedLists: [],
		followedTags: [],
		organizations: null,
		isFollowingOpen: false,
		isListsOpen: false,
		isTagsOpen: false,
		toggleFollowingVisibility: vi.fn(),
		toggleListsVisibility: vi.fn(),
		toggleTagsVisibility: vi.fn(),
		recordReaderTracksEvent: mockRecordReaderTracksEvent,
		recordTracksEvent: mockRecordTracksEvent,
		setNextLayoutFocus: vi.fn(),
	};

	beforeEach( () => {
		vi.clearAllMocks();
		vi.mocked( isEnabled ).mockImplementation( () => false );
	} );

	it( 'renders the four section labels as presentational headings', () => {
		const instance = new ReaderSidebar( defaultProps );

		render( instance.renderSidebarMenu() );

		[ 'Explore', 'Feeds', 'Library', 'Account' ].forEach( ( label ) => {
			expect( screen.getByText( label ) ).toBeVisible();
		} );
	} );

	describe( 'Conversations', () => {
		it( 'shows a single Conversations item without the WIP label', () => {
			const instance = new ReaderSidebar( defaultProps );

			render( instance.renderSidebarMenu() );

			expect( screen.getAllByText( 'Conversations' ) ).toHaveLength( 1 );
		} );

		it( 'sits in the main group above Feeds', () => {
			const instance = new ReaderSidebar( defaultProps );

			render( instance.renderSidebarMenu() );

			const conversations = screen.getByText( 'Conversations' );
			const feeds = screen.getByText( 'Feeds' );
			const library = screen.getByText( 'Library' );
			expect(
				conversations.compareDocumentPosition( feeds ) & Node.DOCUMENT_POSITION_FOLLOWING
			).toBeTruthy();
			expect(
				conversations.compareDocumentPosition( library ) & Node.DOCUMENT_POSITION_FOLLOWING
			).toBeTruthy();
		} );
	} );

	describe( 'Saved', () => {
		it( 'is shown once the saved posts feature is on', () => {
			vi.mocked( isEnabled ).mockImplementation(
				( feature: string ) => feature === 'reader/saved-posts'
			);

			render( new ReaderSidebar( defaultProps ).renderSidebarMenu() );

			expect( screen.getByText( 'Saved' ) ).toBeVisible();
		} );

		it( 'is hidden while the feature is off', () => {
			render( new ReaderSidebar( defaultProps ).renderSidebarMenu() );

			expect( screen.queryByText( 'Saved' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'title actions', () => {
		it( 'links to the new subscription page and to search', () => {
			const instance = new ReaderSidebar( defaultProps );

			render( instance.renderSidebarMenu() );

			expect( screen.getByRole( 'link', { name: 'New subscription' } ) ).toHaveAttribute(
				'href',
				'/reader/new'
			);
			expect( screen.getByRole( 'link', { name: 'Search' } ) ).toHaveAttribute(
				'href',
				'/discover/search'
			);
		} );

		it( 'marks the search action as selected on the search page', () => {
			const instance = new ReaderSidebar( { ...defaultProps, path: '/discover/search' } );

			render( instance.renderSidebarMenu() );

			expect( screen.getByRole( 'link', { name: 'Search' } ) ).toHaveClass( 'is-selected' );
			expect( screen.getByRole( 'link', { name: 'New subscription' } ) ).not.toHaveClass(
				'is-selected'
			);
		} );
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
