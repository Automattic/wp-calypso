/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import wpcom from 'calypso/lib/wp';
import DailyPostStreakCard from '../daily-post-streak-card';

jest.mock( 'calypso/lib/wp', () => ( {
	req: {
		get: jest.fn(),
	},
} ) );

const mockGet = jest.mocked( wpcom.req.get );

const streak = ( overrides = {} ) => ( {
	blog_id: 12345,
	url: 'https://side-project.example.com',
	current_streak: 14,
	...overrides,
} );

function renderCard( props: { streak: ReturnType< typeof streak > } ) {
	const client = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	return render(
		<QueryClientProvider client={ client }>
			<DailyPostStreakCard { ...props } />
		</QueryClientProvider>
	);
}

describe( 'DailyPostStreakCard', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'renders the static "Daily Post Streak" card title', () => {
		mockGet.mockReturnValue( new Promise( () => {} ) );

		renderCard( { streak: streak() } );

		expect( screen.getByRole( 'heading', { name: 'Daily Post Streak' } ) ).toBeVisible();
	} );

	test( 'renders the description with the day count and site link', async () => {
		mockGet.mockResolvedValue( {
			ID: 12345,
			URL: 'https://side-project.example.com',
			title: 'Side Project Blog',
		} );

		renderCard( { streak: streak() } );

		const link = await screen.findByRole( 'link', { name: 'Side Project Blog' } );
		expect( link ).toHaveAttribute( 'href', 'https://side-project.example.com' );
		expect( link ).toHaveAttribute( 'target', '_blank' );
		expect( link ).toHaveAttribute( 'rel', expect.stringContaining( 'noopener' ) );

		const description = link.closest( '.achievement-card__description' );
		expect( description ).not.toBeNull();
		expect( description ).toHaveTextContent( '14-day streak on Side Project Blog' );
	} );

	test( 'uses the URL hostname inside the description link while the site query is loading', () => {
		mockGet.mockReturnValue( new Promise( () => {} ) );

		renderCard( { streak: streak() } );

		const link = screen.getByRole( 'link', { name: 'side-project.example.com' } );
		expect( link ).toHaveAttribute( 'href', 'https://side-project.example.com' );
	} );

	test( 'decodes HTML entities in the site title', async () => {
		mockGet.mockResolvedValue( {
			ID: 12345,
			URL: 'https://side-project.example.com',
			title: 'Joe&#039;s &amp; Jane&#039;s Blog',
		} );

		renderCard( { streak: streak() } );

		const link = await screen.findByRole( 'link', { name: "Joe's & Jane's Blog" } );
		expect( link ).toHaveAttribute( 'href', 'https://side-project.example.com' );
	} );

	test( 'renders the site icon image when the site query returns one', async () => {
		mockGet.mockResolvedValue( {
			ID: 12345,
			URL: 'https://side-project.example.com',
			title: 'Side Project Blog',
			icon: { img: 'https://i0.wp.com/icon.png', ico: '' },
		} );

		const { container } = renderCard( { streak: streak() } );

		await screen.findByRole( 'link', { name: 'Side Project Blog' } );

		const img = container.querySelector( 'img.achievement-card__icon' ) as HTMLImageElement | null;
		expect( img ).not.toBeNull();
		expect( img?.src ).toBe( 'https://i0.wp.com/icon.png' );
	} );

	test( 'renders a globe fallback icon when no site icon is available', () => {
		mockGet.mockReturnValue( new Promise( () => {} ) );

		const { container } = renderCard( { streak: streak() } );

		expect( container.querySelector( 'img.achievement-card__icon' ) ).toBeNull();
		expect(
			container.querySelector( '.achievement-card__icon--site-fallback svg' )
		).not.toBeNull();
	} );
} );
