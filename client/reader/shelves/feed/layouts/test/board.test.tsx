/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { useInfiniteList } from 'calypso/reader/hooks/use-infinite-list';
import { getPostFields } from '../../post-fields';
import { BoardLayout } from '../board';
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
		title: 'Test post',
		excerptHtml: '',
		sourceName: 'Test site',
		postHref: '/reader/blogs/2/posts/1',
		isUnread: false,
	} ) ),
	getPostFieldKey: jest.fn( () => 'blog-1-2' ),
} ) );

jest.mock( 'calypso/reader/data/post/cache', () => ( {
	useCachedPost: jest.fn( () => ( { ID: 1, site_ID: 2 } ) ),
} ) );

jest.mock( 'calypso/blocks/reader-post-actions', () => ( {
	__esModule: true,
	default: () => null,
} ) );

const mockUseInfiniteList = useInfiniteList as jest.Mock;
const mockGetPostFields = getPostFields as jest.Mock;

beforeEach( () => {
	jest.clearAllMocks();
} );

describe( 'BoardLayout', () => {
	it( 'renders the excerpt in the direction its own text reads', () => {
		// `formatExcerpt` keeps only `dir` and `lang`, so an excerpt that carries neither has to
		// take its direction from the text.
		mockGetPostFields.mockReturnValue( {
			id: 1,
			key: 'blog-1-2',
			title: 'Test post',
			excerptHtml: '<p>שלום עולם</p>',
			sourceName: 'Test site',
			dayGroup: 'today',
			postHref: '/reader/blogs/2/posts/1',
			isUnread: false,
		} );
		mockUseInfiniteList.mockReturnValue( {
			getListProps: ( props: ListProps = {} ) => ( { ...props, style: props.style ?? {} } ),
			items: [ { index: 1, key: 'post-blog-1-2', start: 44, lane: 0 } ],
			measureElement: jest.fn(),
			scrollMargin: 0,
			scrollToIndex: jest.fn(),
		} );

		const { container } = render(
			<BoardLayout
				posts={ [ { ID: 1, site_ID: 2 } as ReadStreamPost ] }
				streamKey="shelf:tags"
				scrollElement={ null }
				hasMore={ false }
				isLoadingMore={ false }
				loadMore={ jest.fn() }
				restoreKey="work-id:board"
				isPostSelected={ () => false }
				selectPost={ jest.fn() }
				showTimestamp
			/>
		);

		const excerpt = container.querySelector< HTMLElement >( '.shelf-feed-board__excerpt' );
		expect( excerpt ).not.toBeNull();
		expect( excerpt?.style.direction ).toBe( 'rtl' );
	} );
} );
