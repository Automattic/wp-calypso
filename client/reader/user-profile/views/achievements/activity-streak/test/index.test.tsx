/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActivityStreak } from '../index';
import type { EngagementStreak } from '@automattic/api-core';

const TODAY = '2026-05-13';
const YESTERDAY = '2026-05-12';

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

	describe( 'record byline', () => {
		test( 'shows the longest streak when current is below longest', () => {
			render(
				<ActivityStreak
					streak={ { ...baseStreak, current_streak: 12, longest_streak: 28 } }
					isOwnProfile
				/>
			);
			expect( screen.getByText( 'Your longest streak on record is 28 days.' ) ).toBeVisible();
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
			expect( screen.getByText( 'Your longest streak on record is 1 day.' ) ).toBeVisible();
		} );

		test( 'hides the byline when current matches longest', () => {
			render(
				<ActivityStreak
					streak={ { ...baseStreak, current_streak: 14, longest_streak: 14 } }
					isOwnProfile
				/>
			);
			expect( screen.queryByText( /Your longest streak on record/ ) ).not.toBeInTheDocument();
		} );

		test( 'hides the byline when the user has never started', () => {
			render(
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
			expect( screen.queryByText( /Your longest streak on record/ ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'variation', () => {
		test( 'shows "N streak freezes available" when freezes are banked', () => {
			const { container } = render(
				<ActivityStreak streak={ { ...baseStreak, freezes_available: 2 } } isOwnProfile />
			);
			expect( container.textContent ).toContain( '2 streak freezes available.' );
		} );

		test( 'pluralizes "streak freeze available" for 1', () => {
			const { container } = render(
				<ActivityStreak streak={ { ...baseStreak, freezes_available: 1 } } isOwnProfile />
			);
			expect( container.textContent ).toContain( '1 streak freeze available.' );
		} );

		test( 'shows recharging copy when no freezes banked and recharging', () => {
			const { container } = render(
				<ActivityStreak
					streak={ {
						...baseStreak,
						freezes_available: 0,
						next_freeze_in_days: 3,
					} }
					isOwnProfile
				/>
			);
			expect( container.textContent ).toContain( 'Streak freeze available in 3 days.' );
		} );

		test( 'renders nothing when streak is 0', () => {
			render(
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
			expect( screen.queryByText( /streak freeze/i ) ).not.toBeInTheDocument();
		} );
	} );
} );
