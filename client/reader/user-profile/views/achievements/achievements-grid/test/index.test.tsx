/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import React from 'react';
import { useAchievementsQuery } from 'calypso/data/reader/use-achievements-query';
import AchievementsGrid from '../index';

jest.mock( 'calypso/data/reader/use-achievements-query' );

jest.mock( '../daily-post-streak-card', () => ( {
	__esModule: true,
	default: ( { streak }: { streak: { blog_id: number; current_streak: number } } ) => (
		<div
			data-testid="daily-post-streak-card"
			data-blog-id={ streak.blog_id }
			data-current-streak={ streak.current_streak }
		/>
	),
} ) );

const mockUseAchievementsQuery = useAchievementsQuery as jest.Mock;

const earned = ( overrides: Record< string, unknown > = {} ) => ( {
	achievement_id: 1,
	slug: 'first_post',
	name: 'First Post',
	description: 'You wrote your first post.',
	badge_prefix: 'p',
	level: 1,
	date_unlocked: '2026-01-15T00:00:00Z',
	date_created: '2025-01-01',
	image: 'https://example.com/first.png',
	is_secret: false,
	...overrides,
} );

const maskedSecret = ( overrides: Record< string, unknown > = {} ) => ( {
	achievement_id: 2,
	is_secret: true,
	is_redacted: true,
	date_unlocked: '2026-02-15T00:00:00Z',
	date_created: '2025-02-01',
	...overrides,
} );

const locked = ( overrides: Record< string, unknown > = {} ) => ( {
	achievement_id: 10,
	slug: 'comment_streak',
	name: 'Comment Streak',
	description: 'Comment for 7 days in a row.',
	badge_prefix: 'p',
	is_secret: false,
	date_created: '2026-01-01T00:00:00Z',
	...overrides,
} );

const lockedSecret = ( overrides: Record< string, unknown > = {} ) => ( {
	achievement_id: 99,
	is_secret: true,
	is_redacted: true,
	date_created: '2026-01-10T00:00:00Z',
	...overrides,
} );

const streak = ( overrides: Record< string, unknown > = {} ) => ( {
	blog_id: 111,
	url: 'https://my-blog.example.com',
	current_streak: 7,
	...overrides,
} );

const baseQueryReturn = {
	achievements: [],
	lockedAchievements: [],
	dailyPostStreaks: [],
	isLoading: false,
	isError: false,
	hasNextPage: false,
	isFetchingNextPage: false,
	fetchNextPage: jest.fn(),
};

function renderGrid( props: { userLogin: string; isOwnProfile: boolean } ) {
	const client = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	return render(
		<QueryClientProvider client={ client }>
			<AchievementsGrid { ...props } />
		</QueryClientProvider>
	);
}

