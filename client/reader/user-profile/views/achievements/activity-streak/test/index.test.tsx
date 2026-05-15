/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockDate from 'mockdate';
import { ActivityStreak } from '../index';
import type { EngagementStreak } from '@automattic/api-core';

const TODAY = '2026-05-13';
const YESTERDAY = '2026-05-12';

beforeEach( () => {
	MockDate.set( `${ TODAY }T12:00:00Z` );
} );

afterEach( () => {
	MockDate.reset();
} );

const baseStreak: EngagementStreak = {
	current_streak: 12,
	longest_streak: 28,
	freezes_available: 0,
	freeze_used_date: null,
	next_freeze_in_days: 0,
	last_streak_date: TODAY,
};

function getBadgeLabel(): string {
	return document.querySelector( '.streak-badge__label' )?.textContent ?? '';
}

function getBadgeStateClass(): string | undefined {
	const badge = document.querySelector( '.streak-badge' );
	return Array.from( badge?.classList ?? [] ).find( ( cls ) => cls.startsWith( 'is-' ) );
}

describe( 'ActivityStreak', () => {
	test( 'renders nothing when streak is undefined', () => {
		const { container } = render( <ActivityStreak streak={ undefined } isOwnProfile /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'renders nothing when current_streak is 0 and not own profile', () => {
		const { container } = render(
			<ActivityStreak
				streak={ {
					...baseStreak,
					current_streak: 0,
					longest_streak: 0,
					last_streak_date: null,
				} }
				isOwnProfile={ false }
			/>
		);
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'always renders the "Activity Streak" title in active states', () => {
		render( <ActivityStreak streak={ baseStreak } isOwnProfile /> );
		expect( screen.getByText( 'Activity Streak' ) ).toBeVisible();
	} );

	describe( 'never-started (current=0, longest=0, own profile)', () => {
		const streak: EngagementStreak = {
			...baseStreak,
			current_streak: 0,
			longest_streak: 0,
			last_streak_date: null,
		};

		test( 'renders the start-today description', () => {
			render( <ActivityStreak streak={ streak } isOwnProfile /> );
			expect( screen.getByText( /Start your activity streak today/ ) ).toBeVisible();
		} );

		test( 'badge is inactive with the "Get started!" label', () => {
			render( <ActivityStreak streak={ streak } isOwnProfile /> );
			expect( getBadgeStateClass() ).toBe( 'is-inactive' );
			expect( getBadgeLabel() ).toBe( 'Get started!' );
		} );
	} );

	describe( 'lost (current=0, longest>0, own profile)', () => {
		const streak: EngagementStreak = {
			...baseStreak,
			current_streak: 0,
			longest_streak: 4,
			last_streak_date: '2026-05-01',
		};

		test( 'renders the restart description', () => {
			render( <ActivityStreak streak={ streak } isOwnProfile /> );
			expect( screen.getByText( /Restart your activity streak today/ ) ).toBeVisible();
		} );
	} );

	describe( 'pending (current>0, not engaged today, no freeze used yesterday)', () => {
		const streak: EngagementStreak = {
			...baseStreak,
			current_streak: 5,
			longest_streak: 5,
			last_streak_date: '2026-05-10',
		};

		test( 'renders the build-your-streak description', () => {
			render( <ActivityStreak streak={ streak } isOwnProfile /> );
			expect(
				screen.getByText( 'Like, comment, follow, or post every day to build your streak.' )
			).toBeVisible();
		} );

		test( 'badge is inactive with the "Don’t break it!" label', () => {
			render( <ActivityStreak streak={ streak } isOwnProfile /> );
			expect( getBadgeStateClass() ).toBe( 'is-inactive' );
			expect( getBadgeLabel() ).toBe( 'Don’t break it!' );
		} );
	} );

	describe( 'pending-frozen (current>0, not engaged today, freeze used yesterday)', () => {
		const streak: EngagementStreak = {
			...baseStreak,
			current_streak: 5,
			longest_streak: 5,
			last_streak_date: '2026-05-11',
			freeze_used_date: YESTERDAY,
		};

		test( 'renders the freeze-protected description', () => {
			const { container } = render( <ActivityStreak streak={ streak } isOwnProfile /> );
			expect( container.textContent ).toMatch( /A streak freeze protected your streak yesterday/ );
		} );

		test( 'wraps "streak freeze" with a Tooltip that reveals the explainer on hover', async () => {
			const user = userEvent.setup();
			render( <ActivityStreak streak={ streak } isOwnProfile /> );

			const term = screen.getByText( 'streak freeze' );
			expect( term ).toHaveClass( 'activity-streak__term' );

			await user.hover( term );
			expect(
				await screen.findByText(
					'A streak freeze automatically protects your streak when you miss a day.'
				)
			).toBeVisible();
		} );

		test( 'badge state is frozen with the "Streak frozen" label', () => {
			render( <ActivityStreak streak={ streak } isOwnProfile /> );
			expect( getBadgeStateClass() ).toBe( 'is-frozen' );
			expect( getBadgeLabel() ).toBe( 'Streak frozen' );
		} );
	} );

	describe( 'engaged (current>0, engaged today, not record)', () => {
		const streak: EngagementStreak = {
			...baseStreak,
			current_streak: 12,
			longest_streak: 28,
			last_streak_date: TODAY,
		};

		test( 'renders the keep-building description', () => {
			render( <ActivityStreak streak={ streak } isOwnProfile /> );
			expect(
				screen.getByText( 'Like, comment, follow, or post every day to keep building your streak.' )
			).toBeVisible();
		} );

		test( 'badge state is active with the streak label', () => {
			render( <ActivityStreak streak={ streak } isOwnProfile /> );
			expect( getBadgeStateClass() ).toBe( 'is-active' );
			expect( getBadgeLabel() ).toBe( 'You’re on a streak!' );
		} );
	} );

	describe( 'engaged-record (current>0, engaged today, longest on record ≥ 10)', () => {
		const streak: EngagementStreak = {
			...baseStreak,
			current_streak: 14,
			longest_streak: 14,
			last_streak_date: TODAY,
		};

		test( 'renders the congrats description with the day count', () => {
			render( <ActivityStreak streak={ streak } isOwnProfile /> );
			expect(
				screen.getByText( /Congrats on using WordPress\.com for 14 days in a row/ )
			).toBeVisible();
		} );

		test( 'badge state is longest-active with the on-fire label', () => {
			render( <ActivityStreak streak={ streak } isOwnProfile /> );
			expect( getBadgeStateClass() ).toBe( 'is-longest-active' );
			expect( getBadgeLabel() ).toBe( 'You’re on fire!' );
		} );
	} );

	describe( 'record stat', () => {
		function getRecordStat( container: HTMLElement ): HTMLElement | null {
			const icon = container.querySelector( '.activity-streak__stat-icon.is-record' );
			return ( icon?.parentElement as HTMLElement ) ?? null;
		}

		test( 'shows the longest streak as short text when current is below longest', () => {
			render(
				<ActivityStreak
					streak={ { ...baseStreak, current_streak: 12, longest_streak: 28 } }
					isOwnProfile
				/>
			);
			expect( screen.getByText( '28 days' ) ).toBeVisible();
		} );

		test( 'pluralizes "day" when longest is 1', () => {
			render(
				<ActivityStreak
					streak={ {
						...baseStreak,
						current_streak: 0,
						longest_streak: 1,
						last_streak_date: '2026-05-10',
					} }
					isOwnProfile
				/>
			);
			expect( screen.getByText( '1 day' ) ).toBeVisible();
		} );

		test( 'reveals the full sentence in a tooltip on hover', async () => {
			const user = userEvent.setup();
			const { container } = render(
				<ActivityStreak
					streak={ { ...baseStreak, current_streak: 12, longest_streak: 28 } }
					isOwnProfile
				/>
			);
			const stat = getRecordStat( container );
			expect( stat ).not.toBeNull();
			await user.hover( stat! );
			expect(
				await screen.findByText( /Your longest streak on record is 28 days\./ )
			).toBeVisible();
		} );

		test( 'shows the stat even when current matches longest', () => {
			const { container } = render(
				<ActivityStreak
					streak={ { ...baseStreak, current_streak: 14, longest_streak: 14 } }
					isOwnProfile
				/>
			);
			expect( getRecordStat( container ) ).not.toBeNull();
			expect( screen.getByText( '14 days' ) ).toBeVisible();
		} );

		test( 'hides the stat when longest_streak is 0', () => {
			const { container } = render(
				<ActivityStreak
					streak={ {
						...baseStreak,
						current_streak: 0,
						longest_streak: 0,
						last_streak_date: null,
					} }
					isOwnProfile
				/>
			);
			expect( getRecordStat( container ) ).toBeNull();
		} );
	} );

	describe( 'daily info', () => {
		const sevenDays = [
			{ date: '2026-05-07', status: 'missed' as const, freeze_earned: false },
			{ date: '2026-05-08', status: 'freeze_used' as const, freeze_earned: false },
			{ date: '2026-05-09', status: 'extended' as const, freeze_earned: false },
			{ date: '2026-05-10', status: 'extended' as const, freeze_earned: false },
			{ date: '2026-05-11', status: 'extended' as const, freeze_earned: false },
			{ date: '2026-05-12', status: 'extended' as const, freeze_earned: false },
			{ date: '2026-05-13', status: 'extended' as const, freeze_earned: true },
		];

		function getDays( container: HTMLElement ): HTMLElement[] {
			return Array.from( container.querySelectorAll( '.activity-streak__day' ) );
		}

		function getIconStateClass( dayEl: HTMLElement ): string | undefined {
			const icon = dayEl.querySelector( '.activity-streak__day-icon' );
			return Array.from( icon?.classList ?? [] ).find( ( cls ) => cls.startsWith( 'is-' ) );
		}

		test( 'renders 7 day cells when days has 7 entries', () => {
			const { container } = render(
				<ActivityStreak streak={ { ...baseStreak, days: sevenDays } } isOwnProfile />
			);
			expect( getDays( container ) ).toHaveLength( 7 );
		} );

		test( 'renders only the last 7 cells when days has more than 7 entries', () => {
			const tenDays = [
				{ date: '2026-05-04', status: 'missed' as const, freeze_earned: false },
				{ date: '2026-05-05', status: 'missed' as const, freeze_earned: false },
				{ date: '2026-05-06', status: 'missed' as const, freeze_earned: false },
				...sevenDays,
			];
			const { container } = render(
				<ActivityStreak streak={ { ...baseStreak, days: tenDays } } isOwnProfile />
			);
			const cells = getDays( container );
			expect( cells ).toHaveLength( 7 );
			expect( cells[ 0 ] ).toHaveAttribute( 'title', 'May 7, 2026' );
			expect( cells[ 6 ] ).toHaveAttribute( 'title', 'May 13, 2026' );
		} );

		test( 'renders fewer cells when days is shorter than 7', () => {
			const { container } = render(
				<ActivityStreak streak={ { ...baseStreak, days: sevenDays.slice( -3 ) } } isOwnProfile />
			);
			expect( getDays( container ) ).toHaveLength( 3 );
		} );

		test( 'renders no daily info row when days is undefined', () => {
			const { container } = render( <ActivityStreak streak={ baseStreak } isOwnProfile /> );
			expect( container.querySelector( '.activity-streak__daily-info' ) ).toBeNull();
		} );

		test( 'renders no daily info row when days is empty', () => {
			const { container } = render(
				<ActivityStreak streak={ { ...baseStreak, days: [] } } isOwnProfile />
			);
			expect( container.querySelector( '.activity-streak__daily-info' ) ).toBeNull();
		} );

		test( 'maps each status to the expected state class', () => {
			const { container } = render(
				<ActivityStreak streak={ { ...baseStreak, days: sevenDays } } isOwnProfile />
			);
			const cells = getDays( container );
			expect( getIconStateClass( cells[ 0 ] ) ).toBe( 'is-missed' );
			expect( getIconStateClass( cells[ 1 ] ) ).toBe( 'is-freeze-used' );
			expect( getIconStateClass( cells[ 2 ] ) ).toBe( 'is-extended' );
			expect( getIconStateClass( cells[ 6 ] ) ).toBe( 'is-freeze-earned' );
		} );

		test( 'shows the full localized date in the title attribute', () => {
			const { container } = render(
				<ActivityStreak streak={ { ...baseStreak, days: sevenDays } } isOwnProfile />
			);
			const lastCell = getDays( container ).at( -1 );
			expect( lastCell ).toHaveAttribute( 'title', 'May 13, 2026' );
		} );

		test( 'exposes a descriptive aria-label per cell', () => {
			const { container } = render(
				<ActivityStreak streak={ { ...baseStreak, days: sevenDays } } isOwnProfile />
			);
			const lastCell = getDays( container ).at( -1 );
			expect( lastCell ).toHaveAttribute(
				'aria-label',
				'Wed, May 13, 2026: active, streak freeze earned'
			);
		} );

		test( 'renders the abbreviated weekday', () => {
			const { container } = render(
				<ActivityStreak streak={ { ...baseStreak, days: sevenDays } } isOwnProfile />
			);
			const lastCell = getDays( container ).at( -1 );
			expect( lastCell?.querySelector( '.activity-streak__day-weekday' )?.textContent ).toBe(
				'Wed'
			);
		} );
	} );

	describe( 'freeze stat', () => {
		function getFreezeStat( container: HTMLElement ): HTMLElement | null {
			const icon = container.querySelector( '.activity-streak__stat-icon.is-freeze' );
			return ( icon?.parentElement as HTMLElement ) ?? null;
		}

		test( 'shows "N available" short text when freezes are banked', () => {
			render( <ActivityStreak streak={ { ...baseStreak, freezes_available: 2 } } isOwnProfile /> );
			expect( screen.getByText( '2 available' ) ).toBeVisible();
		} );

		test( 'pluralizes "available" for 1', () => {
			render( <ActivityStreak streak={ { ...baseStreak, freezes_available: 1 } } isOwnProfile /> );
			expect( screen.getByText( '1 available' ) ).toBeVisible();
		} );

		test( 'shows recharging short text when no freezes banked and recharging', () => {
			render(
				<ActivityStreak
					streak={ {
						...baseStreak,
						freezes_available: 0,
						next_freeze_in_days: 3,
					} }
					isOwnProfile
				/>
			);
			expect( screen.getByText( 'available in 3 days' ) ).toBeVisible();
		} );

		test( 'reveals the full sentence and the freeze explanation on hover', async () => {
			const user = userEvent.setup();
			const { container } = render(
				<ActivityStreak streak={ { ...baseStreak, freezes_available: 2 } } isOwnProfile />
			);
			const stat = getFreezeStat( container );
			expect( stat ).not.toBeNull();
			await user.hover( stat! );
			expect(
				await screen.findByText(
					/2 streak freezes available\.\s+A streak freeze automatically protects your streak when you miss a day\./
				)
			).toBeVisible();
		} );

		test( 'hides the stat when streak is 0', () => {
			const { container } = render(
				<ActivityStreak
					streak={ {
						...baseStreak,
						current_streak: 0,
						longest_streak: 0,
						freezes_available: 0,
						next_freeze_in_days: 0,
						last_streak_date: null,
					} }
					isOwnProfile
				/>
			);
			expect( getFreezeStat( container ) ).toBeNull();
		} );
	} );
} );
