/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils';
import { SocialFeedList } from '../index';
import type { AtmosphereError } from '@automattic/api-core';

interface Item {
	id: string;
	label: string;
}

const items: Item[] = [
	{ id: 'a', label: 'first' },
	{ id: 'b', label: 'second' },
];

const baseProps = {
	itemKey: ( i: Item ) => i.id,
	renderItem: ( i: Item ) => <div>{ i.label }</div>,
	emptyTitle: 'Empty',
	emptyLine: 'Empty line',
};

describe( 'SocialFeedList', () => {
	it( 'renders the skeleton when isPending', () => {
		const { container } = render(
			<SocialFeedList< Item >
				items={ [] }
				isPending
				isError={ false }
				error={ null }
				hasNextPage={ false }
				isFetchingNextPage={ false }
				fetchNextPage={ () => {} }
				refetch={ () => {} }
				{ ...baseProps }
			/>
		);
		expect( container.querySelectorAll( '.social-feed-list-skeleton__row' ) ).toHaveLength( 3 );
	} );

	it( 'renders the empty state when items is [] and not pending', () => {
		render(
			<SocialFeedList< Item >
				items={ [] }
				isPending={ false }
				isError={ false }
				error={ null }
				hasNextPage={ false }
				isFetchingNextPage={ false }
				fetchNextPage={ () => {} }
				refetch={ () => {} }
				{ ...baseProps }
			/>
		);
		expect( screen.getByText( 'Empty' ) ).toBeVisible();
	} );

	it( 'renders items via renderItem', () => {
		render(
			<SocialFeedList< Item >
				items={ items }
				isPending={ false }
				isError={ false }
				error={ null }
				hasNextPage={ false }
				isFetchingNextPage={ false }
				fetchNextPage={ () => {} }
				refetch={ () => {} }
				{ ...baseProps }
			/>
		);
		expect( screen.getByText( 'first' ) ).toBeVisible();
		expect( screen.getByText( 'second' ) ).toBeVisible();
	} );

	it( 'calls fetchNextPage when sentinel comes into view', async () => {
		const fetchNextPage = jest.fn();
		render(
			<SocialFeedList< Item >
				items={ items }
				isPending={ false }
				isError={ false }
				error={ null }
				hasNextPage
				isFetchingNextPage={ false }
				fetchNextPage={ fetchNextPage }
				refetch={ () => {} }
				{ ...baseProps }
			/>
		);
		mockAllIsIntersecting( true );
		await waitFor( () => expect( fetchNextPage ).toHaveBeenCalled() );
	} );

	it( 'does not call fetchNextPage while a fetch is already in flight', () => {
		const fetchNextPage = jest.fn();
		render(
			<SocialFeedList< Item >
				items={ items }
				isPending={ false }
				isError={ false }
				error={ null }
				hasNextPage
				isFetchingNextPage
				fetchNextPage={ fetchNextPage }
				refetch={ () => {} }
				{ ...baseProps }
			/>
		);
		mockAllIsIntersecting( true );
		expect( fetchNextPage ).not.toHaveBeenCalled();
	} );

	it( 'renders an error state when isError is true', () => {
		render(
			<SocialFeedList< Item >
				items={ [] }
				isPending={ false }
				isError
				error={ { kind: 'upstream_unavailable' } as AtmosphereError }
				hasNextPage={ false }
				isFetchingNextPage={ false }
				fetchNextPage={ () => {} }
				refetch={ () => {} }
				{ ...baseProps }
			/>
		);
		expect( screen.getAllByText( /unreachable/i ).length ).toBeGreaterThan( 0 );
	} );
} );