describe( 'AchievementsGrid', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'renders the empty copy when both grids are empty', () => {
		mockUseAchievementsQuery.mockReturnValue( { ...baseQueryReturn } );

		renderGrid( { userLogin: 'me', isOwnProfile: true } );

		expect( screen.getByText( 'No achievements yet.' ) ).toBeVisible();
		expect( screen.queryByText( 'Locked achievements' ) ).not.toBeInTheDocument();
	} );

	test( 'renders earned grid only when not own profile and no locked', () => {
		mockUseAchievementsQuery.mockReturnValue( {
			...baseQueryReturn,
			achievements: [ earned() ],
		} );

		renderGrid( { userLogin: 'someone', isOwnProfile: false } );

		expect( screen.getByText( 'First Post' ) ).toBeVisible();
		expect( screen.queryByText( 'Locked achievements' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( /You.*unlocked them all/ ) ).not.toBeInTheDocument();
	} );

	test( 'renders the locked section heading and locked cards on own profile', () => {
		mockUseAchievementsQuery.mockReturnValue( {
			...baseQueryReturn,
			achievements: [ earned() ],
			lockedAchievements: [ locked() ],
		} );

		renderGrid( { userLogin: 'me', isOwnProfile: true } );

		expect( screen.getByRole( 'heading', { name: 'Locked achievements' } ) ).toBeVisible();
		expect( screen.getByText( 'Comment Streak' ) ).toBeVisible();
		expect( screen.getByText( 'Comment for 7 days in a row.' ) ).toBeVisible();
	} );

	test( 'hides the locked section on cross-user view even if API returns locked', () => {
		mockUseAchievementsQuery.mockReturnValue( {
			...baseQueryReturn,
			achievements: [ earned() ],
			lockedAchievements: [ locked() ],
		} );

		renderGrid( { userLogin: 'someone', isOwnProfile: false } );

		expect(
			screen.queryByRole( 'heading', { name: 'Locked achievements' } )
		).not.toBeInTheDocument();
		expect( screen.queryByText( 'Comment Streak' ) ).not.toBeInTheDocument();
	} );

	test( 'renders celebratory message when own profile, has earned, and zero locked', () => {
		mockUseAchievementsQuery.mockReturnValue( {
			...baseQueryReturn,
			achievements: [ earned() ],
			lockedAchievements: [],
		} );

		renderGrid( { userLogin: 'me', isOwnProfile: true } );

		expect( screen.getByText( /You.*unlocked them all/ ) ).toBeVisible();
		expect(
			screen.queryByRole( 'heading', { name: 'Locked achievements' } )
		).not.toBeInTheDocument();
	} );

	test( 'hides celebratory message on cross-user view', () => {
		mockUseAchievementsQuery.mockReturnValue( {
			...baseQueryReturn,
			achievements: [ earned() ],
			lockedAchievements: [],
		} );

		renderGrid( { userLogin: 'someone', isOwnProfile: false } );

		expect( screen.queryByText( /You.*unlocked them all/ ) ).not.toBeInTheDocument();
	} );

	test( 'renders locked secret with the secret title', () => {
		mockUseAchievementsQuery.mockReturnValue( {
			...baseQueryReturn,
			achievements: [ earned() ],
			lockedAchievements: [ lockedSecret() ],
		} );

		renderGrid( { userLogin: 'me', isOwnProfile: true } );

		expect( screen.getByText( 'Secret achievement' ) ).toBeVisible();
	} );

	test( 'renders masked secret in earned list with caption Unlocked: <time>', () => {
		mockUseAchievementsQuery.mockReturnValue( {
			...baseQueryReturn,
			achievements: [ earned(), maskedSecret() ],
			lockedAchievements: [],
		} );

		renderGrid( { userLogin: 'someone', isOwnProfile: false } );

		const secretCard = screen.getByText( 'Secret achievement' ).closest( '.achievement-card' );
		expect( secretCard ).not.toBeNull();
		expect( within( secretCard as HTMLElement ).getByText( /^Unlocked:/ ) ).toBeVisible();
	} );

	test( 'sorts earned + masked-secret entries by last unlock date descending', () => {
		mockUseAchievementsQuery.mockReturnValue( {
			...baseQueryReturn,
			achievements: [
				maskedSecret( { achievement_id: 2, date_unlocked: '2026-01-01' } ),
				earned( {
					achievement_id: 3,
					slug: 'm',
					name: 'Mid',
					date_unlocked: '2026-02-01',
				} ),
				earned( { achievement_id: 1, name: 'Zed', date_unlocked: '2026-03-01' } ),
			],
			lockedAchievements: [],
		} );

		const { container } = renderGrid( { userLogin: 'someone', isOwnProfile: false } );

		const earnedSection = container.querySelector( '.achievements-grid' );
		expect( earnedSection ).not.toBeNull();
		const titles = within( earnedSection as HTMLElement ).getAllByRole( 'heading', {
			level: 3,
		} );
		expect( titles.map( ( h ) => h.firstChild?.textContent ) ).toEqual( [
			'Zed',
			'Mid',
			'Secret achievement',
		] );
	} );

	test( 'sorts a leveled slug by its most recent unlock, not its first', () => {
		mockUseAchievementsQuery.mockReturnValue( {
			...baseQueryReturn,
			achievements: [
				earned( {
					achievement_id: 10,
					slug: 'multi',
					name: 'Multi',
					level: 1,
					date_unlocked: '2026-01-01',
				} ),
				earned( {
					achievement_id: 11,
					slug: 'multi',
					name: 'Multi',
					level: 2,
					date_unlocked: '2026-05-01',
				} ),
				earned( { achievement_id: 20, slug: 'solo', name: 'Solo', date_unlocked: '2026-03-01' } ),
			],
			lockedAchievements: [],
		} );

		const { container } = renderGrid( { userLogin: 'me', isOwnProfile: true } );

		const earnedSection = container.querySelector( '.achievements-grid' );
		const titles = within( earnedSection as HTMLElement ).getAllByRole( 'heading', {
			level: 3,
		} );
		expect( titles.map( ( h ) => h.firstChild?.textContent ) ).toEqual( [ 'Multi', 'Solo' ] );
	} );

	test( 'sorts locked entries by date_created ascending', () => {
		mockUseAchievementsQuery.mockReturnValue( {
			...baseQueryReturn,
			achievements: [ earned() ],
			lockedAchievements: [
				locked( { achievement_id: 20, name: 'Z', date_created: '2026-03-01' } ),
				locked( { achievement_id: 21, name: 'A', date_created: '2026-01-01' } ),
				locked( { achievement_id: 22, name: 'M', date_created: '2026-02-01' } ),
			],
		} );

		const { container } = renderGrid( { userLogin: 'me', isOwnProfile: true } );

		const lockedSection = container.querySelector( '.achievements-grid--locked' );
		expect( lockedSection ).not.toBeNull();
		const titles = within( lockedSection as HTMLElement ).getAllByRole( 'heading', {
			level: 3,
		} );
		expect( titles.map( ( h ) => h.textContent ) ).toEqual( [ 'A', 'M', 'Z' ] );
	} );

	test( 'new-user own profile with only locked entries renders the locked grid only', () => {
		mockUseAchievementsQuery.mockReturnValue( {
			...baseQueryReturn,
			achievements: [],
			lockedAchievements: [ locked() ],
		} );

		renderGrid( { userLogin: 'me', isOwnProfile: true } );

		expect( screen.queryByText( 'No achievements yet.' ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'heading', { name: 'Locked achievements' } ) ).toBeVisible();
		expect( screen.getByText( 'Comment Streak' ) ).toBeVisible();
	} );

	test( 'dedupes masked secrets in the earned list by achievement_id', () => {
		mockUseAchievementsQuery.mockReturnValue( {
			...baseQueryReturn,
			achievements: [
				earned(),
				maskedSecret( { achievement_id: 50, date_unlocked: '2026-02-01T00:00:00Z' } ),
				maskedSecret( { achievement_id: 50, date_unlocked: '2026-03-01T00:00:00Z' } ),
			],
			lockedAchievements: [],
		} );

		renderGrid( { userLogin: 'someone', isOwnProfile: false } );

		expect( screen.getAllByText( 'Secret achievement' ) ).toHaveLength( 1 );
	} );

	test( 'dedupes locked entries by achievement_id', () => {
		mockUseAchievementsQuery.mockReturnValue( {
			...baseQueryReturn,
			achievements: [ earned() ],
			lockedAchievements: [
				lockedSecret( { achievement_id: 77, date_created: '2026-01-01' } ),
				lockedSecret( { achievement_id: 77, date_created: '2026-02-01' } ),
			],
		} );

		renderGrid( { userLogin: 'me', isOwnProfile: true } );

		expect( screen.getAllByText( 'Secret achievement' ) ).toHaveLength( 1 );
	} );

	test( 'renders earned achievements from a legacy response that omits is_secret', () => {
		const { is_secret: _omit, ...legacy } = earned();
		mockUseAchievementsQuery.mockReturnValue( {
			...baseQueryReturn,
			achievements: [ legacy ],
			lockedAchievements: [],
		} );

		renderGrid( { userLogin: 'me', isOwnProfile: true } );

		expect( screen.getByText( 'First Post' ) ).toBeVisible();
		expect( screen.queryByText( 'No achievements yet.' ) ).not.toBeInTheDocument();
	} );

	test( 'renders a self-read earned secret (is_secret: true with full payload) as a regular card', () => {
		mockUseAchievementsQuery.mockReturnValue( {
			...baseQueryReturn,
			achievements: [
				earned( {
					achievement_id: 30,
					slug: 'hidden_gem',
					name: 'Hidden Gem',
					description: 'You found the easter egg.',
					is_secret: true,
				} ),
			],
			lockedAchievements: [],
		} );

		renderGrid( { userLogin: 'me', isOwnProfile: true } );

		expect( screen.getByText( 'Hidden Gem' ) ).toBeVisible();
		expect( screen.getByText( 'You found the easter egg.' ) ).toBeVisible();
		expect( screen.queryByText( 'Secret achievement' ) ).not.toBeInTheDocument();
	} );

	test( 'prepends a Years of Service card when yearsOfService > 0', () => {
		mockUseAchievementsQuery.mockReturnValue( {
			...baseQueryReturn,
			achievements: [ earned() ],
			yearsOfService: 5,
		} );

		const { container } = renderGrid( { userLogin: 'me', isOwnProfile: true } );

		expect( screen.getByText( 'Years of Service' ) ).toBeVisible();
		expect( screen.getByText( '5 years on WordPress.com.' ) ).toBeVisible();

		const titles = within( container.querySelector( '.achievements-grid' ) as HTMLElement )
			.getAllByRole( 'heading', { level: 3 } )
			.map( ( h ) => h.textContent );
		expect( titles[ 0 ] ).toBe( 'Years of Service' );

		expect(
			container.querySelector( '.achievement-card.is-years-of-service' )
		).toBeInTheDocument();
	} );

	test( 'pluralizes the Years of Service description for 1 year', () => {
		mockUseAchievementsQuery.mockReturnValue( {
			...baseQueryReturn,
			achievements: [ earned() ],
			yearsOfService: 1,
		} );

		renderGrid( { userLogin: 'me', isOwnProfile: true } );

		expect( screen.getByText( '1 year on WordPress.com.' ) ).toBeVisible();
	} );

	test( 'omits the Years of Service card when yearsOfService is 0 or undefined', () => {
		mockUseAchievementsQuery.mockReturnValue( {
			...baseQueryReturn,
			achievements: [ earned() ],
			yearsOfService: 0,
		} );

		renderGrid( { userLogin: 'me', isOwnProfile: true } );

		expect( screen.queryByText( 'Years of Service' ) ).not.toBeInTheDocument();
	} );

	test( 'still surfaces the Years of Service card when there are no other achievements', () => {
		mockUseAchievementsQuery.mockReturnValue( {
			...baseQueryReturn,
			achievements: [],
			lockedAchievements: [],
			yearsOfService: 3,
		} );

		renderGrid( { userLogin: 'me', isOwnProfile: true } );

		expect( screen.getByText( 'Years of Service' ) ).toBeVisible();
		expect( screen.queryByText( 'No achievements yet.' ) ).not.toBeInTheDocument();
	} );

	test( 'renders daily post streak cards on own profile before any earned achievements', () => {
		mockUseAchievementsQuery.mockReturnValue( {
			...baseQueryReturn,
			achievements: [ earned() ],
			dailyPostStreaks: [
				streak( { blog_id: 111, current_streak: 14 } ),
				streak( { blog_id: 222, current_streak: 4 } ),
			],
		} );

		const { container } = renderGrid( { userLogin: 'me', isOwnProfile: true } );

		const earnedGrid = container.querySelector( '.achievements-grid' );
		expect( earnedGrid ).not.toBeNull();

		const streakCards = within( earnedGrid as HTMLElement ).getAllByTestId(
			'daily-post-streak-card'
		);
		expect( streakCards ).toHaveLength( 2 );
		expect( streakCards.map( ( c ) => c.getAttribute( 'data-blog-id' ) ) ).toEqual( [
			'111',
			'222',
		] );

		const allCards = Array.from( earnedGrid?.children ?? [] );
		const firstTwo = allCards.slice( 0, 2 );
		expect(
			firstTwo.every( ( el ) => el.getAttribute( 'data-testid' ) === 'daily-post-streak-card' )
		).toBe( true );
	} );

	test( 'renders daily post streak cards immediately after the Years of Service card', () => {
		mockUseAchievementsQuery.mockReturnValue( {
			...baseQueryReturn,
			achievements: [ earned() ],
			yearsOfService: 5,
			dailyPostStreaks: [ streak( { blog_id: 111 } ) ],
		} );

		const { container } = renderGrid( { userLogin: 'me', isOwnProfile: true } );

		const earnedGrid = container.querySelector( '.achievements-grid' );
		const cards = Array.from( earnedGrid?.children ?? [] );

		expect( cards[ 0 ]?.classList.contains( 'is-years-of-service' ) ).toBe( true );
		expect( cards[ 1 ]?.getAttribute( 'data-testid' ) ).toBe( 'daily-post-streak-card' );
	} );

	test( 'hides daily post streak cards on cross-user view', () => {
		mockUseAchievementsQuery.mockReturnValue( {
			...baseQueryReturn,
			achievements: [ earned() ],
			dailyPostStreaks: [ streak() ],
		} );

		renderGrid( { userLogin: 'someone', isOwnProfile: false } );

		expect( screen.queryByTestId( 'daily-post-streak-card' ) ).not.toBeInTheDocument();
	} );

	test( 'renders the unlocked grid for an own profile with only streaks', () => {
		mockUseAchievementsQuery.mockReturnValue( {
			...baseQueryReturn,
			achievements: [],
			lockedAchievements: [],
			dailyPostStreaks: [ streak() ],
		} );

		renderGrid( { userLogin: 'me', isOwnProfile: true } );

		expect( screen.queryByText( 'No achievements yet.' ) ).not.toBeInTheDocument();
		expect( screen.getByTestId( 'daily-post-streak-card' ) ).toBeInTheDocument();
	} );

	test( 'shows the loading spinner while pages are still being fetched', () => {
		mockUseAchievementsQuery.mockReturnValue( {
			...baseQueryReturn,
			isLoading: true,
		} );

		renderGrid( { userLogin: 'me', isOwnProfile: true } );

		expect( screen.getByText( /Loading achievements/ ) ).toBeVisible();
	} );
} );
