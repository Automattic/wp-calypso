/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { useInfiniteList } from 'calypso/reader/hooks/use-infinite-list';
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

const mockUseInfiniteList = useInfiniteList as jest.Mock;

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
} );
