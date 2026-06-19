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
			/>
		);

		expect( mockUseInfiniteList ).toHaveBeenCalledWith(
			expect.objectContaining( { restoreKey: 'work-id:standard-list' } )
		);
	} );

	it( 'reuses extracted post fields when rendering a post row', () => {
		mockUseInfiniteList.mockReturnValueOnce( {
			getListProps: ( props: ListProps = {} ) => ( { ...props, style: props.style ?? {} } ),
			items: [ { index: 1, key: 'post-blog-1-2', start: 44 } ],
			measureElement: jest.fn(),
			scrollMargin: 0,
		} );

		render(
			<StandardListLayout
				posts={ [ { ID: 1, site_ID: 2 } as ReadStreamPost ] }
				streamKey="space:tags"
				scrollElement={ null }
				hasMore={ false }
				isLoadingMore={ false }
				loadMore={ jest.fn() }
				restoreKey="work-id:standard-list"
			/>
		);

		expect( mockGetPostFields ).toHaveBeenCalledTimes( 1 );
	} );
} );
