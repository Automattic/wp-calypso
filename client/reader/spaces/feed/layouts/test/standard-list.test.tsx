/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { useInfiniteList } from 'calypso/reader/hooks/use-infinite-list';
import { getPostFields } from '../../post-fields';
import { StandardListLayout } from '../standard-list';
import type { ReadStreamPost } from '@automattic/api-core';
import type { CSSProperties } from 'react';

type ListProps = {
	style?: CSSProperties;
};

jest.mock( 'calypso/reader/hooks/use-infinite-list', () => ( {
	useInfiniteList: jest.fn( () => ( {
		getListProps: ( props: ListProps = {} ) => ( { ...props, style: props.style ?? {} } ),
		items: [],
		measureElement: jest.fn(),
		scrollMargin: 0,
		scrollToIndex: jest.fn(),
	} ) ),
} ) );

jest.mock( '../../post-fields', () => ( {
	getPostFields: jest.fn( () => ( {
		id: 1,
		key: 'blog-1-2',
		title: 'Test post',
		excerptHtml: '',
		sourceName: 'Test site',
		dayGroup: 'today',
		postHref: '/reader/blogs/2/posts/1',
		isUnread: false,
	} ) ),
} ) );

// ReaderPostActions is a Redux/React-Query-connected block tested on its own and
// exercised through the real layout in `../../test/index.test.tsx`; stub it here
// so this unit test stays focused on the list structure and field wiring.
const mockReaderPostActions = jest.fn().mockReturnValue( null );
jest.mock( 'calypso/blocks/reader-post-actions', () => ( {
	__esModule: true,
	default: ( props: Record< string, unknown > ) => mockReaderPostActions( props ),
} ) );

const mockUseInfiniteList = useInfiniteList as jest.Mock;
const mockGetPostFields = getPostFields as jest.Mock;

beforeEach( () => {
	jest.clearAllMocks();
} );

