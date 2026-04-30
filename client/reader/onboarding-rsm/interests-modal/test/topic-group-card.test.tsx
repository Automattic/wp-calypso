/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import TopicGroupCard from '../topic-group-card';
import type { CuratedBlog } from '../../curated-blogs';

jest.mock( '@automattic/api-queries', () => {
	const actual = jest.requireActual( '@automattic/api-queries' );
	return {
		...actual,
		readFeedQuery: ( feedId: number ) => ( {
			...actual.readFeedQuery( feedId ),
			queryFn: async () => ( {
				image: `https://icons.example/${ feedId }.png`,
			} ),
		} ),
	};
} );

jest.mock( 'calypso/blocks/site-icon', () => ( {
	__esModule: true,
	SiteIcon: ( { alt }: { alt?: string } ) => <span data-testid="site-icon" aria-label={ alt } />,
} ) );

const blogs: CuratedBlog[] = [
	{ feed_ID: 1, site_ID: 11, site_URL: 'https://a.example', site_name: 'A' },
	{ feed_ID: 2, site_ID: 12, site_URL: 'https://b.example', site_name: 'B' },
	{ feed_ID: 3, site_ID: 13, site_URL: 'https://c.example', site_name: 'C' },
	{ feed_ID: 4, site_ID: 14, site_URL: 'https://d.example', site_name: 'D' },
	{ feed_ID: 5, site_ID: 15, site_URL: 'https://e.example', site_name: 'E' },
];

const defaultProps = {
	title: 'Food & Drinks',
	imageUrl: 'https://images.example/food.jpg',
	description: 'Recipes, restaurants, and more.',
	tags: [ 'food', 'drinks' ],
	blogs,
	isSubscribed: false,
	onSubscribe: jest.fn(),
};

describe( 'TopicGroupCard', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'renders the title, description, and image', () => {
		renderWithProvider( <TopicGroupCard { ...defaultProps } /> );

		expect( screen.getByRole( 'heading', { name: 'Food & Drinks' } ) ).toBeInTheDocument();
		expect( screen.getByText( 'Recipes, restaurants, and more.' ) ).toBeInTheDocument();
		const img = screen.getByRole( 'presentation', { hidden: true } ) as HTMLImageElement;
		expect( img ).toHaveAttribute( 'src', 'https://images.example/food.jpg' );
	} );

	it( 'renders avatars capped to 3 with a "+N" overflow indicator', () => {
		renderWithProvider( <TopicGroupCard { ...defaultProps } /> );

		// The mocked SiteIcon emits one node per blog avatar that we render.
		expect( screen.getAllByTestId( 'site-icon' ) ).toHaveLength( 3 );
		expect( screen.getByText( '+2' ) ).toBeInTheDocument();
	} );

	it( 'omits the overflow pill when blogs fit within the visible cap', () => {
		renderWithProvider( <TopicGroupCard { ...defaultProps } blogs={ blogs.slice( 0, 3 ) } /> );

		expect( screen.getAllByTestId( 'site-icon' ) ).toHaveLength( 3 );
		expect( screen.queryByText( /^\+\d/ ) ).not.toBeInTheDocument();
	} );

	it( 'calls onSubscribe when the Subscribe button is clicked', async () => {
		const onSubscribe = jest.fn();
		const user = userEvent.setup();
		renderWithProvider( <TopicGroupCard { ...defaultProps } onSubscribe={ onSubscribe } /> );

		await user.click( screen.getByRole( 'button', { name: /subscribe to food & drinks/i } ) );

		expect( onSubscribe ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'renders the "Subscribed" state with the button disabled and does not invoke onSubscribe on click', async () => {
		const onSubscribe = jest.fn();
		const user = userEvent.setup();
		renderWithProvider(
			<TopicGroupCard { ...defaultProps } isSubscribed onSubscribe={ onSubscribe } />
		);

		const button = screen.getByRole( 'button', { name: /subscribed to food & drinks/i } );
		// `accessibleWhenDisabled` keeps the button focusable and uses
		// aria-disabled rather than the native disabled attribute.
		expect( button ).toHaveAttribute( 'aria-disabled', 'true' );
		expect( screen.getByText( 'Subscribed' ) ).toBeInTheDocument();

		await user.click( button );
		expect( onSubscribe ).not.toHaveBeenCalled();
	} );
} );
