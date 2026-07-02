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
			/>
		);

		expect( mockReaderPostActions ).toHaveBeenCalledWith(
			expect.objectContaining( { post, onCommentClick: expect.any( Function ) } )
		);
	} );
} );