describe( 'StandardListLayout', () => {
	it( 'passes its restore key to the virtualized list engine', () => {
		render(
			<StandardListLayout
				posts={ [] as ReadStreamPost[] }
				streamKey="space:tags"
				scrollElement={ null }
				hasMore={ false }
				isLoadingMore={ false }
				loadMore={ jest.fn() }
				restoreKey="work-id:standard-list"
				isPostSelected={ () => false }
				selectPost={ jest.fn() }
				showTimestamp
			/>
		);

		expect( mockUseInfiniteList ).toHaveBeenCalledWith(
			expect.objectContaining( { restoreKey: 'work-id:standard-list' } )
		);
	} );

	it( 'extracts post fields centrally and hands them to the row', () => {
		mockUseInfiniteList.mockReturnValueOnce( {
			getListProps: ( props: ListProps = {} ) => ( { ...props, style: props.style ?? {} } ),
			items: [ { index: 1, key: 'post-blog-1-2', start: 44 } ],
			measureElement: jest.fn(),
			scrollMargin: 0,
			scrollToIndex: jest.fn(),
		} );

		const post = { ID: 1, site_ID: 2 } as ReadStreamPost;
		render(
			<StandardListLayout
				posts={ [ post ] }
				streamKey="space:tags"
				scrollElement={ null }
				hasMore={ false }
				isLoadingMore={ false }
				loadMore={ jest.fn() }
				restoreKey="work-id:standard-list"
				isPostSelected={ () => false }
				selectPost={ jest.fn() }
				showTimestamp
			/>
		);

		// Fields are extracted once per post while building the rows and passed to
		// the row as props — the row never re-extracts them itself.
		expect( mockGetPostFields ).toHaveBeenCalledWith( post );
	} );

	it( 'renders post actions for the post row, wired to the post', () => {
		mockUseInfiniteList.mockReturnValueOnce( {
			getListProps: ( props: ListProps = {} ) => ( { ...props, style: props.style ?? {} } ),
			items: [ { index: 1, key: 'post-blog-1-2', start: 44 } ],
			measureElement: jest.fn(),
			scrollMargin: 0,
			scrollToIndex: jest.fn(),
		} );

		const post = { ID: 1, site_ID: 2 } as ReadStreamPost;
		render(
			<StandardListLayout
				posts={ [ post ] }
				streamKey="space:tags"
				scrollElement={ null }
				hasMore={ false }
				isLoadingMore={ false }
				loadMore={ jest.fn() }
				restoreKey="work-id:standard-list"
				isPostSelected={ () => false }
				selectPost={ jest.fn() }
				showTimestamp
			/>
		);

		expect( mockReaderPostActions ).toHaveBeenCalledWith(
			expect.objectContaining( { post, onCommentClick: expect.any( Function ) } )
		);
	} );

	it( 'hides the published time when showTimestamp is false (Discover)', () => {
		mockGetPostFields.mockReturnValue( {
			id: 1,
			key: 'blog-1-2',
			title: 'Test post',
			excerptHtml: '',
			sourceName: 'Test site',
			dayGroup: 'today',
			postHref: '/reader/blogs/2/posts/1',
			isUnread: false,
			publishedDate: '2026-06-01T00:00:00.000Z',
		} );
		const listWith = ( index: number ) => ( {
			getListProps: ( props: ListProps = {} ) => ( { ...props, style: props.style ?? {} } ),
			items: [ { index, key: 'post-blog-1-2', start: 44 } ],
			measureElement: jest.fn(),
			scrollMargin: 0,
			scrollToIndex: jest.fn(),
		} );

		const baseProps = {
			posts: [ { ID: 1, site_ID: 2 } as ReadStreamPost ],
			streamKey: 'space:tags',
			scrollElement: null,
			hasMore: false,
			isLoadingMore: false,
			loadMore: jest.fn(),
			restoreKey: 'work-id:standard-list',
			isPostSelected: () => false,
			selectPost: jest.fn(),
		};

		// Discover drops the day-group header, so the post is row 0; the posts feed
		// keeps the header, so the post is row 1.
		mockUseInfiniteList.mockReturnValue( listWith( 0 ) );
		const hidden = render( <StandardListLayout { ...baseProps } showTimestamp={ false } /> );
		expect( hidden.container.querySelector( 'time' ) ).toBeNull();
		hidden.unmount();

		mockUseInfiniteList.mockReturnValue( listWith( 1 ) );
		const shown = render( <StandardListLayout { ...baseProps } showTimestamp /> );
		expect( shown.container.querySelector( 'time' ) ).not.toBeNull();
	} );

	it( 'omits day-group headers when showTimestamp is false (Discover)', () => {
		// A single "today" post: grouped it builds a header row plus the post row;
		// on Discover the header is dropped, leaving only the post.
		mockGetPostFields.mockReturnValue( {
			id: 1,
			key: 'blog-1-2',
			title: 'Test post',
			excerptHtml: '',
			sourceName: 'Test site',
			dayGroup: 'today',
			postHref: '/reader/blogs/2/posts/1',
			isUnread: false,
		} );

		const baseProps = {
			posts: [ { ID: 1, site_ID: 2 } as ReadStreamPost ],
			streamKey: 'space:tags',
			scrollElement: null,
			hasMore: false,
			isLoadingMore: false,
			loadMore: jest.fn(),
			restoreKey: 'work-id:standard-list',
			isPostSelected: () => false,
			selectPost: jest.fn(),
		};

		// Assert on the row count handed to the engine; render nothing from it.
		mockUseInfiniteList.mockReturnValue( {
			getListProps: ( props: ListProps = {} ) => ( { ...props, style: props.style ?? {} } ),
			items: [],
			measureElement: jest.fn(),
			scrollMargin: 0,
			scrollToIndex: jest.fn(),
		} );

		render( <StandardListLayout { ...baseProps } showTimestamp /> );
		expect( mockUseInfiniteList ).toHaveBeenLastCalledWith(
			expect.objectContaining( { count: 2 } )
		);

		render( <StandardListLayout { ...baseProps } showTimestamp={ false } /> );
		expect( mockUseInfiniteList ).toHaveBeenLastCalledWith(
			expect.objectContaining( { count: 1 } )
		);
	} );
} );
