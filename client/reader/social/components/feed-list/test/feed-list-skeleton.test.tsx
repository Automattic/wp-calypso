/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { FeedListSkeleton } from '../feed-list-skeleton';

describe( 'FeedListSkeleton', () => {
	it( 'renders 3 skeleton rows', () => {
		const { container } = render( <FeedListSkeleton /> );
		expect( container.querySelectorAll( '.social-feed-list-skeleton__row' ) ).toHaveLength( 3 );
	} );
} );
