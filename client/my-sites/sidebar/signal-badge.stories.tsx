/**
 * Storybook stories for `<SignalBadge>`.
 *
 * Coverage matches the Phase 1 task 1.5 priority chain (`numeric_badge →
 * count → badge`) plus the decorative side-channels (`inline_text`,
 * `inline_icon`). The visual contract anchor is `WordPress/wp-admin-sidebar`
 * v0.1.4 `src/browse-rail/styles.css` — single-digit values render as
 * 18×18 circles, multi-digit as pills, `#d63638` red on white.
 *
 * The badge sits inside an item row next to the title (mirrors the public
 * plugin's `target = '.wp-menu-name'` insertion point); the stories embed
 * it in a minimal "title row" wrapper so the badge sits at its real
 * relative position alongside text.
 */

import { SignalBadge } from './signal-badge';
import './signal-badge.scss';
import type { Meta, StoryObj } from '@storybook/react';
import type { AdminMenuSignal } from 'calypso/state/admin-menu/types';

const baseSignal: AdminMenuSignal = {
	count: null,
	numeric_badge: null,
	badge: null,
	inline_text: null,
	inline_icon: null,
	attention: false,
};

const ItemRow = ( { title, children }: { title: string; children: React.ReactNode } ) => (
	<div
		style={ {
			display: 'flex',
			alignItems: 'center',
			padding: '8px 12px',
			background: '#1d2327',
			color: '#f0f0f1',
			fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
			fontSize: 14,
			width: 272,
			boxSizing: 'border-box',
		} }
	>
		<span style={ { flex: '0 1 auto' } }>{ title }</span>
		<span style={ { display: 'inline-flex', alignItems: 'center' } }>{ children }</span>
	</div>
);

const meta: Meta< typeof SignalBadge > = {
	title: 'client/my-sites/sidebar/SignalBadge',
	component: SignalBadge,
	parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj< typeof SignalBadge >;

export const NumericBadgeSingleDigit: Story = {
	render: ( args ) => (
		<ItemRow title="WooCommerce">
			<SignalBadge { ...args } />
		</ItemRow>
	),
	args: {
		signal: { ...baseSignal, numeric_badge: 2 },
	},
};

export const NumericBadgeMultiDigit: Story = {
	render: ( args ) => (
		<ItemRow title="Updates">
			<SignalBadge { ...args } />
		</ItemRow>
	),
	args: {
		signal: { ...baseSignal, numeric_badge: 99 },
	},
};

export const CountFallsBackToBadge: Story = {
	// This is the issue-#39 fix path: numeric_badge null but count > 0 still
	// renders a badge so the group dot points to a visible child indicator.
	render: ( args ) => (
		<ItemRow title="Yoast SEO">
			<SignalBadge { ...args } />
		</ItemRow>
	),
	args: {
		signal: { ...baseSignal, count: 3 },
	},
};

export const StringBadge: Story = {
	render: ( args ) => (
		<ItemRow title="My item">
			<SignalBadge { ...args } />
		</ItemRow>
	),
	args: {
		signal: { ...baseSignal, badge: 'NEW' },
	},
};

export const InlineTextOnly: Story = {
	// Plan-tier label like "Premium" — decorative, does NOT contribute to attention.
	render: ( args ) => (
		<ItemRow title="Akismet">
			<SignalBadge { ...args } />
		</ItemRow>
	),
	args: {
		signal: { ...baseSignal, inline_text: 'Premium' },
	},
};

export const InlineIconOnly: Story = {
	// Decorative dashicon — appears next to the title, currentColor.
	render: ( args ) => (
		<ItemRow title="Health Check">
			<SignalBadge { ...args } />
		</ItemRow>
	),
	args: {
		signal: { ...baseSignal, inline_icon: 'dashicons-warning' },
	},
};

export const NumericBadgeAndInlineText: Story = {
	// Combination case — both a count badge AND a plan-tier label render side by side.
	render: ( args ) => (
		<ItemRow title="Jetpack">
			<SignalBadge { ...args } />
		</ItemRow>
	),
	args: {
		signal: { ...baseSignal, numeric_badge: 2, inline_text: 'BETA' },
	},
};

export const Empty: Story = {
	// No signal at all → the component renders nothing. The wrapping ItemRow
	// shows the row would still paint normally.
	render: ( args ) => (
		<ItemRow title="Posts">
			<SignalBadge { ...args } />
		</ItemRow>
	),
	args: {
		signal: null,
	},
};

export const NumericBadgeAccessibleLabel: Story = {
	// Verifies the badge has an SR-only aria-label for assistive tech (the
	// announcement is inspectable in Storybook via the a11y addon).
	render: ( args ) => (
		<ItemRow title="WooCommerce">
			<SignalBadge { ...args } />
		</ItemRow>
	),
	args: {
		signal: { ...baseSignal, numeric_badge: 5 },
		badgeLabel: '5 pending orders',
	},
};
