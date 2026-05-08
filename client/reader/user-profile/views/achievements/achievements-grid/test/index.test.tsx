/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import React from 'react';
import AchievementsGrid from '../index';

jest.mock( 'calypso/data/reader/use-achievements-query' );

// eslint-disable-next-line @typescript-eslint/no-var-requires
const useAchievementsQuery = require( 'calypso/data/reader/use-achievements-query' )
	.useAchievementsQuery as jest.Mock;

const earned = ( overrides: Record< string, unknown > = {} ) => ( {
	achievement_id: 1,
	slug: 'first_post',
	name: 'First Post',
	description: 'You wrote your first post.',
	badge_prefix: 'p',
	level: 1,
	date: '2026-01-15T00:00:00Z',
	image: 'https://example.com/first.png',
	retired: false,
	is_secret: false,
	...overrides,
} );

const maskedSecret = ( overrides: Record< string, unknown > = {} ) => ( {
	achievement_id: 2,
	is_secret: true,
	date: '2026-02-15T00:00:00Z',
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
	date_created: '2026-01-10T00:00:00Z',
	...overrides,
} );

const baseQueryReturn = {
	achievements: [],
	lockedAchievements: [],
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
		useAchievementsQuery.mockReturnValue( { ...baseQueryReturn } );

		renderGrid( { userLogin: 'me', isOwnProfile: true } );

		expect( screen.getByText( 'No achievements yet.' ) ).toBeVisible();
		expect( screen.queryByText( 'Locked achievements' ) ).not.toBeInTheDocument();
	} );

	test( 'renders earned grid only when not own profile and no locked', () => {
		useAchievementsQuery.mockReturnValue( {
			...baseQueryReturn,
			achievements: [ earned() ],
		} );

		renderGrid( { userLogin: 'someone', isOwnProfile: false } );

		expect( screen.getByText( 'First Post' ) ).toBeVisible();
		expect( screen.queryByText( 'Locked achievements' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( /You.*unlocked them all/ ) ).not.toBeInTheDocument();
	} );

	test( 'renders the locked section heading and locked cards on own profile', () => {
		useAchievementsQuery.mockReturnValue( {
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
		useAchievementsQuery.mockReturnValue( {
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
		useAchievementsQuery.mockReturnValue( {
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
		useAchievementsQuery.mockReturnValue( {
			...baseQueryReturn,
			achievements: [ earned() ],
			lockedAchievements: [],
		} );

		renderGrid( { userLogin: 'someone', isOwnProfile: false } );

		expect( screen.queryByText( /You.*unlocked them all/ ) ).not.toBeInTheDocument();
	} );

	test( 'renders locked secret with the secret title', () => {
		useAchievementsQuery.mockReturnValue( {
			...baseQueryReturn,
			achievements: [ earned() ],
			lockedAchievements: [ lockedSecret() ],
		} );

		renderGrid( { userLogin: 'me', isOwnProfile: true } );

		expect( screen.getByText( 'Secret achievement' ) ).toBeVisible();
	} );

	test( 'renders masked secret in earned list with caption Unlocked: <time>', () => {
		useAchievementsQuery.mockReturnValue( {
			...baseQueryReturn,
			achievements: [ earned(), maskedSecret() ],
			lockedAchievements: [],
		} );

		renderGrid( { userLogin: 'someone', isOwnProfile: false } );

		const secretCard = screen.getByText( 'Secret achievement' ).closest( '.achievement-card' );
		expect( secretCard ).not.toBeNull();
		expect( within( secretCard as HTMLElement ).getByText( /^Unlocked:/ ) ).toBeVisible();
	} );

	test( 'sorts locked entries by date_created ascending', () => {
		useAchievementsQuery.mockReturnValue( {
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
		useAchievementsQuery.mockReturnValue( {
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
		useAchievementsQuery.mockReturnValue( {
			...baseQueryReturn,
			achievements: [
				earned(),
				maskedSecret( { achievement_id: 50, date: '2026-02-01T00:00:00Z' } ),
				maskedSecret( { achievement_id: 50, date: '2026-03-01T00:00:00Z' } ),
			],
			lockedAchievements: [],
		} );

		renderGrid( { userLogin: 'someone', isOwnProfile: false } );

		expect( screen.getAllByText( 'Secret achievement' ) ).toHaveLength( 1 );
	} );

	test( 'dedupes locked entries by achievement_id', () => {
		useAchievementsQuery.mockReturnValue( {
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
		useAchievementsQuery.mockReturnValue( {
			...baseQueryReturn,
			achievements: [ legacy ],
			lockedAchievements: [],
		} );

		renderGrid( { userLogin: 'me', isOwnProfile: true } );

		expect( screen.getByText( 'First Post' ) ).toBeVisible();
		expect( screen.queryByText( 'No achievements yet.' ) ).not.toBeInTheDocument();
	} );

	test( 'shows the loading spinner while pages are still being fetched', () => {
		useAchievementsQuery.mockReturnValue( {
			...baseQueryReturn,
			isLoading: true,
		} );

		renderGrid( { userLogin: 'me', isOwnProfile: true } );

		expect( screen.getByText( /Loading achievements/ ) ).toBeVisible();
	} );
} );
