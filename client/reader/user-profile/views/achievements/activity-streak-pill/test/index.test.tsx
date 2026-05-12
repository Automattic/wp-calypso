/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActivityStreakPill } from '../index';
import type { EngagementStreak } from '@automattic/api-core';

const baseStreak: EngagementStreak = {
	current_streak: 12,
	longest_streak: 28,
	freezes_available: 1,
	freeze_used_date: null,
	next_freeze_in_days: 5,
};

describe( 'ActivityStreakPill', () => {
	test( 'renders nothing when streak is undefined', () => {
		const { container } = render( <ActivityStreakPill streak={ undefined } isOwnProfile /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'renders nothing when current_streak is 0 and not own profile', () => {
		const { container } = render(
			<ActivityStreakPill
				streak={ { ...baseStreak, current_streak: 0, longest_streak: 4 } }
				isOwnProfile={ false }
			/>
		);
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'renders the active two-line pill with headline and sub-line when current_streak > 0', () => {
		render( <ActivityStreakPill streak={ baseStreak } isOwnProfile /> );

		const group = screen.getByRole( 'group', { name: 'Activity streak' } );
		expect( group ).toBeVisible();
		expect( group ).toHaveTextContent( '12-day activity streak' );
		expect( group ).toHaveTextContent( 'Longest 28' );
	} );

	describe( 'freeze chip', () => {
		test( 'shows "1 freeze available" when freezes_available is 1', () => {
			render(
				<ActivityStreakPill streak={ { ...baseStreak, freezes_available: 1 } } isOwnProfile />
			);
			expect( screen.getByText( /1 freeze available/ ) ).toBeVisible();
		} );

		test( 'pluralizes "freezes available" for freezes_available > 1', () => {
			render(
				<ActivityStreakPill streak={ { ...baseStreak, freezes_available: 2 } } isOwnProfile />
			);
			expect( screen.getByText( /2 freezes available/ ) ).toBeVisible();
		} );

		test( 'shows "freeze used <relative>" when freeze_used_date is set and in cooldown', () => {
			jest.useFakeTimers().setSystemTime( new Date( '2026-05-11T12:00:00Z' ) );
			render(
				<ActivityStreakPill
					streak={ {
						...baseStreak,
						freezes_available: 0,
						freeze_used_date: '2026-05-10T08:00:00Z',
						next_freeze_in_days: 6,
					} }
					isOwnProfile
				/>
			);
			expect( screen.getByText( /freeze used .+ago|freeze used yesterday/i ) ).toBeVisible();
			jest.useRealTimers();
		} );

		test( 'shows "next freeze in N days" when no freeze banked and none recently used', () => {
			render(
				<ActivityStreakPill
					streak={ {
						...baseStreak,
						freezes_available: 0,
						freeze_used_date: null,
						next_freeze_in_days: 4,
					} }
					isOwnProfile
				/>
			);
			expect( screen.getByText( /next freeze in 4 days/i ) ).toBeVisible();
		} );

		test( 'pluralizes "next freeze in 1 day" (singular)', () => {
			render(
				<ActivityStreakPill
					streak={ {
						...baseStreak,
						freezes_available: 0,
						freeze_used_date: null,
						next_freeze_in_days: 1,
					} }
					isOwnProfile
				/>
			);
			expect( screen.getByText( /next freeze in 1 day(?!s)/i ) ).toBeVisible();
		} );
	} );

	test( 'renders the coaching CTA when current_streak is 0 and own profile', () => {
		render(
			<ActivityStreakPill
				streak={ { ...baseStreak, current_streak: 0, longest_streak: 0 } }
				isOwnProfile
			/>
		);
		const group = screen.getByRole( 'group', { name: 'Activity streak' } );
		expect( group ).toBeVisible();
		expect( group ).toHaveTextContent( 'Start your activity streak today' );
		expect( group ).toHaveTextContent( 'Like, comment, follow, or post — anything counts.' );
	} );

	test( 'omits the "Longest" segment when longest_streak equals current_streak', () => {
		render(
			<ActivityStreakPill
				streak={ { ...baseStreak, current_streak: 5, longest_streak: 5 } }
				isOwnProfile
			/>
		);
		const group = screen.getByRole( 'group', { name: 'Activity streak' } );
		expect( group ).toBeVisible();
		expect( group ).toHaveTextContent( '5-day activity streak' );
		expect( screen.queryByText( /Longest 5/ ) ).not.toBeInTheDocument();
	} );

	test( 'includes the "Longest" segment when longest_streak differs from current_streak', () => {
		render(
			<ActivityStreakPill
				streak={ { ...baseStreak, current_streak: 5, longest_streak: 28 } }
				isOwnProfile
			/>
		);
		expect( screen.getByText( /Longest 28/ ) ).toBeVisible();
	} );

	test( 'emoji glyphs in the active pill are hidden from assistive tech', () => {
		render( <ActivityStreakPill streak={ baseStreak } isOwnProfile /> );
		const emoji = screen.getByText( '🔥' );
		expect( emoji ).toHaveAttribute( 'aria-hidden', 'true' );
	} );

	describe( 'tooltip', () => {
		test( 'active pill is focusable so the tooltip is keyboard-accessible', () => {
			render( <ActivityStreakPill streak={ baseStreak } isOwnProfile /> );
			expect( screen.getByRole( 'group', { name: 'Activity streak' } ) ).toHaveAttribute(
				'tabindex',
				'0'
			);
		} );

		test( 'coaching CTA is not focusable (no tooltip)', () => {
			render(
				<ActivityStreakPill
					streak={ { ...baseStreak, current_streak: 0, longest_streak: 0 } }
					isOwnProfile
				/>
			);
			expect( screen.getByRole( 'group', { name: 'Activity streak' } ) ).not.toHaveAttribute(
				'tabindex'
			);
		} );

		test( 'hovering the active pill reveals streak-day and freeze explainers', async () => {
			const user = userEvent.setup();
			render( <ActivityStreakPill streak={ baseStreak } isOwnProfile /> );
			await user.hover( screen.getByRole( 'group', { name: 'Activity streak' } ) );
			expect(
				await screen.findByText( /Like, comment, follow, or post — anything counts\./i )
			).toBeVisible();
			expect(
				screen.getByText(
					/A streak freeze automatically protects your streak when you miss a day\./i
				)
			).toBeVisible();
		} );

		test( 'tooltip appends "earn one in N more active days" when next_freeze_in_days > 0', async () => {
			const user = userEvent.setup();
			render(
				<ActivityStreakPill
					streak={ {
						...baseStreak,
						freezes_available: 0,
						freeze_used_date: null,
						next_freeze_in_days: 4,
					} }
					isOwnProfile
				/>
			);
			await user.hover( screen.getByRole( 'group', { name: 'Activity streak' } ) );
			expect(
				await screen.findByText( /You will earn one in 4 more active days\./i )
			).toBeVisible();
		} );

		test( 'tooltip omits the earn-one append when next_freeze_in_days is 0', async () => {
			const user = userEvent.setup();
			render(
				<ActivityStreakPill
					streak={ {
						...baseStreak,
						freezes_available: 1,
						freeze_used_date: null,
						next_freeze_in_days: 0,
					} }
					isOwnProfile
				/>
			);
			await user.hover( screen.getByRole( 'group', { name: 'Activity streak' } ) );
			await screen.findByText(
				/A streak freeze automatically protects your streak when you miss a day\./i
			);
			expect( screen.queryByText( /You will earn one in/i ) ).not.toBeInTheDocument();
		} );
	} );
} );
